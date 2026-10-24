# Contributing to Naija Scholar 🎓

Thank you for helping Nigerian students study better! This guide explains how you can contribute — whether you're reporting a bug, adding practice questions, or improving the code.

---

## Table of Contents

1. [Reporting Bugs](#1-reporting-bugs)
2. [Suggesting Questions](#2-suggesting-questions)
3. [Question Format Specification](#3-question-format-specification)
4. [Adding Library Resources](#4-adding-library-resources)
5. [Running the App Locally](#5-running-the-app-locally)
6. [Code Style Guide](#6-code-style-guide)
7. [Pull Request Process](#7-pull-request-process)

---

## 1. Reporting Bugs

Found a wrong answer, a broken link, or something that doesn't work? Please let us know!

**Steps:**

1. Go to the [Issues tab](../../issues) on GitHub.
2. Click **New Issue**.
3. Choose the **Bug report** template.
4. Fill in all the fields — the more detail you give, the faster we can fix it.

**Good bug reports include:**
- What happened (e.g., "App crashes when I tap 'Start CBT'")
- What you expected to happen
- The screen or section where it happened
- Your device and browser (e.g., "Android 12, Chrome 114")

> **Note:** For wrong answers or incorrect explanations, please quote the question text and tell us the correct answer and your source.

---

## 2. Suggesting Questions

We welcome high-quality practice questions! Before submitting, please read the rules below carefully.

### ✅ Permitted questions

- Questions you **wrote yourself** (original content)
- Questions from **past papers that are in the public domain** (e.g., older WAEC/JAMB papers explicitly released for public use)
- Questions shared with **explicit written permission** from the copyright holder

### ❌ Not permitted

- Verbatim questions from current or recent JAMB, WAEC, or NECO past-question booklets that are sold commercially
- Content from textbooks, workbooks, or websites without permission
- AI-generated questions that haven't been fact-checked by a subject expert

> If you are unsure whether your source is copyright-free, **do not submit it**. When in doubt, write an original question on the same topic instead.

**How to submit a question:**

1. Open a new [Contribute a question](../../issues/new?template=question-contribution.md) issue.
2. Fill in **every field** of the template (subject, topic, options, correct answer, explanation, and source confirmation).
3. We'll review it, fact-check it, and merge it if it meets the standards.

---

## 3. Question Format Specification

Questions are stored in `data/questions.json` as an array of objects. Each question object must follow this schema:

```jsonc
{
  "id": "q_0001",          // Unique ID — format: "q_" + 4-digit number
  "subject": "Mathematics", // Full subject name
  "topic": "Algebra",       // Specific topic within the subject
  "type": "mcq",            // "mcq" (multiple-choice) or "theory"
  "year": 2023,             // Year the question was set (or null if original)
  "exam": "WAEC",           // "WAEC", "JAMB", "NECO", "POST-UTME", or "ORIGINAL"
  "question": "If 2x + 3 = 11, find x.", // Full question text
  "options": {
    "A": "2",
    "B": "3",
    "C": "4",
    "D": "5"
  },
  "answer": "C",            // Correct option key ("A", "B", "C", or "D")
  "explanation": "2x + 3 = 11 → 2x = 8 → x = 4. Therefore the answer is C.",
  "difficulty": "easy",     // "easy", "medium", or "hard"
  "tags": ["linear equations", "algebra"], // Optional array of tags
  "source": "Original"      // Your source / confirmation of permission
}
```

**Validation rules:**
- `id` must be unique across the entire dataset.
- `options` must have exactly 4 keys: `A`, `B`, `C`, and `D`.
- `answer` must be one of `"A"`, `"B"`, `"C"`, or `"D"`.
- `explanation` is **required** — it's the most important part for learning!
- All text fields must be in English.

---

## 4. Adding Library Resources

The Library tab links students to free study materials. You can suggest a new resource by opening a Pull Request that edits `data/library.json`.

### Rules for library resources

- The resource must be **completely free** with no paywall or required signup.
- It must be **legally available** — i.e., openly licensed (CC, public domain) or officially provided by the publisher for free.
- Preference is given to resources **in English** aimed at Nigerian secondary or tertiary students.
- No affiliate links, referral codes, or promotional content.

### Library entry format

```jsonc
{
  "id": "lib_0001",
  "title": "Khan Academy — Algebra",
  "type": "website",          // "website", "pdf", "video", "app"
  "subject": "Mathematics",
  "description": "Free interactive lessons on algebra from basics to advanced.",
  "url": "https://www.khanacademy.org/math/algebra",
  "license": "CC BY-NC-SA 3.0",
  "addedBy": "your-github-username"
}
```

---

## 5. Running the App Locally

Naija Scholar is a plain HTML/CSS/JavaScript app with no build step required.

### Option A — Just open the file (quickest)

```
double-click index.html
```

That's it! The app works directly in your browser.

> **Note:** The service worker (offline caching) requires a server origin to activate. It won't register when you open the file with `file://`. For most testing, this is fine.

### Option B — Use a local server (recommended for full PWA testing)

If you have Python installed:

```bash
# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

Then open **http://localhost:8080** in your browser.

Or use the VS Code **Live Server** extension — just right-click `index.html` → **Open with Live Server**.

---

## 6. Code Style Guide

The codebase is kept intentionally simple so that Nigerian students and beginner developers can read and contribute to it.

### General principles

- **Comment everything.** Assume the next reader is learning JavaScript for the first time.
- **No build tools, no bundlers, no frameworks.** Plain HTML, CSS, and vanilla JS only.
- **One file at a time.** Each feature lives in a clearly named section.
- **Descriptive names.** Prefer `renderQuestionCard()` over `renderQ()`.

### JavaScript

```javascript
// ✅ Good — clear, commented, descriptive
/**
 * Renders a multiple-choice question card into the DOM.
 * @param {Object} question - Question object from questions.json
 * @param {number} index    - 0-based index in the current quiz
 */
function renderQuestionCard(question, index) {
  // ...
}

// ❌ Bad — cryptic, uncommented
function rqc(q, i) { /* ... */ }
```

- Use `const` and `let`; never `var`.
- Use `async/await` instead of `.then()` chains where possible.
- Keep functions short (aim for < 40 lines each).
- Use early returns to avoid deep nesting.

### CSS

- Add a comment block (`/* --- Section Name --- */`) before each logical group.
- Use CSS custom properties (variables) for all colors — never hardcode hex values.
- Mobile styles first; use `@media (min-width: ...)` for larger screens.

### HTML

- Every interactive element must have an accessible label (`aria-label`, `aria-labelledby`, or visible text).
- Use semantic elements (`<main>`, `<section>`, `<article>`, `<button>`, etc.).
- Keep markup clean and readable.

---

## 7. Pull Request Process

1. **Fork** the repository and create a new branch:
   ```bash
   git checkout -b fix/wrong-answer-maths-q0042
   ```

2. **Make your changes.** Keep each PR focused on one thing.

3. **Test locally** — open `index.html` and verify your changes work.

4. **Write a clear commit message:**
   ```
   fix: correct answer for Mathematics question q0042

   The previous answer was "B" but the correct answer is "C".
   Added explanation showing working.
   ```

5. **Open a Pull Request** against the `main` branch.
   - Describe **what** you changed and **why**.
   - Reference any related issues (e.g., `Closes #42`).

6. **Wait for review.** A maintainer will review your PR, request changes if needed, and merge when everything looks good.

### PR checklist

- [ ] My changes work correctly in a browser (Chrome, Firefox, or Safari)
- [ ] I haven't introduced any console errors
- [ ] All question fields are filled in (if adding questions)
- [ ] I've confirmed my content is free of copyright issues
- [ ] I've commented any new code I've added

---

Thank you for contributing! Every question, bug fix, and improvement helps a student somewhere in Nigeria pass their exam. 🇳🇬📚
