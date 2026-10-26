/* Naija Scholar: small, data-driven static app. */
const appRoot = document.querySelector('#app');
const store = { screen: 'home', jamb: [], faculties: [], units: [], library: [], scores: [], theme: 'light', streak: safeRead('naija-streak', []), cgpaCourses: safeRead('naija-cgpa-courses', []) };
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
  const header = `<header class="topbar"><a class="brand" href="#" data-action="home"><span class="brand-mark" aria-hidden="true">🎓</span><span>Naija <b>Scholar</b></span></a><nav aria-label="Main navigation"><button class="text-button" data-action="planner">Study plan</button><button class="text-button" data-action="library">Library</button><button class="text-button nav-secondary" data-action="streak">Streak</button><button class="text-button nav-secondary" data-action="cgpa">CGPA</button><button class="icon-button" aria-label="Toggle colour theme" title="Toggle theme" data-action="theme">${store.theme === 'dark' ? '☀' : '◐'}</button></nav></header>`;
  const pages = {
    home: renderHome,
    planner: renderPlanner,
    streak: renderStreak,
    cgpa: renderCgpa,
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
    result: renderResult
  };
  appRoot.innerHTML = `${header}<main>${(pages[store.screen] || renderHome)()}</main><footer>Independent practice material. Not affiliated with JAMB or any university.</footer>`;
  if (store.screen === 'quiz' && session?.kind === 'mock') startClock();
}
function renderHome() {
  const saved = store.scores.length;
  const streak = currentStreak();
  return `<section class="welcome"><p class="eyebrow">Learn. Pass. Succeed.</p><h1>Naija Scholar<br><em>Free exam prep for Nigerians.</em></h1><p class="lede">Practice questions, adaptive study plans, and tools that keep you consistent.</p><h2>Who are you?</h2><div class="role-grid"><button class="role-card jamb-card" data-action="jamb"><span class="role-number">01 / JAMB</span><strong>JAMB candidate</strong><span>Preparing for UTME, or just getting started.</span><span class="arrow">Explore practice <b>↗</b></span></button><button class="role-card uni-card" data-action="university"><span class="role-number">02 / UNIVERSITY</span><strong>University student</strong><span>Find your course units and practise by level.</span><span class="arrow">Browse courses <b>↗</b></span></button></div><h2 class="home-tools-title">Student tools</h2><div class="home-tools"><button class="tool-link" data-action="planner"><span>01</span><strong>Build a study plan</strong><small>Set a pace that fits your time and confidence</small><b>↗</b></button><button class="tool-link" data-action="streak"><span>02</span><strong>${streak}-day study streak</strong><small>Mark today's session and keep the chain alive</small><b>↗</b></button><button class="tool-link" data-action="cgpa"><span>03</span><strong>CGPA calculator</strong><small>Estimate your GPA on the 5-point scale</small><b>↗</b></button><button class="tool-link" data-action="library"><span>04</span><strong>Study library</strong><small>Past questions, textbooks, courses, and developer docs</small><b>↗</b></button><button class="tool-link" data-action="contribute"><span>05</span><strong>Contribute</strong><small>Add original questions or improve the project</small><b>↗</b></button></div><div class="home-foot"><span>15 JAMB subjects</span><span>Works offline after first load</span><span>${saved} saved practice ${saved === 1 ? 'result' : 'results'}</span></div></section>`;
}
function dateInputValue(daysFromNow = 14) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
function plannerFocusOptions(track, course, level) {
  if (track === 'jamb') return store.jamb.map(subject => ({ key: `jamb:${slugify(subject.name)}`, label: subject.name }));
  const courseData = store.units.courses.find(item => item.name === course);
  const units = courseData?.levels?.[level] || [];
  const courseFocus = { key: `course:${slugify(course || 'degree')}`, label: `${course || 'Degree programme'} core topics` };
  return [courseFocus, ...units.map(unit => ({ key: `unit:${slugify(unit.code)}`, label: `${unit.code} · ${unit.title}` }))];
}
function renderPlanFocusOptions({ track = 'jamb', course = 'Computer Science', level = '200', focus = [] } = {}) {
  const available = plannerFocusOptions(track, course, level);
  const chosen = new Set(focus.map(item => item.key));
  const defaultCount = track === 'jamb' ? 4 : 3;
  return available.map((item, index) => { const rating = focus.find(selected => selected.key === item.key)?.confidence || 3; return `<label class="plan-focus-row"><input class="focus-checkbox" type="checkbox" value="${escapeHtml(item.key)}" ${chosen.size ? (chosen.has(item.key) ? 'checked' : '') : (index < defaultCount ? 'checked' : '')}><span>${escapeHtml(item.label)}</span><select class="focus-confidence" aria-label="Confidence in ${escapeHtml(item.label)}">${[[1, 'New to me'], [2, 'Need practice'], [3, 'Getting there'], [4, 'Confident'], [5, 'Very confident']].map(([value, label]) => `<option value="${value}" ${rating === value ? 'selected' : ''}>${label}</option>`).join('')}</select></label>`; }).join('');
}
function renderPlanForm(plan = null) {
  const track = plan?.track || 'jamb';
  const course = plan?.course || 'Computer Science';
  const level = plan?.level || '200';
  const courses = allCourses().map(item => item.name).filter((name, index, values) => values.indexOf(name) === index);
  const courseOptions = courses.map(name => `<option value="${escapeHtml(name)}" ${name === course ? 'selected' : ''}>${escapeHtml(name)}</option>`).join('');
  const selectedFocus = plan?.focus || [];
  return `<form id="plan-form" class="plan-form"><div class="plan-input-grid"><label>Preparing for<select id="plan-track" name="track"><option value="jamb" ${track === 'jamb' ? 'selected' : ''}>JAMB</option><option value="university" ${track === 'university' ? 'selected' : ''}>University</option></select></label><div class="uni-plan-fields" ${track !== 'university' ? 'hidden' : ''}><label>Degree programme<select id="plan-course" name="course">${courseOptions}</select></label><label>Current level<select id="plan-level" name="level">${[100, 200, 300, 400, 500, ...(course === 'Medicine and Surgery' ? [600] : [])].map(value => `<option value="${value}" ${String(value) === String(level) ? 'selected' : ''}>${value} level</option>`).join('')}</select></label></div><label>Exam or target date<input type="date" name="targetDate" min="${dateInputValue(0)}" value="${escapeHtml(plan?.targetDate || dateInputValue())}" required></label><label>Study time per study day<select name="dailyMinutes">${[20, 30, 45, 60, 90, 120, 180].map(minutes => `<option value="${minutes}" ${Number(plan?.dailyMinutes || 60) === minutes ? 'selected' : ''}>${minutes} minutes</option>`).join('')}</select></label><label>Days per week<select name="daysPerWeek">${[3, 4, 5, 6, 7].map(days => `<option value="${days}" ${Number(plan?.daysPerWeek || 5) === days ? 'selected' : ''}>${days} days</option>`).join('')}</select></label><label>How do you like to study?<select name="studyStyle"><option value="examples" ${plan?.studyStyle !== 'recall' && plan?.studyStyle !== 'practice' ? 'selected' : ''}>Short explanation, then worked examples</option><option value="recall" ${plan?.studyStyle === 'recall' ? 'selected' : ''}>Read, then explain it from memory</option><option value="practice" ${plan?.studyStyle === 'practice' ? 'selected' : ''}>Practice questions first</option></select></label></div><fieldset class="focus-fieldset"><legend>Choose focus areas and rate your confidence</legend><p class="planner-hint">This is your own estimate, not an intelligence test. Newer areas will appear more often.</p><div id="plan-focus-options" class="plan-focus-list">${renderPlanFocusOptions({ track, course, level, focus: selectedFocus })}</div></fieldset><fieldset class="pace-fieldset"><legend>Choose a pace</legend><div class="pace-options">${[['steady', 'Steady', 'One focused block'], ['focused', 'Focused', 'Two shorter blocks'], ['intensive', 'Intensive', 'Up to three short blocks']].map(([value, label, help]) => `<label class="pace-option"><input type="radio" name="pace" value="${value}" ${plan?.pace === value || (!plan && value === 'steady') ? 'checked' : ''}><span><b>${label}</b><small>${help}</small></span></label>`).join('')}</div></fieldset><p class="form-error" role="alert"></p><button class="button primary" type="submit">${plan ? 'Update my plan' : 'Build my study plan'}</button><p class="planner-hint">Plans adjust around your schedule and self-rated confidence. Consistent practice helps, but results are never guaranteed.</p></form>`;
}
function renderPlanner() {
  if (!store.plan) return `<div class="page-heading"><button class="back-link" data-action="home">← Home</button><p class="eyebrow">Your time. Your pace.</p><h1>Build a study plan</h1><p>Choose what you are studying, how much time you have, and where you want more practice.</p></div><section class="planner-intro"><span class="planner-number">01</span><div><h2>Start with what you know about yourself</h2><p>Set your own confidence, availability, and preferred study style. You can change everything later.</p></div></section>${renderPlanForm()}`;
  const plan = store.plan;
  const completed = new Set(plan.completed || []);
  const sessions = plan.schedule.flatMap(day => day.sessions);
  const finished = sessions.filter(task => completed.has(task.id)).length;
  const daysRemaining = Math.max(1, Math.ceil((new Date(`${plan.targetDate}T12:00:00`) - new Date()) / 86400000));
  const paceName = { steady: 'Steady', focused: 'Focused', intensive: 'Intensive' }[plan.pace];
  return `<div class="page-heading"><button class="back-link" data-action="home">← Home</button><p class="eyebrow">Your plan · ${escapeHtml(paceName)}</p><h1>Small steps, steady progress.</h1><p>${escapeHtml(plan.track === 'jamb' ? 'JAMB preparation' : `${plan.course} · ${plan.level} level`)} · ${plan.dailyMinutes} minutes per study day · ${plan.daysPerWeek} days per week</p></div><section class="plan-progress"><div><span class="eyebrow">THIS WEEK</span><strong>${finished} / ${sessions.length}</strong><span>study blocks complete</span></div><div class="progress-track"><span style="width:${sessions.length ? Math.round(finished / sessions.length * 100) : 0}%"></span></div><p>${daysRemaining} days until your target date. Adjust your pace or focus any time.</p></section><div class="plan-upgrade"><div><strong>Need a different pace?</strong><span>Change the number of short study blocks without changing your daily time budget.</span></div><button class="button small" data-action="upgrade-plan">${plan.pace === 'intensive' ? 'Switch to steady' : 'Upgrade pace'}</button></div><section class="week-plan"><h2>Your next 7 days</h2>${plan.schedule.map(day => `<article class="plan-day"><div class="plan-day-heading"><div><span>${escapeHtml(day.label)}</span><strong>${escapeHtml(day.dateLabel)}</strong></div><small>${day.sessions.length ? `${day.totalMinutes} min` : 'Rest day'}</small></div>${day.sessions.length ? day.sessions.map(task => `<label class="plan-task ${completed.has(task.id) ? 'is-done' : ''}"><input type="checkbox" data-action="plan-check" data-task="${escapeHtml(task.id)}" ${completed.has(task.id) ? 'checked' : ''}><span><strong>${escapeHtml(task.title)}</strong><small>${task.minutes} min · ${escapeHtml(task.activity)}</small></span></label>`).join('') : '<p class="rest-day">Rest or take a short walk. A break is part of the plan.</p>'}</article>`).join('')}</section><details class="plan-edit"><summary>Edit study preferences</summary>${renderPlanForm(plan)}</details>`;
}
function makeStudySchedule(plan) {
  const paceBlocks = { steady: 1, focused: 2, intensive: 3 }[plan.pace] || 1;
  const blockCount = Math.min(paceBlocks, Math.max(1, Math.floor(plan.dailyMinutes / 15)));
  const baseMinutes = Math.floor(plan.dailyMinutes / blockCount);
  const orderedFocus = [...plan.focus].sort((first, second) => first.confidence - second.confidence);
  const week = [];
  const start = new Date();
  let distribution = 7 - plan.daysPerWeek;
  let focusIndex = 0;
  for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + dayIndex);
    distribution += plan.daysPerWeek;
    const isStudyDay = distribution >= 7;
    if (isStudyDay) distribution -= 7;
    const sessions = [];
    if (isStudyDay) {
      for (let blockIndex = 0; blockIndex < blockCount; blockIndex += 1) {
        const focus = orderedFocus[focusIndex % orderedFocus.length];
        focusIndex += 1;
        const activity = plan.studyStyle === 'recall' ? ['Review briefly, then explain from memory', 'Write key ideas without notes', 'Check your recall and correct gaps'][blockIndex] : plan.studyStyle === 'practice' ? ['Try practice questions before reviewing notes', 'Review mistakes and solve a similar question', 'Do a short timed question set'][blockIndex] : ['Read a short explanation and work one example', 'Solve a similar example without looking', 'Summarise the method and check your steps'][blockIndex];
        sessions.push({ id: `${date.toISOString().slice(0, 10)}-${slugify(focus.key)}-${blockIndex}`, title: focus.label, minutes: baseMinutes + (blockIndex < plan.dailyMinutes % blockCount ? 1 : 0), activity });
      }
    }
    week.push({ label: date.toLocaleDateString('en-NG', { weekday: 'long' }), dateLabel: date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }), sessions, totalMinutes: sessions.reduce((total, task) => total + task.minutes, 0) });
  }
  return week;
}
function collectPlanForm(form) {
  const values = new FormData(form);
  const focus = [...form.querySelectorAll('.plan-focus-row')].filter(row => row.querySelector('.focus-checkbox').checked).map(row => ({ key: row.querySelector('.focus-checkbox').value, label: row.querySelector('.plan-focus-row span').textContent, confidence: Number(row.querySelector('.focus-confidence').value) }));
  return { track: values.get('track'), course: values.get('course'), level: values.get('level'), targetDate: values.get('targetDate'), dailyMinutes: Number(values.get('dailyMinutes')), daysPerWeek: Number(values.get('daysPerWeek')), studyStyle: values.get('studyStyle'), pace: values.get('pace'), focus };
}
function saveStudyPlan(event) {
  event.preventDefault();
  const plan = collectPlanForm(event.target);
  const message = event.target.querySelector('.form-error');
  if (!plan.focus.length) { message.textContent = 'Choose at least one subject or course unit to focus on.'; return; }
  if (!plan.targetDate || plan.targetDate < dateInputValue(0)) { message.textContent = 'Choose today or a future target date.'; return; }
  const previousCompleted = new Set(store.plan?.completed || []);
  plan.schedule = makeStudySchedule(plan);
  plan.completed = plan.schedule.flatMap(day => day.sessions).filter(task => previousCompleted.has(task.id)).map(task => task.id);
  store.plan = plan;
  safeWrite('naija-study-plan', plan);
  render();
}
function refreshPlanFields() {
  const form = document.querySelector('#plan-form');
  if (!form) return;
  const track = form.querySelector('#plan-track').value;
  const course = form.querySelector('#plan-course').value;
  const courseData = store.units.courses.find(item => item.name === course);
  const availableLevels = Object.keys(courseData?.levels || {}).map(Number);
  if (track === 'university' && availableLevels.length) {
    const level = form.querySelector('#plan-level');
    level.innerHTML = [...new Set([...availableLevels, ...(course === 'Medicine and Surgery' ? [600] : [])])].sort((first, second) => first - second).map(value => `<option value="${value}">${value} level</option>`).join('');
  }
  form.querySelector('.uni-plan-fields').hidden = track !== 'university';
  const focus = form.querySelector('#plan-focus-options');
  focus.innerHTML = renderPlanFocusOptions({ track, course, level: form.querySelector('#plan-level').value });
}
function upgradeStudyPlan() {
  const paceOrder = ['steady', 'focused', 'intensive'];
  const current = paceOrder.indexOf(store.plan.pace);
  store.plan.pace = current === paceOrder.length - 1 ? paceOrder[0] : paceOrder[current + 1];
  store.plan.schedule = makeStudySchedule(store.plan);
  safeWrite('naija-study-plan', store.plan);
  render();
}
function localDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
function currentStreak() {
  const days = new Set(store.streak || []);
  let streak = 0;
  const cursor = new Date();
  while (days.has(localDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
function longestStreak() {
  const days = [...new Set(store.streak || [])].sort();
  let best = 0, run = 0, previous = null;
  for (const key of days) {
    const date = new Date(`${key}T00:00:00`);
    run = previous && Math.round((date - previous) / 86400000) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    previous = date;
  }
  return best;
}
function studiedToday() {
  return (store.streak || []).includes(localDateKey());
}
function renderStreak() {
  const days = new Set(store.streak || []);
  const streak = currentStreak();
  const best = longestStreak();
  const last28 = Array.from({ length: 28 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (27 - index));
    const key = localDateKey(date);
    return { key, active: days.has(key), label: date.toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' }) };
  });
  return `<div class="page-heading"><button class="back-link" data-action="home">← Home</button><p class="eyebrow">Study streak</p><h1>Keep the chain alive</h1><p>Small daily sessions beat one long cram. Mark each day you study, then watch your streak grow.</p></div><section class="streak-section"><div class="streak-stats"><div><strong>${streak}</strong><span>current streak</span></div><div><strong>${best}</strong><span>best streak</span></div><div><strong>${(store.streak || []).length}</strong><span>total study days</span></div></div><div class="streak-action">${studiedToday() ? button('Undo today', 'undo-study') : button('Mark today as studied', 'mark-study', 'primary')}<span>${studiedToday() ? 'Logged for today. Come back tomorrow to extend your streak.' : 'One session today keeps your streak alive.'}</span></div><h2>Last 28 days</h2><div class="streak-grid" aria-label="Study attendance for the last 28 days">${last28.map(day => `<span class="streak-day ${day.active ? 'is-active' : ''}" title="${escapeHtml(day.label)}${day.active ? ' · studied' : ''}" aria-label="${escapeHtml(day.label)}${day.active ? ', studied' : ', no session'}">${day.active ? '✓' : ''}</span>`).join('')}</div><p class="streak-note">Your streak is saved on this device only. Aim for a 7-day streak first, then push to 30.</p></section>`;
}
const GRADE_POINTS = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };
function renderCgpa() {
  const courses = store.cgpaCourses || [];
  const totalUnits = courses.reduce((sum, course) => sum + Number(course.units || 0), 0);
  const totalPoints = courses.reduce((sum, course) => sum + Number(course.units || 0) * (GRADE_POINTS[course.grade] ?? 0), 0);
  const gpa = totalUnits ? (totalPoints / totalUnits) : 0;
  const classification = gpa >= 4.5 ? 'First Class' : gpa >= 3.5 ? 'Second Class Upper' : gpa >= 2.4 ? 'Second Class Lower' : gpa >= 1.5 ? 'Third Class' : gpa > 0 ? 'Pass' : '—';
  return `<div class="page-heading"><button class="back-link" data-action="home">← Home</button><p class="eyebrow">CGPA calculator</p><h1>Estimate your GPA</h1><p>Add each course, its credit units, and your grade. This calculator uses the Nigerian 5-point scale.</p></div><section class="cgpa-section"><form id="cgpa-form" class="cgpa-form"><label><span>Course code</span><input name="code" placeholder="e.g. CSC 201" required></label><label><span>Units</span><input name="units" type="number" min="1" max="6" value="3" required></label><label><span>Grade</span><select name="grade" required><option value="A">A (5)</option><option value="B">B (4)</option><option value="C">C (3)</option><option value="D">D (2)</option><option value="E">E (1)</option><option value="F">F (0)</option></select></label><button class="button primary" type="submit">Add course</button></form><div class="cgpa-summary"><div><strong>${gpa.toFixed(2)}</strong><span>GPA</span></div><div><strong>${totalUnits}</strong><span>total units</span></div><div><strong>${classification}</strong><span>estimated class</span></div></div>${courses.length ? `<div class="cgpa-table">${courses.map(course => `<div class="cgpa-row"><span><b>${escapeHtml(course.code)}</b></span><span>${course.units} units</span><span class="grade-pill">${escapeHtml(course.grade)}</span><button class="button small" data-action="remove-course" data-id="${escapeHtml(course.id)}">Remove</button></div>`).join('')}</div><div class="cgpa-actions"><button class="button" data-action="reset-cgpa">Clear all courses</button></div>` : '<p class="empty-note">No courses added yet. Add your first course above.</p>'}<p class="streak-note">This is an estimate for planning. Always confirm your official CGPA with your department.</p></section>`;
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
function renderMissing(message) { return `<div class="page-heading"><button class="back-link" data-action="home">← Home</button><p class="empty-note">${escapeHtml(message)}</p></div>`; }
function renderQuiz() {
  if (!session) return renderMissing('No active practice session.');
  if (session.kind === 'mock') return renderMockQuestion();
  const item = session.questions[session.index];
  if (!item) return renderResult();
  const feedback = session.answered ? `<section class="answer-feedback ${session.lastCorrect ? 'is-correct' : 'is-wrong'}"><strong>${session.lastCorrect ? 'Correct' : 'Review this answer'}</strong><p><b>Answer: ${escapeHtml(item.options[item.answer])}</b></p><p>${escapeHtml(item.explanation)}</p><button class="button primary" data-action="next-question">${session.index + 1 === session.questions.length ? 'View results' : 'Next question'}</button></section>` : '';
  const options = item.options.map((option, index) => `<button class="answer-option ${session.answered && index === item.answer ? 'answer-correct' : ''} ${session.answered && index === session.selected && !session.lastCorrect ? 'answer-wrong' : ''}" data-action="answer" data-index="${index}" ${session.answered ? 'disabled' : ''}><span>${String.fromCharCode(65 + index)}</span>${escapeHtml(option)}</button>`).join('');
  return `<div class="quiz-top"><button class="back-link" data-action="end-practice">← End practice</button><span>${session.index + 1} / ${session.questions.length}</span></div><div class="progress-track"><span style="width:${((session.index + 1) / session.questions.length) * 100}%"></span></div><article class="question-panel"><p class="eyebrow">Practice question · ${escapeHtml(item.subject || session.subject)} · ${escapeHtml(item.topic)}</p>${item.year || item.source ? `<p class="source-tag">${item.year ? `Year ${escapeHtml(item.year)}` : ''}${item.source ? ` · ${escapeHtml(item.source)}` : ''}</p>` : ''}<h1>${escapeHtml(item.q)}</h1><div class="answer-list">${options}</div>${feedback}</article>`;
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
document.addEventListener('click', async event => {
  const control = event.target.closest('[data-action]');
  if (!control) return;
  const action = control.dataset.action;
  if (action === 'theme') { store.theme = store.theme === 'dark' ? 'light' : 'dark'; safeWrite('gombe-theme', store.theme); render(); }
  if (action === 'home') setScreen('home');
  if (action === 'planner') setScreen('planner');
  if (action === 'upgrade-plan') upgradeStudyPlan();
  if (action === 'streak') setScreen('streak');
  if (action === 'cgpa') setScreen('cgpa');
  if (action === 'mark-study') {
    store.streak = [...new Set([...(store.streak || []), localDateKey()])].sort();
    safeWrite('naija-streak', store.streak);
    render();
  }
  if (action === 'undo-study') {
    store.streak = (store.streak || []).filter(day => day !== localDateKey());
    safeWrite('naija-streak', store.streak);
    render();
  }
  if (action === 'remove-course') {
    store.cgpaCourses = (store.cgpaCourses || []).filter(course => course.id !== control.dataset.id);
    safeWrite('naija-cgpa-courses', store.cgpaCourses);
    render();
  }
  if (action === 'reset-cgpa') {
    store.cgpaCourses = [];
    safeWrite('naija-cgpa-courses', store.cgpaCourses);
    render();
  }
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
});
document.addEventListener('input', event => {
  if (event.target.id === 'course-search') updateSearch(event.target.value);
  if (event.target.id === 'library-search') updateLibraryResults();
});
document.addEventListener('change', event => {
  if (event.target.id === 'library-type') updateLibraryResults();
  if (['plan-track', 'plan-course', 'plan-level'].includes(event.target.id)) refreshPlanFields();
  if (event.target.dataset.action === 'plan-check' && store.plan) {
    const completed = new Set(store.plan.completed || []);
    if (event.target.checked) completed.add(event.target.dataset.task);
    else completed.delete(event.target.dataset.task);
    store.plan.completed = [...completed];
    safeWrite('naija-study-plan', store.plan);
    render();
  }
});
document.addEventListener('submit', event => {
  if (event.target.id === 'plan-form') { saveStudyPlan(event); return; }
  if (event.target.id === 'cgpa-form') {
    event.preventDefault();
    const data = new FormData(event.target);
    const code = String(data.get('code') || '').trim();
    const units = Math.min(6, Math.max(1, Number(data.get('units') || 3)));
    const grade = String(data.get('grade') || 'A').charAt(0).toUpperCase();
    if (!code || !(grade in GRADE_POINTS)) return;
    store.cgpaCourses = [...(store.cgpaCourses || []), { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, code, units, grade }];
    safeWrite('naija-cgpa-courses', store.cgpaCourses);
    render();
    return;
  }
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
  store.plan = safeRead('naija-study-plan', null);
  const [jamb, faculties, units, library] = await Promise.all([readJson('data/jamb.json'), readJson('data/faculties.json'), readJson('data/units.json'), readJson('data/library.json')]);
  if ([jamb, faculties, units, library].some(data => data === null)) {
    console.error('Naija Scholar could not load its required data files.');
    appRoot.innerHTML = '<main><section class="empty-note" role="alert"><h1>Naija Scholar could not load</h1><p>Check your connection and make sure you opened the app from a web server, then try again.</p><a href="./">Reload the app</a></section></main>';
    return;
  }
  store.jamb = jamb?.subjects || [];
  store.faculties = faculties?.faculties || [];
  store.units = units || { courses: [], gst: [] };
  store.library = Array.isArray(library) ? library : [];
  render();
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('./service-worker.js').catch(error => {
      console.error('Naija Scholar could not enable offline support:', error);
    });
  }
}
initialise();
