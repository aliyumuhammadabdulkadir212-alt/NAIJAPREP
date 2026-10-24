# Naija Scholar

Open-source past-question practice app for two users (JAMB candidates and university students) to help secondary-school students across Nigeria, prepare for JAMB.

## The problem
Many students in Gombe State fail JAMB because of weak English and Maths basics, no access to past questions, no computer-based-test (CBT) practice, late preparation, and the cost of materials.

## What it does
- Phone-friendly practice quiz with instant explanations
- Shows which subjects a student should study next
- Explains common reasons students fail, with practical fixes
- Works offline once the page is saved (single `index.html`)

## Run it
Open `index.html` in any browser. To host free: GitHub repo > Settings > Pages > deploy from `main`.

## Add past questions
Add entries to the `JAMB` (by subject) or `UQ` (by course code) lists in `index.html`. Add courses to `FAC` and course units to `UNITS`. Format:
`{q:"...",o:["A","B","C","D"],a:0,w:"..."}`
Only add questions you have the right to share.

## Optional: AI tutor with Gemma (open model)
Run Gemma locally with [Ollama](https://ollama.com) (`ollama run gemma3`) to explain wrong answers. Planned next step.

## Roadmap
Teacher dashboard, Hausa explanations, more subjects, Arduino-based offline quiz device.

## Licence
MIT


## Features
JAMB, WAEC/NECO, Post-UTME and university sections; timed mock CBT; progress history; library of links (MySchool and official sources, credited, not affiliated); offline support; ask/contribute via GitHub issues. Started in Gombe State and built for all of Nigeria.

New: student tools (CGPA and Post-UTME aggregate calculators, study timer, weekly planner) and a business hub (profit and break-even calculator, business plan builder, ideas, registration steps).

## Sign-in
Optional sign-in with Google, Facebook, email and phone using Firebase Authentication. Paste your Firebase web config in `index.html` (`firebaseConfig`). Never commit private secrets.

## Deploy
GitHub Pages (Settings > Pages) or Firebase Hosting (`firebase deploy`). Add your domain under Firebase Authentication > Authorized domains.
