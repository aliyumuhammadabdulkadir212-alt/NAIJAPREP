# Naija Scholar

An open-source, phone-friendly study platform for JAMB candidates and university students across Nigeria, first built for learners in Gombe State. It is a single-page static website built with HTML, CSS, vanilla JavaScript, and JSON. There is no backend, account, or paid service.

## Why this app

Students can face barriers such as the cost or availability of study materials, limited access to CBT practice, gaps in foundational topics, and difficulty finding relevant course resources. These challenges differ from student to student; this app offers a free place to practise, review explanations, and identify topics to revisit. It does not claim to explain every student's JAMB result or guarantee an exam outcome.

## What it includes

- A starting choice for JAMB candidates and university students.
- A searchable study library of 22 learning links, official portals, scholarships, and study resources in the same app.
- A course-aware AI tutor that breaks problems into concise, numbered steps and adapts to a selected subject or degree course.
- A student-controlled study planner using target date, weekly availability, preferred study style, and self-rated confidence to schedule review blocks.
- Steady, Focused, and Intensive paces; the student can upgrade or change pace while keeping their daily time limit.
- 15 JAMB subjects, syllabus topics, topic-tagged original practice questions, and explanations.
- Subject and topic practice, plus a timed CBT-style mock with English and three selected subjects.
- University faculty and course browsing, levels 100–500 (and 600 for Medicine), course-unit search, and General Studies units.
- Score summaries by subject and topic, weak-topic suggestions, and locally saved progress.
- Light and dark themes, responsive layouts, and a service worker that caches the app and its question data for offline use after the first visit.
- Optional local Gemma tutoring and answer explanations through Ollama. Chat is sent to the student's own device, not a hosted AI service.

All included questions are original practice questions, not real JAMB or university examination papers. The project is not affiliated with JAMB or any university. A year/source label appears only for question data that includes those fields.

## Run locally

The Fetch API and service workers require an HTTP origin. From the project directory, run any static server, for example:

```sh
python -m http.server 8000
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

## AI tutor and study plans

The tutor uses [Ollama](https://ollama.com) and Gemma 3 on the student's device. Install Ollama, download Gemma with `ollama pull gemma3`, and start its local service. The browser calls `http://localhost:11434/api/chat` only when the student submits a question. Because the app is hosted on GitHub Pages, allow its origin in Ollama's `OLLAMA_ORIGINS` setting (for example, `https://aliyumuhammadabdulkadir212-alt.github.io`) and allow your local development origin when testing. If Ollama, the model, or browser access is unavailable, the tutor explains how to reconnect and does not send the question to a hosted service. Response speed depends on the student's device and model; the app does not promise a one-minute answer or a particular exam score.

Study plans are generated in the browser from the student's own course choices, target date, available study time, preferred study method, and confidence ratings. Confidence is a self-assessment, not an IQ or intelligence test. Study preferences and completed sessions are saved in local storage on that device and can be edited or cleared from the browser. The planner does not send profile data to Ollama.

## Contribute

Read [CONTRIBUTING.md](CONTRIBUTING.md) for the question format, content expectations, and pull-request steps. Only contribute material you created or are authorised to redistribute.

## Licence

MIT. See [LICENSE](LICENSE).
