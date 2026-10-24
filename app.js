/* Naija Scholar: small, data-driven static app. */
const appRoot = document.querySelector('#app');
const store = { screen: 'home', jamb: [], faculties: [], units: [], scores: [], theme: 'light', aiEnabled: false };
let session = null;
let timerId = null;
const dataCache = new Map();

function safeRead(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}
function safeWrite(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Storage may be disabled or full. */ }
}
function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}
function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
async function readJson(path) {
  if (dataCache.has(path)) return dataCache.get(path);
  try {
    const response = await fetch(path);
    if (!response.ok) return null;
    const value = await response.json();
    dataCache.set(path, value);
    return value;
  } catch {
    return null;
  }
}
function button(label, action, extra = '') {
  return `<button class="button ${extra}" data-action="${escapeHtml(action)}">${label}</button>`;
}
function setScreen(name) {
  store.screen = name;
  if (timerId) { clearInterval(timerId); timerId = null; }
  render();
}
function render() {
  document.documentElement.dataset.theme = store.theme;
  const header = `<header class="topbar"><a class="brand" href="#" data-action="home"><span class="brand-mark" aria-hidden="true">🎓</span><span>Naija <b>Scholar</b></span></a><nav aria-label="Main navigation"><button class="icon-button" aria-label="Toggle colour theme" title="Toggle theme" data-action="theme">${store.theme === 'dark' ? '☀' : '◐'}</button><button class="text-button" data-action="contribute">Contribute</button></nav></header>`;
  const pages = {
    home: renderHome,
    jamb: renderJamb,
    subject: renderSubject,
    mock: renderMockSetup,
    university: renderUniversity,
    faculty: renderFaculty,
    course: renderCourse,
    level: renderLevel,
    gst: renderGstPage,
    contribute: renderContribute,
    quiz: renderQuiz,
    result: renderResult
  };
  appRoot.innerHTML = `${header}<main>${(pages[store.screen] || renderHome)()}</main><footer>Independent practice material. Not affiliated with JAMB or any university.</footer>`;
  if (store.screen === 'quiz' && session?.kind === 'mock') startClock();
}
function renderHome() {
  const saved = store.scores.length;
  return `<section class="welcome"><p class="eyebrow">A free study platform for Nigerian students</p><h1>Practice with purpose.<br><em>Progress you can see.</em></h1><p class="lede">Original practice questions, clear explanations, and study paths for your next step.</p><h2>Who are you?</h2><div class="role-grid"><button class="role-card jamb-card" data-action="jamb"><span class="role-number">01 / JAMB</span><strong>JAMB candidate</strong><span>Preparing for UTME, or just getting started.</span><span class="arrow">Explore practice <b>↗</b></span></button><button class="role-card uni-card" data-action="university"><span class="role-number">02 / UNIVERSITY</span><strong>University student</strong><span>Find your course units and practise by level.</span><span class="arrow">Browse courses <b>↗</b></span></button></div><div class="home-foot"><span>15 JAMB subjects</span><span>Works offline after first load</span><span>${saved} saved practice ${saved === 1 ? 'result' : 'results'}</span></div></section>`;
}
function renderJamb() {
  return `<div class="page-heading"><button class="back-link" data-action="home">← Home</button><p class="eyebrow">JAMB practice</p><h1>Choose a subject</h1><p>Pick a topic to focus your revision, or practise the whole subject.</p></div><div class="subject-grid">${store.jamb.map((subject, index) => `<button class="subject-tile" data-action="subject" data-index="${index}"><span class="tile-index">${String(index + 1).padStart(2, '0')}</span><strong>${escapeHtml(subject.name)}</strong><span>${subject.topics.length} syllabus topics <b>↗</b></span></button>`).join('')}</div><section class="mock-banner"><div><p class="eyebrow">Exam conditions</p><h2>Full mock exam</h2><p>Four subjects, English compulsory, timed CBT-style practice.</p></div>${button('Set up mock exam', 'mock', 'primary')}</section>`;
}
function renderSubject() {
  const subject = store.jamb[store.selectedSubject];
  if (!subject) return renderMissing('Subject not found.');
  return `<div class="page-heading"><button class="back-link" data-action="jamb">← All subjects</button><p class="eyebrow">JAMB syllabus</p><h1>${escapeHtml(subject.name)}</h1><p>Choose a syllabus topic or practise across the subject.</p></div><div class="topic-list"><div class="topic-row all-topic"><div><strong>All ${escapeHtml(subject.name)}</strong><span>Mixed questions across topics</span></div>${button('Practise subject', 'practice-subject', 'small primary')}</div>${subject.topics.map(topic => `<div class="topic-row"><div><strong>${escapeHtml(topic)}</strong><span>Topic practice</span></div><button class="button small" data-action="practice-topic" data-topic="${escapeHtml(topic)}">Practise topic</button></div>`).join('')}</div>`;
}
function renderMockSetup() {
  const others = store.jamb.filter(subject => subject.name !== 'English');
  return `<div class="page-heading"><button class="back-link" data-action="jamb">← JAMB subjects</button><p class="eyebrow">CBT-style practice</p><h1>Build your mock exam</h1><p>English is compulsory. Choose three more subjects. The exam has 40 questions per subject.</p></div><form id="mock-form" class="mock-form"><fieldset><legend>Choose exactly three</legend><div class="check-grid">${others.map(subject => `<label class="check-option"><input type="checkbox" name="mock-subject" value="${escapeHtml(subject.name)}"><span>${escapeHtml(subject.name)}</span></label>`).join('')}</div></fieldset><div class="mock-summary"><span>English Language <b>Compulsory</b></span><span>120 minutes</span><span>160 questions</span></div><p class="s">Question sets are still growing; shorter sets may repeat questions to complete the mock format.</p><button class="button primary" type="submit">Start mock exam</button><p id="mock-error" class="form-error" role="alert"></p></form>`;
}
function renderUniversity() {
  const courses = allCourses();
  return `<div class="page-heading"><button class="back-link" data-action="home">← Home</button><p class="eyebrow">University practice</p><h1>Find your course</h1><p>Browse faculties, or search course names and codes.</p></div><label class="search-box"><span aria-hidden="true">⌕</span><input id="course-search" type="search" aria-label="Search courses and course codes" placeholder="Search e.g. Computer Science, CSC 201" autocomplete="off"><button type="button" class="clear-search" data-action="clear-search" aria-label="Clear search">×</button></label><div id="search-results" class="search-results"></div><h2 class="section-title">Faculties</h2><div class="faculty-grid">${store.faculties.map((faculty, index) => `<button class="faculty-tile" data-action="faculty" data-index="${index}"><strong>${escapeHtml(faculty.name)}</strong><span>${faculty.courses.length} programmes <b>↗</b></span></button>`).join('')}</div><div class="gst-strip"><div><strong>General Studies (GST)</strong><span>Shared course units for students across faculties</span></div><button class="button small" data-action="gst">Browse GST units</button></div>`;
}
function allCourses() {
  return store.faculties.flatMap(faculty => faculty.courses.map(course => ({ name: course, faculty: faculty.name })));
}
function renderFaculty() {
  const faculty = store.faculties[store.selectedFaculty];
  if (!faculty) return renderMissing('Faculty not found.');
  return `<div class="page-heading"><button class="back-link" data-action="university">← Faculties</button><p class="eyebrow">Faculty</p><h1>${escapeHtml(faculty.name)}</h1><p>Choose a degree programme.</p></div><div class="course-list">${faculty.courses.map(course => `<button class="list-link" data-action="course" data-course="${escapeHtml(course)}"><span>${escapeHtml(course)}</span><b>↗</b></button>`).join('')}</div>`;
}
function renderCourse() {
  return `<div class="page-heading"><button class="back-link" data-action="faculty">← Courses</button><p class="eyebrow">Degree programme</p><h1>${escapeHtml(store.selectedCourse)}</h1><p>Choose your current level.</p></div><div class="level-grid">${[100, 200, 300, 400, 500, ...(store.selectedCourse === 'Medicine and Surgery' ? [600] : [])].map(level => `<button class="level-tile" data-action="level" data-level="${level}"><span>${level}</span><small>LEVEL</small></button>`).join('')}</div>`;
}
function renderLevel() {
  const level = Number(store.selectedLevel);
  const courseData = store.units.courses.find(item => item.name === store.selectedCourse);
  const units = courseData?.levels?.[level] || [];
  return `<div class="page-heading"><button class="back-link" data-action="course">← ${escapeHtml(store.selectedCourse)}</button><p class="eyebrow">${level} level</p><h1>Course units</h1><p>Choose a unit to practise. Units without question sets are ready for contributions.</p></div><div class="course-list">${units.length ? units.map(unit => unitRow(unit)).join('') : `<p class="empty-note">No course units have been added for this programme and level yet.</p>`}</div>${renderGstUnits()}`;
}
function unitRow(unit) {
  return `<div class="unit-row"><div><strong>${escapeHtml(unit.code)}</strong><span>${escapeHtml(unit.title)}</span></div><button class="button small" data-action="practice-unit" data-code="${escapeHtml(unit.code)}">Practise</button></div>`;
}
function renderGstUnits() {
  const units = store.units.gst || [];
  return `<section class="gst-section"><p class="eyebrow">Available to all students</p><h2>General Studies</h2><div class="course-list">${units.map(unit => unitRow(unit)).join('')}</div></section>`;
}
function renderGstPage() {
  return `<div class="page-heading"><button class="back-link" data-action="university">← University</button><p class="eyebrow">For every student</p><h1>General Studies units</h1></div><div class="course-list">${(store.units.gst || []).map(unit => unitRow(unit)).join('')}</div>`;
}
function renderContribute() {
  return `<div class="page-heading"><button class="back-link" data-action="home">← Home</button><p class="eyebrow">Open contribution</p><h1>Help another student practise</h1><p>Contribute original questions that you wrote, or material you have permission to share. Do not upload copied exam papers.</p></div><section class="contribution-block"><h2>How to contribute on GitHub</h2><ol><li>Fork the project repository and create a branch.</li><li>Add a JSON file in <code>data/jamb/</code> for a JAMB subject, or <code>data/questions/</code> for a university course code.</li><li>Check the question format and run the app locally.</li><li>Open a pull request and describe the source and review status.</li></ol><p>For missing question sets, the app displays a contribution prompt instead of an error.</p><a class="button primary link-button" href="https://github.com/aliyumuhammadabdulkadir212-alt/NAIJAPREP" target="_blank" rel="noreferrer">Open project on GitHub</a></section><section class="contribution-block"><h2>Question template</h2><pre><code>{
  "id": "CSC201-001",
  "topic": "Programming fundamentals",
  "q": "Write an original question here.",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "answer": 0,
  "explanation": "Explain why the answer is correct."
}</code></pre><p>Add optional <code>year</code> and <code>source</code> only when supplied by the contributor and permitted for sharing. See <code>CONTRIBUTING.md</code> for the full guide.</p></section>`;
}
function renderMissing(message) { return `<div class="page-heading"><button class="back-link" data-action="home">← Home</button><p class="empty-note">${escapeHtml(message)}</p></div>`; }
function renderQuiz() {
  if (!session) return renderMissing('No active practice session.');
  if (session.kind === 'mock') return renderMockQuestion();
  const item = session.questions[session.index];
  if (!item) return renderResult();
  const feedback = session.answered ? `<section class="answer-feedback ${session.lastCorrect ? 'is-correct' : 'is-wrong'}"><strong>${session.lastCorrect ? 'Correct' : 'Review this answer'}</strong><p><b>Answer: ${escapeHtml(item.options[item.answer])}</b></p><p>${escapeHtml(item.explanation)}</p>${aiButton(item)}<button class="button primary" data-action="next-question">${session.index + 1 === session.questions.length ? 'View results' : 'Next question'}</button></section>` : '';
  const options = item.options.map((option, index) => `<button class="answer-option ${session.answered && index === item.answer ? 'answer-correct' : ''} ${session.answered && index === session.selected && !session.lastCorrect ? 'answer-wrong' : ''}" data-action="answer" data-index="${index}" ${session.answered ? 'disabled' : ''}><span>${String.fromCharCode(65 + index)}</span>${escapeHtml(option)}</button>`).join('');
  return `<div class="quiz-top"><button class="back-link" data-action="end-practice">← End practice</button><span>${session.index + 1} / ${session.questions.length}</span></div><div class="progress-track"><span style="width:${((session.index + 1) / session.questions.length) * 100}%"></span></div><article class="question-panel"><p class="eyebrow">Practice question · ${escapeHtml(item.subject || session.subject)} · ${escapeHtml(item.topic)}</p>${item.year || item.source ? `<p class="source-tag">${item.year ? `Year ${escapeHtml(item.year)}` : ''}${item.source ? ` · ${escapeHtml(item.source)}` : ''}</p>` : ''}<h1>${escapeHtml(item.q)}</h1><div class="answer-list">${options}</div>${feedback}</article>`;
}
function aiButton(item) {
  return `<div class="ai-tools"><label><input type="checkbox" data-action="ai-toggle" ${store.aiEnabled ? 'checked' : ''}> Explain with local AI</label>${store.aiEnabled ? `<button class="button small" data-action="explain-ai" data-question="${escapeHtml(item.q)}" data-explanation="${escapeHtml(item.explanation)}">Ask Gemma</button><p class="ai-answer" aria-live="polite"></p>` : '<span>Off by default · Gemma via Ollama</span>'}</div>`;
}
function renderMockQuestion() {
  const item = session.questions[session.index];
  if (!item) return renderResult();
  return `<div class="quiz-top"><button class="back-link" data-action="end-practice">← End exam</button><span id="timer" class="timer">${formatTime(session.seconds)}</span><span>${session.index + 1} / ${session.questions.length}</span></div><div class="progress-track"><span style="width:${((session.index + 1) / session.questions.length) * 100}%"></span></div><div class="mock-layout"><aside class="question-palette"><strong>Questions</strong><div>${session.questions.map((question, index) => `<button class="palette-item ${index === session.index ? 'current' : ''} ${session.answers[index] !== undefined ? 'answered' : ''}" data-action="jump-question" data-index="${index}" aria-label="Question ${index + 1}">${index + 1}</button>`).join('')}</div></aside><article class="question-panel"><p class="eyebrow">Mock practice · ${escapeHtml(item.subject)} · ${escapeHtml(item.topic)}</p><h1>${escapeHtml(item.q)}</h1><div class="answer-list">${item.options.map((option, index) => `<button class="answer-option ${session.answers[session.index] === index ? 'selected' : ''}" data-action="mock-answer" data-index="${index}"><span>${String.fromCharCode(65 + index)}</span>${escapeHtml(option)}</button>`).join('')}</div><div class="mock-controls"><button class="button" data-action="previous-question" ${session.index === 0 ? 'disabled' : ''}>Previous</button>${session.index + 1 === session.questions.length ? button('Submit exam', 'submit-mock', 'primary') : button('Next question', 'next-mock', 'primary')}</div></article></div>`;
}
function renderResult() {
  const summary = session?.summary || [];
  const correct = summary.filter(item => item.correct).length;
  const total = summary.length;
  const bySubject = new Map();
  const byTopic = new Map();
  summary.forEach(item => {
    const subject = item.subject || 'Practice';
    const topic = `${subject} / ${item.topic || 'General'}`;
    bySubject.set(subject, [...(bySubject.get(subject) || []), item]);
    byTopic.set(topic, [...(byTopic.get(topic) || []), item]);
  });
  const subjectRows = [...bySubject].map(([name, items]) => `<div class="score-row"><span>${escapeHtml(name)}</span><strong>${items.filter(item => item.correct).length} / ${items.length}</strong></div>`).join('');
  const topicRows = [...byTopic].map(([name, items]) => `<div class="score-row"><span>${escapeHtml(name)}</span><strong>${items.filter(item => item.correct).length} / ${items.length}</strong></div>`).join('');
  const weak = [...byTopic].filter(([, items]) => items.some(item => !item.correct)).sort((a, b) => a[1].filter(item => item.correct).length / a[1].length - b[1].filter(item => item.correct).length / b[1].length).slice(0, 5);
  return `<div class="result-heading"><p class="eyebrow">Practice complete</p><h1>${total ? Math.round(correct / total * 100) : 0}<small>%</small></h1><p>${correct} correct out of ${total} questions</p></div><div class="result-grid"><section class="result-section"><h2>Score by subject</h2>${subjectRows || '<p>No scored questions.</p>'}</section><section class="result-section"><h2>Score by topic</h2>${topicRows || '<p>No scored questions.</p>'}</section></div><section class="weak-section"><h2>Study next</h2>${weak.length ? weak.map(([name, items]) => `<p><span>${escapeHtml(name)}</span><b>${items.filter(item => item.correct).length}/${items.length} correct</b></p>`).join('') : '<p>Strong work. Keep revising across your syllabus.</p>'}</section><div class="result-actions">${button('Choose another practice', session?.kind === 'university' ? 'university' : 'jamb', 'primary')}${button('Home', 'home')}</div>`;
}
async function startPractice(questions, { subject, kind, topic } = {}) {
  if (!questions?.length) { showEmptyQuestions(); return; }
  session = { kind: kind || 'practice', subject: subject || '', topic: topic || '', questions: questions.map(question => ({ ...question, subject: question.subject || subject || '' })), index: 0, answered: false, summary: [] };
  setScreen('quiz');
}
function showEmptyQuestions() {
  appRoot.innerHTML = `${appRoot.innerHTML}<div class="toast" role="status">No questions yet, contribute on GitHub.</div>`;
}
function recordScore(summary, label) {
  store.scores = [...store.scores, { date: new Date().toISOString(), label, correct: summary.filter(item => item.correct).length, total: summary.length, progress: summary }].slice(-100);
  safeWrite('gombe-practice-scores', store.scores);
}
function answerPractice(index) {
  if (session.answered) return;
  const item = session.questions[session.index];
  session.answered = true;
  session.selected = index;
  session.lastCorrect = index === item.answer;
  session.summary.push({ subject: item.subject || session.subject, topic: item.topic, correct: session.lastCorrect });
  render();
}
function nextQuestion() {
  if (session.index + 1 < session.questions.length) {
    session.index += 1;
    session.answered = false;
    render();
  } else finishPractice();
}
function finishPractice() {
  if (session.kind === 'mock') {
    session.summary = session.questions.map((item, index) => ({ subject: item.subject, topic: item.topic, correct: session.answers[index] === item.answer }));
  }
  recordScore(session.summary, session.subject || (session.kind === 'mock' ? 'JAMB mock exam' : 'University practice'));
  setScreen('result');
}
function startClock() {
  if (timerId) clearInterval(timerId);
  timerId = setInterval(() => {
    if (!session || session.kind !== 'mock') return;
    session.seconds -= 1;
    const timer = document.querySelector('#timer');
    if (timer) timer.textContent = formatTime(session.seconds);
    if (session.seconds <= 0) finishPractice();
  }, 1000);
}
function formatTime(seconds) {
  const minutes = Math.floor(Math.max(seconds, 0) / 60);
  const remainingSeconds = Math.max(seconds, 0) % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}
async function beginMock(names) {
  const selected = ['English', ...names];
  const banks = await Promise.all(selected.map(async name => {
    const subject = store.jamb.find(item => item.name === name);
    return { name, questions: await loadJambQuestions(subject) };
  }));
  if (banks.some(bank => !bank.questions.length)) { showEmptyQuestions(); return; }
  const questions = banks.flatMap(bank => Array.from({ length: 40 }, (_, index) => {
    const question = bank.questions[index % bank.questions.length];
    return { ...question, subject: bank.name };
  }));
  session = { kind: 'mock', subject: 'JAMB mock exam', questions, index: 0, answers: {}, seconds: 120 * 60, summary: [] };
  setScreen('quiz');
}
async function loadJambQuestions(subject) {
  if (!subject) return [];
  const content = await readJson(`data/jamb/${encodeURIComponent(subject.slug)}.json`);
  return Array.isArray(content) ? content : [];
}
async function loadCourseQuestions(code) {
  const content = await readJson(`data/questions/${encodeURIComponent(code.replace(/\s+/g, '_'))}.json`);
  return Array.isArray(content) ? content : [];
}
async function practiseSubject(topic = null) {
  const subject = store.jamb[store.selectedSubject];
  const questions = await loadJambQuestions(subject);
  const matching = topic ? questions.filter(question => question.topic === topic) : questions;
  if (!matching.length) { showEmptyQuestions(); return; }
  await startPractice(matching, { subject: subject.name, topic });
}
async function practiseUnit(code) {
  const questions = await loadCourseQuestions(code);
  if (!questions.length) { showEmptyQuestions(); return; }
  await startPractice(questions, { subject: code, kind: 'university' });
}
function updateSearch(query) {
  const area = document.querySelector('#search-results');
  if (!area) return;
  const normalized = query.trim().toLowerCase();
  if (!normalized) { area.innerHTML = ''; return; }
  const courseMatches = allCourses().filter(item => item.name.toLowerCase().includes(normalized)).map(item => `<button class="search-result" data-action="search-course" data-course="${escapeHtml(item.name)}" data-faculty="${escapeHtml(item.faculty)}"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.faculty)}</span></button>`);
  const unitMatches = [...(store.units.gst || []), ...store.units.courses.flatMap(course => Object.values(course.levels || {}).flat())].filter(unit => `${unit.code} ${unit.title}`.toLowerCase().includes(normalized)).map(unit => `<button class="search-result" data-action="practice-unit" data-code="${escapeHtml(unit.code)}"><strong>${escapeHtml(unit.code)} · ${escapeHtml(unit.title)}</strong><span>Course unit</span></button>`);
  area.innerHTML = courseMatches.concat(unitMatches).slice(0, 12).join('') || `<p class="empty-note">No matching course or unit.</p>`;
}
async function explainWithAi(buttonElement) {
  const output = document.querySelector('.ai-answer');
  if (!output) return;
  output.textContent = 'Connecting to Ollama…';
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gemma3', stream: false, prompt: `Explain this practice question for a student in simple terms. Question: ${buttonElement.dataset.question}\nCorrect explanation: ${buttonElement.dataset.explanation}` }),
      signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) throw new Error('Ollama unavailable');
    const result = await response.json();
    output.textContent = result.response || 'The local model returned no explanation.';
  } catch {
    output.textContent = 'Local AI is unavailable. Install Ollama, run gemma3, and allow localhost access to try again.';
  }
}
document.addEventListener('click', async event => {
  const control = event.target.closest('[data-action]');
  if (!control) return;
  const action = control.dataset.action;
  if (action === 'theme') { store.theme = store.theme === 'dark' ? 'light' : 'dark'; safeWrite('gombe-theme', store.theme); render(); }
  if (action === 'home') setScreen('home');
  if (action === 'jamb') setScreen('jamb');
  if (action === 'university') setScreen('university');
  if (action === 'contribute') setScreen('contribute');
  if (action === 'mock') setScreen('mock');
  if (action === 'subject') { store.selectedSubject = Number(control.dataset.index); setScreen('subject'); }
  if (action === 'practice-subject') practiseSubject();
  if (action === 'practice-topic') practiseSubject(control.dataset.topic);
  if (action === 'faculty') { store.selectedFaculty = Number(control.dataset.index); setScreen('faculty'); }
  if (action === 'course') { if (control.dataset.course) store.selectedCourse = control.dataset.course; setScreen('course'); }
  if (action === 'level') { store.selectedLevel = control.dataset.level; setScreen('level'); }
  if (action === 'practice-unit') practiseUnit(control.dataset.code);
  if (action === 'gst') setScreen('gst');
  if (action === 'clear-search') { const input = document.querySelector('#course-search'); input.value = ''; updateSearch(''); input.focus(); }
  if (action === 'search-course') { store.selectedCourse = control.dataset.course; store.selectedFaculty = store.faculties.findIndex(item => item.name === control.dataset.faculty); setScreen('course'); }
  if (action === 'answer') answerPractice(Number(control.dataset.index));
  if (action === 'next-question') nextQuestion();
  if (action === 'end-practice') { const destination = session?.kind === 'university' ? 'university' : 'jamb'; session = null; setScreen(destination); }
  if (action === 'mock-answer') { session.answers[session.index] = Number(control.dataset.index); render(); }
  if (action === 'jump-question') { session.index = Number(control.dataset.index); render(); }
  if (action === 'previous-question') { session.index = Math.max(0, session.index - 1); render(); }
  if (action === 'next-mock') { session.index = Math.min(session.questions.length - 1, session.index + 1); render(); }
  if (action === 'submit-mock') finishPractice();
  if (action === 'explain-ai') explainWithAi(control);
});
document.addEventListener('input', event => {
  if (event.target.id === 'course-search') updateSearch(event.target.value);
});
document.addEventListener('change', event => {
  if (event.target.dataset.action === 'ai-toggle') { store.aiEnabled = event.target.checked; render(); }
});
document.addEventListener('submit', event => {
  if (event.target.id !== 'mock-form') return;
  event.preventDefault();
  const selected = [...event.target.querySelectorAll('input[name="mock-subject"]:checked')].map(input => input.value);
  const error = document.querySelector('#mock-error');
  if (selected.length !== 3) { error.textContent = 'Choose exactly three subjects in addition to compulsory English.'; return; }
  beginMock(selected);
});

async function initialise() {
  store.theme = safeRead('gombe-theme', 'light');
  store.scores = safeRead('gombe-practice-scores', []);
  const [jamb, faculties, units] = await Promise.all([readJson('data/jamb.json'), readJson('data/faculties.json'), readJson('data/units.json')]);
  store.jamb = jamb?.subjects || [];
  store.faculties = faculties?.faculties || [];
  store.units = units || { courses: [], gst: [] };
  render();
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  }
}
initialise();
