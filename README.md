# Naija Scholar

An open-source, phone-friendly study platform for JAMB candidates and university students across Nigeria, first built for learners in Gombe State. It is a single-page static website built with HTML, CSS, vanilla JavaScript, and JSON. There is no backend, account, or paid service.

## Why this app

Students can face barriers such as the cost or availability of study materials, limited access to CBT practice, gaps in foundational topics, and difficulty finding relevant course resources. These challenges differ from student to student; this app offers a free place to practise, review explanations, and identify topics to revisit. It does not claim to explain every student's JAMB result or guarantee an exam outcome.

## What it includes

- A starting choice for JAMB candidates and university students.
- A searchable study library of 22 learning links, official portals, scholarships, and study resources in the same app.
- 15 JAMB subjects, syllabus topics, topic-tagged original practice questions, and explanations.
- Subject and topic practice, plus a timed CBT-style mock with English and three selected subjects.
- University faculty and course browsing, levels 100–500 (and 600 for Medicine), course-unit search, and General Studies units.
- Score summaries by subject and topic, weak-topic suggestions, and locally saved progress.
- Light and dark themes, responsive layouts, and a service worker that caches the app and its question data for offline use after the first visit.
- An optional local Gemma explanation using Ollama. It is off by default and only connects to `localhost` when explicitly enabled.

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

## Optional local AI

Install [Ollama](https://ollama.com), start a local Gemma model (for example, `ollama run gemma3`), then enable **Explain with local AI** after answering a question. The browser sends the question and its explanation to `http://localhost:11434/api/generate`. This is optional; browser CORS or local service settings may prevent the request, in which case the app shows a clear unavailable message. No question data is sent to a hosted AI service.

## Contribute

Read [CONTRIBUTING.md](CONTRIBUTING.md) for the question format, content expectations, and pull-request steps. Only contribute material you created or are authorised to redistribute.

## Licence

MIT. See [LICENSE](LICENSE).
