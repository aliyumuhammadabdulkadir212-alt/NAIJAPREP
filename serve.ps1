# Naija Scholar local preview server (Windows PowerShell)
# Serves the app to this computer and to other devices on the same Wi-Fi.
#
# Usage:
#   .\serve.ps1
#   .\serve.ps1 -Port 8080
#   .\serve.ps1 -NoBrowser
#   .\serve.ps1 -OpenFirewall   (asks for administrator permission once)

param(
  [int]$Port = 8000,
  [switch]$NoBrowser,
  [switch]$OpenFirewall
)

$root = $PSScriptRoot.TrimEnd('\')

$serverCode = @'
using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

public static class NaijaLocalServer
{
    private static string rootPath;
    private static Dictionary<string, string> mimeTypes;
    private static TcpListener listener;
    private static volatile bool running;

    public static void Start(string root, int port)
    {
        rootPath = Path.GetFullPath(root).TrimEnd(Path.DirectorySeparatorChar);

        mimeTypes = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        mimeTypes[".html"] = "text/html; charset=utf-8";
        mimeTypes[".css"] = "text/css; charset=utf-8";
        mimeTypes[".js"] = "text/javascript; charset=utf-8";
        mimeTypes[".json"] = "application/json; charset=utf-8";
        mimeTypes[".webmanifest"] = "application/manifest+json; charset=utf-8";
        mimeTypes[".svg"] = "image/svg+xml";
        mimeTypes[".png"] = "image/png";
        mimeTypes[".jpg"] = "image/jpeg";
        mimeTypes[".jpeg"] = "image/jpeg";
        mimeTypes[".ico"] = "image/x-icon";
        mimeTypes[".txt"] = "text/plain; charset=utf-8";

        int workerThreads;
        int ioThreads;
        ThreadPool.GetMinThreads(out workerThreads, out ioThreads);
        ThreadPool.SetMinThreads(Math.Max(workerThreads, 32), Math.Max(ioThreads, 32));

        listener = new TcpListener(IPAddress.Any, port);
        listener.Start();
        running = true;
        Task.Run(new Action(AcceptLoop));
    }

    private static void AcceptLoop()
    {
        while (running)
        {
            TcpClient client;
            try
            {
                client = listener.AcceptTcpClient();
            }
            catch
            {
                break;
            }
            Task.Run(new Action(() => Handle(client)));
        }
    }

    private static void Handle(TcpClient client)
    {
        using (client)
        {
            try
            {
                client.ReceiveTimeout = 5000;
                client.SendTimeout = 10000;

                using (NetworkStream stream = client.GetStream())
                {
                    byte[] buffer = new byte[8192];
                    StringBuilder request = new StringBuilder();

                    while (request.Length < 65536)
                    {
                        int read = stream.Read(buffer, 0, buffer.Length);
                        if (read <= 0)
                        {
                            break;
                        }
                        request.Append(Encoding.ASCII.GetString(buffer, 0, read));
                        if (request.ToString().Contains("\r\n\r\n"))
                        {
                            break;
                        }
                    }

                    string requestText = request.ToString();
                    string[] lines = requestText.Split(new string[] { "\r\n" }, StringSplitOptions.None);
                    string[] parts = lines[0].Split(' ');
                    string method = parts.Length > 0 ? parts[0].ToUpperInvariant() : "";
                    string target = parts.Length > 1 ? parts[1] : "/";

                    byte[] body;
                    string status;
                    string mime;

                    if (method != "GET" && method != "HEAD")
                    {
                        body = Encoding.UTF8.GetBytes("Method not allowed");
                        status = "405 Method Not Allowed";
                        mime = "text/plain; charset=utf-8";
                    }
                    else
                    {
                        string path = "/";
                        try
                        {
                            Uri uri = new Uri("http://localhost" + target);
                            path = Uri.UnescapeDataString(uri.AbsolutePath);
                        }
                        catch
                        {
                        }

                        if (path == "/")
                        {
                            path = "/index.html";
                        }

                        string fullPath = Path.GetFullPath(Path.Combine(rootPath, path.TrimStart('/')));
                        bool insideRoot = fullPath.StartsWith(rootPath + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase);

                        if (insideRoot && File.Exists(fullPath))
                        {
                            body = File.ReadAllBytes(fullPath);
                            status = "200 OK";
                            string extension = Path.GetExtension(fullPath).ToLowerInvariant();
                            mime = mimeTypes.ContainsKey(extension) ? mimeTypes[extension] : "application/octet-stream";
                        }
                        else
                        {
                            body = Encoding.UTF8.GetBytes("Not found: " + path);
                            status = "404 Not Found";
                            mime = "text/plain; charset=utf-8";
                        }
                    }

                    string headers = "HTTP/1.1 " + status + "\r\n"
                        + "Content-Type: " + mime + "\r\n"
                        + "Content-Length: " + body.Length + "\r\n"
                        + "Cache-Control: no-store\r\n"
                        + "Connection: close\r\n\r\n";

                    byte[] headerBytes = Encoding.ASCII.GetBytes(headers);
                    stream.Write(headerBytes, 0, headerBytes.Length);
                    if (method != "HEAD")
                    {
                        stream.Write(body, 0, body.Length);
                    }
                    stream.Flush();
                }
            }
            catch
            {
                // Ignore disconnects, idle pre-connections, and malformed requests.
            }
        }
    }

    public static void Stop()
    {
        running = false;
        if (listener != null)
        {
            try
            {
                listener.Stop();
            }
            catch
            {
            }
        }
    }
}
'@

function Get-LanAddresses {
  $addresses = New-Object System.Collections.Generic.List[string]

  try {
    $routes = Get-NetRoute -DestinationPrefix '0.0.0.0/0' -ErrorAction Stop | Sort-Object RouteMetric
    foreach ($route in $routes) {
      $ip = Get-NetIPAddress -AddressFamily IPv4 -InterfaceIndex $route.ifIndex -ErrorAction SilentlyContinue |
        Select-Object -First 1 -ExpandProperty IPAddress
      if ($ip -and $ip -notlike '127.*' -and $ip -notlike '169.254.*' -and -not $addresses.Contains($ip)) {
        $addresses.Add($ip)
      }
    }
  } catch {
  }

  if ($addresses.Count -eq 0) {
    try {
      [System.Net.Dns]::GetHostAddresses([System.Net.Dns]::GetHostName()) | ForEach-Object {
        $ip = $_.IPAddressToString
        if ($_.AddressFamily -eq [System.Net.Sockets.AddressFamily]::InterNetwork -and
            -not [System.Net.IPAddress]::IsLoopback($_) -and
            $ip -notlike '169.254.*' -and
            -not $addresses.Contains($ip)) {
          $addresses.Add($ip)
        }
      }
    } catch {
    }
  }

  return $addresses
}

try {
  Add-Type -TypeDefinition $serverCode -Language CSharp -ErrorAction Stop
} catch {
  Write-Host "Could not prepare the local server." -ForegroundColor Red
  Write-Host $_.Exception.Message
  exit 1
}

try {
  [NaijaLocalServer]::Start($root, $Port)
} catch {
  Write-Host "Could not start a server on port $Port." -ForegroundColor Red
  Write-Host "Try another port, for example: .\serve.ps1 -Port 8080" -ForegroundColor Yellow
  exit 1
}

if ($OpenFirewall) {
  $ruleName = "Naija Scholar local preview ($Port)"
  $command = "netsh advfirewall firewall add rule name=`"$ruleName`" dir=in action=allow protocol=TCP localport=$Port profile=any"
  try {
    $process = Start-Process powershell -Verb RunAs -ArgumentList @('-NoProfile', '-Command', $command) -Wait -PassThru
    if ($process.ExitCode -eq 0) {
      Write-Host "Windows Firewall now allows TCP port $Port on all networks." -ForegroundColor Green
    } else {
      Write-Host "The firewall rule was not added (exit code $($process.ExitCode))." -ForegroundColor Yellow
    }
  } catch {
    Write-Host "Could not open the firewall prompt. Run PowerShell as administrator and allow TCP port $Port." -ForegroundColor Yellow
  }
}

$lanAddresses = Get-LanAddresses

Write-Host ""
Write-Host "Naija Scholar is running locally." -ForegroundColor Green
Write-Host ("  This device:    http://localhost:{0}/" -f $Port)
foreach ($ip in $lanAddresses) {
  Write-Host ("  Other devices:  http://{0}:{1}/" -f $ip, $Port)
}
if ($lanAddresses.Count -eq 0) {
  Write-Host "  Other devices:  no Wi-Fi/Ethernet address found. Connect to a network and restart." -ForegroundColor Yellow
}
Write-Host ""
Write-Host "On a phone, tablet, or another computer, open an 'Other devices' link while connected to the same Wi-Fi."
Write-Host "If a device cannot connect, allow TCP port $Port on all networks:"
Write-Host ("  .\serve.ps1 -Port {0} -OpenFirewall" -f $Port)
Write-Host "Some Wi-Fi networks isolate devices from each other; the GitHub Pages link works everywhere."
Write-Host "Press Ctrl+C to stop."
Write-Host ""

if (-not $NoBrowser) {
  Start-Process ("http://localhost:{0}/" -f $Port)
}

try {
  while ($true) {
    Start-Sleep -Seconds 3600
  }
} finally {
  [NaijaLocalServer]::Stop()
}
