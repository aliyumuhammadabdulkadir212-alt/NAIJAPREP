# Contributing questions

Thank you for helping students practise. This project uses original practice questions and contributor-authorised study material. Do not copy or upload copyrighted JAMB or university examination papers, answer keys, or textbook passages without permission. Do not imply that practice content is an official past paper.

## Add a JAMB question

1. Find the subject slug and syllabus topic in `data/jamb.json`.
2. Edit or create `data/jamb/<subject-slug>.json` (for example, `data/jamb/biology.json`).
3. Add a question object to the JSON array using the schema below.

## Add a university question

1. Find or add the course unit in `data/units.json`.
2. Add a JSON array at `data/questions/<COURSE_CODE_WITH_UNDERSCORES>.json`, such as `CSC_201.json` or `GST_101.json`.
3. Keep question codes consistent with the unit listing.

## Question format

```json
{
  "id": "BIO-001",
  "topic": "Cell biology",
  "q": "Which organelle contains chlorophyll?",
  "options": ["Nucleus", "Chloroplast", "Ribosome", "Vacuole"],
  "answer": 1,
  "explanation": "Chloroplasts contain chlorophyll for photosynthesis."
}
```

Each question must have a unique `id`, a non-empty `topic`, `q`, `explanation`, exactly four `options`, and an integer `answer` from `0` to `3`. Optional `year` and `source` fields are displayed only when provided. Include them only when accurate, relevant, and permitted for sharing. Questions should be clear, fact-checked, and written in your own words.

## Check your changes

- Confirm JSON parses and answer indices point to the correct option.
- Verify each topic matches the syllabus or course content.
- Start a local HTTP server (for example, `python -m http.server 8000`) and check the relevant flow in a browser.
- Do not add personal information or unsupported claims about exam outcomes.

## Submit a pull request

Fork the repository, create a focused branch, make your changes, and open a pull request. In the description, identify the files changed, the subject/unit and topics covered, and the basis for your confidence in the answers. State that the material is original or explain your redistribution permission. Maintainers may request corrections before merging.
