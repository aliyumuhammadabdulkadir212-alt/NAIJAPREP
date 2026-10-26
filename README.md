# Naija Scholar

An open-source, phone-friendly study platform for JAMB candidates and university students across Nigeria, first built for learners in Gombe State. It is a single-page static website built with HTML, CSS, vanilla JavaScript, and JSON. There is no backend, account, or paid service.

**Live app:** [https://aliyumuhammadabdulkadir212-alt.github.io/NAIJAPREP/](https://aliyumuhammadabdulkadir212-alt.github.io/NAIJAPREP/)

## Why this app

Students can face barriers such as the cost or availability of study materials, limited access to CBT practice, gaps in foundational topics, and difficulty finding relevant course resources. These challenges differ from student to student; this app offers a free place to practise, review explanations, and identify topics to revisit. It does not claim to explain every student's JAMB result or guarantee an exam outcome.

## What it includes

- A starting choice for JAMB candidates and university students.
- A searchable study library of 32 learning links, official portals, scholarships, and study resources. It now includes web development, database, networking, and computer-science material collected from the local SIWES manuals.
- A student-controlled study planner using target date, weekly availability, preferred study style, and self-rated confidence to schedule review blocks.
- Steady, Focused, and Intensive paces; the student can upgrade or change pace while keeping their daily time limit.
- A study streak tracker with a 28-day attendance grid, current streak, and best streak saved on the device.
- A CGPA calculator using the Nigerian 5-point scale, with course units, grades, and an estimated degree class.
- 15 JAMB subjects, syllabus topics, topic-tagged original practice questions, and explanations.
- Subject and topic practice, plus a timed CBT-style mock with English and three selected subjects.
- University faculty and course browsing, levels 100–500 (and 600 for Medicine), course-unit search, and General Studies units.
- Score summaries by subject and topic, weak-topic suggestions, and locally saved progress.
- Light and dark themes, responsive layouts, and a service worker that caches the app and its question data for offline use after the first visit.

All included questions are original practice questions, not real JAMB or university examination papers. The project is not affiliated with JAMB or any university. A year/source label appears only for question data that includes those fields.

## Run locally

The app is a static site with no backend, build step, or AI service. The Fetch API and service workers need an HTTP origin, so serve the folder with any static server.

On Windows, double-click `serve.cmd`, or run the PowerShell script directly:

```powershell
.\serve.ps1
```

It opens `http://localhost:8000` on this computer and prints an **Other devices** link, such as `http://192.168.1.162:8000/`, for phones, tablets, and other computers on the same Wi-Fi. If that port is busy, use `.\serve.ps1 -Port 8080`.

### Use on a phone or tablet

The easiest option is the live app link at the top of this page. It uses HTTPS, so the service worker can cache the app for offline use and the browser can install it to the home screen.

To use the local copy on another device:

1. Connect the device to the same Wi-Fi as the computer.
2. Run `serve.cmd` and open the **Other devices** link shown in the terminal.
3. If Windows Firewall blocks the connection, allow TCP port 8000 on all networks with `.\serve.ps1 -OpenFirewall` (this asks for administrator permission), or use the live link instead.

Some Wi-Fi networks isolate devices from each other. If the local link does not load on another device, run the firewall helper above or use the live link, which works everywhere.

Any other static server also works, for example:

```sh
python3 -m http.server 8000
# or
npx serve .
```

Then visit `http://localhost:8000`. You can also use the Live Server extension in VS Code. Opening `index.html` directly with `file://` will not load the JSON data.

## Deploy to GitHub Pages

1. Push the project to a GitHub repository with the Pages workflow enabled.
2. Open **Settings → Pages** and select **GitHub Actions** as the build and deployment source if GitHub has not selected it automatically.
3. Open the **Actions** tab and wait for **Deploy Naija Scholar to GitHub Pages** to complete.
4. Open the published URL shown in the workflow's `github-pages` deployment environment.

The app uses relative asset paths and works when hosted from a project subpath. HTTPS is provided by GitHub Pages and is needed for service worker support.

## Data layout

```text
data/
	jamb.json
	faculties.json
	units.json
	library.json
	jamb/<subject-slug>.json
	questions/<COURSE_CODE_WITH_UNDERSCORES>.json
```

Missing question files are handled as an empty bank and shown as “No questions yet, contribute on GitHub.” Content is kept out of the application code.

## Study plans

Study plans are generated in the browser from the student's own course choices, target date, available study time, preferred study method, and confidence ratings. Confidence is a self-assessment, not an IQ or intelligence test. Study preferences and completed sessions are saved in local storage on that device and can be edited or cleared from the browser. The planner runs entirely in the browser and sends no profile data anywhere.

## Contribute

Read [CONTRIBUTING.md](CONTRIBUTING.md) for the question format, content expectations, and pull-request steps. Only contribute material you created or are authorised to redistribute.

## Licence

MIT. See [LICENSE](LICENSE).
