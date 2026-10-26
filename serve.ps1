# Naija Scholar local preview server (Windows PowerShell)
# Usage: .\serve.ps1            (opens http://localhost:8000)
#        .\serve.ps1 -Port 8080

param(
  [int]$Port = 8000,
  [switch]$NoBrowser
)

$root = $PSScriptRoot.TrimEnd('\')
$prefix = "http://localhost:$Port/"

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)

try {
  $listener.Start()
} catch {
  Write-Host "Could not start a server on $prefix" -ForegroundColor Red
  Write-Host "Try another port, for example: .\serve.ps1 -Port 8080" -ForegroundColor Yellow
  exit 1
}

$types = @{
  '.html'       = 'text/html; charset=utf-8'
  '.css'        = 'text/css; charset=utf-8'
  '.js'         = 'text/javascript; charset=utf-8'
  '.json'       = 'application/json; charset=utf-8'
  '.webmanifest'= 'application/manifest+json; charset=utf-8'
  '.svg'        = 'image/svg+xml'
  '.png'        = 'image/png'
  '.jpg'        = 'image/jpeg'
  '.jpeg'       = 'image/jpeg'
  '.ico'        = 'image/x-icon'
  '.txt'        = 'text/plain; charset=utf-8'
}

Write-Host ""
Write-Host "Naija Scholar is running at $prefix" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop."
Write-Host ""

if (-not $NoBrowser) {
  Start-Process $prefix
}

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response
    $bytes = $null

    try {
      $path = [Uri]::UnescapeDataString($request.Url.AbsolutePath)
      if ($path -eq '/') { $path = '/index.html' }

      $full = [IO.Path]::GetFullPath((Join-Path $root $path.TrimStart('/')))
      $insideRoot = $full.StartsWith($root + '\', [StringComparison]::OrdinalIgnoreCase)

      if ($insideRoot -and (Test-Path -LiteralPath $full -PathType Leaf)) {
        $extension = [IO.Path]::GetExtension($full).ToLowerInvariant()
        $response.ContentType = if ($types.ContainsKey($extension)) { $types[$extension] } else { 'application/octet-stream' }
        $bytes = [IO.File]::ReadAllBytes($full)
      } else {
        $response.StatusCode = 404
        $response.ContentType = 'text/plain; charset=utf-8'
        $bytes = [Text.Encoding]::UTF8.GetBytes("Not found: $path")
      }
    } catch {
      $response.StatusCode = 500
      $response.ContentType = 'text/plain; charset=utf-8'
      $bytes = [Text.Encoding]::UTF8.GetBytes('Server error')
    }

    $response.ContentLength64 = $bytes.Length
    $response.OutputStream.Write($bytes, 0, $bytes.Length)
    $response.Close()
  }
} finally {
  $listener.Stop()
  $listener.Close()
}
