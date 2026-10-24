/* Naija Scholar: small, data-driven static app. */
const appRoot = document.querySelector('#app');
<<<<<<< HEAD
const store = { screen: 'home', jamb: [], faculties: [], units: [], scores: [], theme: 'light', aiEnabled: false, chatHistory: safeRead('naija-chat-history', []), studyPlan: safeRead('naija-study-plan', null) };
=======
const store = { screen: 'home', jamb: [], faculties: [], units: [], library: [], scores: [], theme: 'light', aiEnabled: false };
>>>>>>> 44f576285f924b48c49b04215ffcfed61cc3c80e
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
<<<<<<< HEAD
  const header = `<header class="topbar"><a class="brand" href="#" data-action="home"><span class="brand-mark">NS</span><span>Naija <b>Scholar</b></span></a><nav aria-label="Main navigation"><button class="text-button" data-action="tutor">AI Tutor</button><button class="text-button" data-action="studyplan">Study Plan</button><button class="icon-button" aria-label="Toggle colour theme" title="Toggle theme" data-action="theme">${store.theme === 'dark' ? '☀' : '◐'}</button><button class="text-button" data-action="contribute">Contribute</button></nav></header>`;
=======
  const header = `<header class="topbar"><a class="brand" href="#" data-action="home"><span class="brand-mark" aria-hidden="true">🎓</span><span>Naija <b>Scholar</b></span></a><nav aria-label="Main navigation"><button class="text-button" data-action="library">Study library</button><button class="icon-button" aria-label="Toggle colour theme" title="Toggle theme" data-action="theme">${store.theme === 'dark' ? '☀' : '◐'}</button><button class="text-button" data-action="contribute">Contribute</button></nav></header>`;
>>>>>>> 44f576285f924b48c49b04215ffcfed61cc3c80e
  const pages = {
    home: renderHome,
    library: renderLibrary,
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
    result: renderResult,
    tutor: renderTutor,
    studyplan: renderStudyPlan
  };
  appRoot.innerHTML = `${header}<main>${(pages[store.screen] || renderHome)()}</main><footer>Independent practice material. Not affiliated with JAMB or any university.</footer>`;
  if (store.screen === 'quiz' && session?.kind === 'mock') startClock();
}
function renderHome() {
  const saved = store.scores.length;
<<<<<<< HEAD
  return `<section class="welcome"><p class="eyebrow">Learn. Pass. Succeed.</p><h1>Naija Scholar<br><em>Free exam prep for Nigerians.</em></h1><p class="lede">Original practice questions, clear explanations, AI tutor that breaks problems down in under a minute, and personalized study plans for any course.</p><h2>Get started</h2><div class="role-grid"><button class="role-card jamb-card" data-action="jamb"><span class="role-number">01 / JAMB</span><strong>JAMB candidate</strong><span>Preparing for UTME, or just getting started.</span><span class="arrow">Explore practice <b>↗</b></span></button><button class="role-card uni-card" data-action="university"><span class="role-number">02 / UNIVERSITY</span><strong>University student</strong><span>Find your course units and practise by level.</span><span class="arrow">Browse courses <b>↗</b></span></button></div><div class="feature-grid" style="margin-top:1.5rem;display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1rem"><button class="role-card" data-action="tutor" style="text-align:left"><span class="role-number">AI TUTOR</span><strong>Solve any problem step by step</strong><span>Get simple explanations even if you're struggling. Works with all courses.</span><span class="arrow">Ask now <b>↗</b></span></button><button class="role-card" data-action="studyplan" style="text-align:left"><span class="role-number">SMART PLAN</span><strong>Personalized study plan</strong><span>Tailored to your brain type &amp; available time. Choose, follow, upgrade.</span><span class="arrow">Build plan <b>↗</b></span></button></div><div class="home-foot"><span>15 JAMB subjects</span><span>Works offline after first load</span><span>${saved} saved practice ${saved === 1 ? 'result' : 'results'}</span></div></section>`;
=======
  return `<section class="welcome"><p class="eyebrow">Learn. Pass. Succeed.</p><h1>Naija Scholar<br><em>Free exam prep for Nigerians.</em></h1><p class="lede">Original practice questions, clear explanations, and study paths for JAMB and Nigerian universities.</p><h2>Who are you?</h2><div class="role-grid"><button class="role-card jamb-card" data-action="jamb"><span class="role-number">01 / JAMB</span><strong>JAMB candidate</strong><span>Preparing for UTME, or just getting started.</span><span class="arrow">Explore practice <b>↗</b></span></button><button class="role-card uni-card" data-action="university"><span class="role-number">02 / UNIVERSITY</span><strong>University student</strong><span>Find your course units and practise by level.</span><span class="arrow">Browse courses <b>↗</b></span></button></div><div class="home-foot"><span>15 JAMB subjects</span><span>Works offline after first load</span><span>${saved} saved practice ${saved === 1 ? 'result' : 'results'}</span></div><button class="button small library-entry" data-action="library">Browse the study library</button></section>`;
>>>>>>> 44f576285f924b48c49b04215ffcfed61cc3c80e
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
function renderLibrary() {
  const types = [...new Set(store.library.map(item => item.type).filter(Boolean))].sort();
  return `<div class="page-heading"><button class="back-link" data-action="home">← Home</button><p class="eyebrow">Learn. Pass. Succeed.</p><h1>Study library</h1><p>Useful free and open learning links for JAMB candidates and university students. Resources open on their original websites.</p></div><div class="library-filters"><label class="search-box"><span aria-hidden="true">⌕</span><input id="library-search" type="search" aria-label="Search study resources" placeholder="Search books, courses, scholarships…" autocomplete="off"></label><label class="library-type-label"><span>Resource type</span><select id="library-type"><option value="">All resources</option>${types.map(type => `<option value="${escapeHtml(type)}">${escapeHtml(type.replaceAll('-', ' '))}</option>`).join('')}</select></label></div><div id="library-results" class="library-grid"></div>`;
}
function safeExternalUrl(value) {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? escapeHtml(url.href) : '';
  } catch {
    return '';
  }
}
function updateLibraryResults() {
  const results = document.querySelector('#library-results');
  if (!results) return;
  const query = (document.querySelector('#library-search')?.value || '').trim().toLowerCase();
  const type = document.querySelector('#library-type')?.value || '';
  const matching = store.library.filter(item => {
    const text = [item.title, item.type, item.subject, item.course, item.level, item.source, ...(item.audience || [])].filter(Boolean).join(' ').toLowerCase();
    return (!type || item.type === type) && (!query || text.includes(query));
  });
  results.innerHTML = matching.map(item => {
    const url = safeExternalUrl(item.url);
    return `<article class="library-card"><div class="library-card-top"><span class="library-category">${escapeHtml((item.type || 'resource').replaceAll('-', ' '))}</span><span class="library-level">${escapeHtml(item.level || 'All levels')}</span></div><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml((item.audience || []).join(' · ') || 'All students')}${item.subject && item.subject !== 'Multiple' ? ` · ${escapeHtml(item.subject)}` : ''}</p><div class="library-card-foot"><span>${escapeHtml(item.source || 'Open resource')}</span>${url ? `<a href="${url}" target="_blank" rel="noopener noreferrer">Visit resource <b>↗</b></a>` : '<span>Link unavailable</span>'}</div></article>`;
  }).join('') || '<p class="empty-note">No resources match your search.</p>';
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

function renderTutor() {
  const history = store.chatHistory || [];
  const messages = history.map(msg => `<div class="chat-msg ${msg.role === 'user' ? 'user' : 'assistant'}"><div class="chat-bubble"><strong>${msg.role === 'user' ? 'You' : 'Naija Scholar AI Tutor'}</strong><p>${escapeHtml(msg.content).replace(/\n/g, '<br>')}</p></div></div>`).join('');
  return `<div class="page-heading"><button class="back-link" data-action="home">← Home</button><p class="eyebrow">AI Tutor</p><h1>Solve any problem step by step</h1><p>Ask any question from JAMB, university courses, or any subject. Get broken down in simple terms under a minute.</p></div><section class="tutor-section"><div class="chat-container" id="chat-container">${messages || '<p class="empty-note">Start by asking a question. e.g. "Explain quadratic equations like I\'m a beginner"</p>'}</div><form id="tutor-form" class="tutor-form"><textarea id="tutor-input" placeholder="Paste your question, upload problem, or describe what you need help with..." required></textarea><div class="tutor-actions"><label><input type="checkbox" id="tutor-ai-toggle" ${store.aiEnabled ? 'checked' : ''}> Use local AI (Ollama/Gemma)</label><button class="button primary" type="submit">Solve &amp; Explain</button><button class="button" type="button" data-action="clear-chat">Clear chat</button></div><p class="tutor-note">Local AI runs on your device via Ollama (localhost:11434). If unavailable, you'll get a structured explanation guide. No data leaves your device.</p></form></section>`;
}

function renderStudyPlan() {
  const plan = store.studyPlan;
  if (!plan) {
    return `<div class="page-heading"><button class="back-link" data-action="home">← Home</button><p class="eyebrow">Smart Study Plan</p><h1>Personalized Study Plan</h1><p>Tailored to your brain type, intelligence level, time, and goals.</p></div><section class="plan-setup"><form id="plan-form"><div class="form-group"><label>Goal</label><select name="goal" required><option value="jamb">Ace JAMB/UTME</option><option value="exam">Pass university exam</option><option value="gpa">Boost GPA</option><option value="catchup">Catch up on missed topics</option></select></div><div class="form-group"><label>Course/Subjects</label><input type="text" name="subjects" placeholder="e.g. Mathematics, Physics, CSC 201" required></div><div class="form-group"><label>Available hours per day</label><select name="hours" required><option value="1">1 hour</option><option value="2">2 hours</option><option value="3">3 hours</option><option value="4">4+ hours</option></select></div><div class="form-group"><label>Brain/learning style</label><select name="style" required><option value="visual">Visual (diagrams, videos)</option><option value="auditory">Auditory (explain aloud)</option><option value="kinesthetic">Kinesthetic (practice/do)</option><option value="reading">Reading/Writing (notes)</option><option value="mixed">Mixed (all)</option></select></div><div class="form-group"><label>Intelligence/work capacity</label><select name="capacity" required><option value="low">Takes time to grasp (need more repetition)</option><option value="average">Average - steady pace</option><option value="high">Quick learner (can go faster)</option></select></div><div class="form-group"><label>Exam date (optional)</label><input type="date" name="examdate"></div><button class="button primary" type="submit">Generate Plan</button></form></section>`;
  }
  return `<div class="page-heading"><button class="back-link" data-action="home">← Home</button><p class="eyebrow">Your Study Plan</p><h1>${escapeHtml(plan.goalLabel)} Plan</h1><p>Based on ${escapeHtml(plan.style)} learning style, ${escapeHtml(plan.capacityLabel)} pace • ${plan.hours}h/day</p></div><section class="plan-active"><div class="plan-overview"><div><strong>Focus</strong><p>${escapeHtml(plan.subjects)}</p></div>${plan.examdate ? `<div><strong>Days to exam</strong><p>${plan.daysToExam} days</p></div>` : ''}<div><strong>Plan type</strong><p>${plan.tier}</p></div></div><h2>Weekly schedule</h2><div class="plan-weeks">${plan.weeks.map((week, i) => `<details class="plan-week" ${i === 0 ? 'open' : ''}><summary>Week ${i+1} - ${week.focus}</summary><div class="week-content">${week.days.map(day => `<div class="day-block"><strong>${day.day}</strong><ul>${day.tasks.map(task => `<li>${escapeHtml(task)}</li>`).join('')}</ul></div>`).join('')}</div></details>`).join('')}</div><div class="plan-actions"><button class="button" data-action="regenerate-plan">Regenerate with tweaks</button><button class="button primary" data-action="upgrade-plan">Upgrade plan</button><button class="button" data-action="clear-plan">Start fresh</button></div><p class="plan-note">Tip: Do practice questions daily. Use the AI Tutor for anything you don't understand - break it down until it clicks!</p></section>`;
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
  if (action === 'library') { setScreen('library'); updateLibraryResults(); }
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
  if (action === 'tutor') { store.screen = 'tutor'; render(); }
  if (action === 'studyplan') { store.screen = 'studyplan'; render(); }
  if (action === 'clear-chat') { store.chatHistory = []; safeWrite('naija-chat-history', store.chatHistory); render(); }
  if (action === 'regenerate-plan') { store.studyPlan = null; safeWrite('naija-study-plan', null); render(); }
  if (action === 'clear-plan') { store.studyPlan = null; safeWrite('naija-study-plan', null); render(); }
  if (action === 'upgrade-plan') { if (store.studyPlan) { store.studyPlan.tier = store.studyPlan.tier === 'Free' ? 'Pro (more intensive)' : store.studyPlan.tier + '+'; store.studyPlan.weeks = upgradePlanWeeks(store.studyPlan); safeWrite('naija-study-plan', store.studyPlan); render(); } }
});
function upgradePlanWeeks(plan) {
  return plan.weeks.map(week => ({
    ...week,
    days: week.days.map(day => ({
      ...day,
      tasks: [...day.tasks, 'AI Tutor: Solve 2-3 past-style questions and explain mistakes']
    }))
  }));
}
document.addEventListener('input', event => {
  if (event.target.id === 'course-search') updateSearch(event.target.value);
  if (event.target.id === 'library-search') updateLibraryResults();
});
document.addEventListener('change', event => {
  if (event.target.dataset.action === 'ai-toggle') { store.aiEnabled = event.target.checked; render(); }
  if (event.target.id === 'library-type') updateLibraryResults();
});
document.addEventListener('submit', event => {
  if (event.target.id === 'mock-form') {
    event.preventDefault();
    const selected = [...event.target.querySelectorAll('input[name="mock-subject"]:checked')].map(input => input.value);
    const error = document.querySelector('#mock-error');
    if (selected.length !== 3) { error.textContent = 'Choose exactly three subjects in addition to compulsory English.'; return; }
    beginMock(selected);
    return;
  }
  if (event.target.id === 'tutor-form') {
    event.preventDefault();
    const input = document.querySelector('#tutor-input');
    const question = input.value.trim();
    if (!question) return;
    const useAi = document.querySelector('#tutor-ai-toggle')?.checked;
    store.chatHistory.push({ role: 'user', content: question });
    store.chatHistory.push({ role: 'assistant', content: 'Thinking... Breaking this down step by step for you.' });
    safeWrite('naija-chat-history', store.chatHistory);
    render();
    setTimeout(() => {
      const container = document.querySelector('#chat-container');
      if (container) container.scrollTop = container.scrollHeight;
    }, 50);
    (async () => {
      let answer;
      if (useAi && store.aiEnabled) {
        try {
          const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: 'gemma3', stream: false, prompt: `You are Naija Scholar AI Tutor. Solve this student's problem step by step in simple, easy-to-understand Nigerian-friendly language. Break it down so even a beginner can understand. Give clear steps, final answer, and tips to remember. Question: ${question}` }),
            signal: AbortSignal.timeout(30000)
          });
          if (response.ok) {
            const result = await response.json();
            answer = result.response || '';
          }
        } catch {}
      }
      if (!answer) {
        answer = `Step 1: Understand the question\n- Identify what you're being asked for\n- List knowns and unknowns\n\nStep 2: Approach\n- Recall relevant concept/formula\n- Break into smaller parts\n\nStep 3: Solution\n- Work through each part clearly\n- Show calculations/reasoning\n\nStep 4: Verify & Explain\n- Check if answer makes sense\n- Key takeaway in simple words\n\nFor: "${question}"\n\nTip: Tell me more details (course, topic, level) or use "Explain with local AI (Ollama)" for a custom breakdown. You can also practice similar questions in JAMB/University sections.`;
      }
      store.chatHistory[store.chatHistory.length - 1] = { role: 'assistant', content: answer };
      safeWrite('naija-chat-history', store.chatHistory);
      render();
      setTimeout(() => {
        const container = document.querySelector('#chat-container');
        if (container) container.scrollTop = container.scrollHeight;
      }, 50);
    })();
    input.value = '';
    return;
  }
  if (event.target.id === 'plan-form') {
    event.preventDefault();
    const form = event.target;
    const data = new FormData(form);
    const goal = data.get('goal');
    const subjects = data.get('subjects');
    const hours = Number(data.get('hours'));
    const style = data.get('style');
    const capacity = data.get('capacity');
    const examdate = data.get('examdate');
    const goalLabels = { jamb: 'JAMB/UTME', exam: 'Exam', gpa: 'GPA Boost', catchup: 'Catch-up' };
    const capacityLabels = { low: 'Gentle', average: 'Steady', high: 'Accelerated' };
    let daysToExam = null;
    if (examdate) {
      const diff = Math.ceil((new Date(examdate) - new Date()) / (1000*60*60*24));
      if (diff > 0) daysToExam = diff;
    }
    const weeks = generateStudyPlan({ goal, subjects, hours, style, capacity, daysToExam });
    store.studyPlan = { goal, goalLabel: goalLabels[goal], subjects, hours, style, capacity, capacityLabel: capacityLabels[capacity], examdate, daysToExam, tier: 'Free', weeks, created: new Date().toISOString() };
    safeWrite('naija-study-plan', store.studyPlan);
    render();
    return;
  }
});

function generateStudyPlan({ goal, subjects, hours, style, capacity, daysToExam }) {
  const baseTasks = {
    visual: ['Watch/read diagrams', 'Create mind maps', 'Use color-coded notes'],
    auditory: ['Explain topics aloud', 'Use mnemonics aloud', 'Discuss with study group'],
    kinesthetic: ['Solve questions immediately', 'Practice past questions', 'Teach someone else'],
    reading: ['Read notes thoroughly', 'Summarize each topic', 'Make flashcards'],
    mixed: ['Mix notes, practice & explanation']
  };
  const intensity = capacity === 'high' ? 1.5 : capacity === 'low' ? 0.7 : 1;
  const tasks = baseTasks[style] || baseTasks.mixed;
  const weeks = [];
  const weekCount = daysToExam && daysToExam < 30 ? 4 : 8;
  for (let w = 0; w < weekCount; w++) {
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => {
      if (day === 'Sun') {
        return { day, tasks: [`Review weak topics from this week (${Math.round(hours*0.5)}h)`, 'Rest/light revision', 'Plan next week'] };
      }
      return { day, tasks: [
        `Focus: ${subjects.split(',')[0].trim()} - ${tasks[0]} (${Math.round(hours*intensity*0.4)}h)`,
        `Practice: Solve questions (${Math.round(hours*intensity*0.4)}h)`,
        `AI Tutor: Fix mistakes & clarify (${Math.round(hours*intensity*0.2)}h)`
      ] };
    });
    weeks.push({ focus: w === 0 ? 'Foundation' : w < 3 ? 'Build & Practice' : w < weekCount-1 ? 'Intensive Revision' : 'Final Polish', days });
  }
  return weeks;
}

async function initialise() {
  store.theme = safeRead('gombe-theme', 'light');
  store.scores = safeRead('gombe-practice-scores', []);
  const [jamb, faculties, units, library] = await Promise.all([readJson('data/jamb.json'), readJson('data/faculties.json'), readJson('data/units.json'), readJson('data/library.json')]);
  store.jamb = jamb?.subjects || [];
  store.faculties = faculties?.faculties || [];
  store.units = units || { courses: [], gst: [] };
  store.library = Array.isArray(library) ? library : [];
  render();
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  }
}
initialise();
