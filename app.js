"use strict";

const STORAGE_KEY = "desinv-sortinghat-v4";
const SCORING_MODEL_VERSION = 2;
const COHORT_NAMES = { A: "Hufflestuff", B: "Ravenworks" };

const TOOL_DEFINITIONS = [
  { key: "prototyping", label: "Prototyping", category: "Making", axis: -1 },
  { key: "cad", label: "CAD (Rhino, etc.)", category: "Making", axis: -1 },
  { key: "parametric", label: "Parametric modelling", category: "Making + code", axis: -1 },
  { key: "database", label: "Databases (MySQL, etc.)", category: "Software", axis: 1 },
  { key: "machineLearning", label: "Machine learning", category: "Software", axis: 1 },
  { key: "microcontrollers", label: "Microcontrollers (Arduino, etc.)", category: "Electronics", axis: -1 },
  { key: "electronics", label: "Electronics (sensors + actuators)", category: "Electronics", axis: -1 },
  { key: "webhooks", label: "Webhooks", category: "Software", axis: 1 },
  { key: "api", label: "APIs", category: "Software", axis: 1 },
  { key: "javascript", label: "JavaScript (p5.js, etc.)", category: "Creative code", axis: 1 },
  { key: "printing3d", label: "3D printing", category: "Fabrication", axis: -1 },
  { key: "laserCutting", label: "Laser cutting", category: "Fabrication", axis: -1 },
  { key: "figma", label: "Figma", category: "Interface", axis: 1 },
  { key: "github", label: "GitHub", category: "Software practice", axis: 1 },
  { key: "copilot", label: "GitHub Copilot", category: "Software practice", axis: 1 },
  { key: "vscode", label: "Visual Studio Code", category: "Software practice", axis: 1 },
  { key: "visualStudio", label: "Visual Studio", category: "Software practice", axis: 1 },
  { key: "openai", label: "OpenAI (ChatGPT)", category: "AI", axis: 1 },
  { key: "llm", label: "Large language models", category: "AI", axis: 1 },
  { key: "instruments", label: "Musical instruments", category: "Creative practice", axis: 0 },
  { key: "projectManagement", label: "Project management tools", category: "Collaboration", axis: 0 },
  { key: "nlp", label: "Natural language processing", category: "AI", axis: 1 }
];

const AREA_DEFINITIONS = [
  { key: "areaTechnology", value: "Technology and Software Development", label: "Technology + software development", category: "Background", axis: 1 },
  { key: "areaManufacturing", value: "Manufacturing and Engineering", label: "Manufacturing + engineering", category: "Background", axis: -1 },
  { key: "areaDesign", value: "Design (Graphic, UX/UI, Industrial)", label: "Design (graphic, UX/UI, industrial)", category: "Background", axis: 0 },
  { key: "areaMarketing", value: "Marketing and Sales", label: "Marketing + sales", category: "Background", axis: 0 },
  { key: "areaHealthcare", value: "Healthcare and Medical Services", label: "Healthcare + medical services", category: "Background", axis: 0 },
  { key: "areaFinance", value: "Finance and Accounting", label: "Finance + accounting", category: "Background", axis: 1 },
  { key: "areaEducation", value: "Education and Training", label: "Education + training", category: "Background", axis: 0 },
  { key: "areaNonprofit", value: "Non-Profit and Social Impact", label: "Non-profit + social impact", category: "Background", axis: 0 },
  { key: "areaMedia", value: "Media and Entertainment", label: "Media + entertainment", category: "Background", axis: 1 }
];

const SIGNAL_DEFINITIONS = [...TOOL_DEFINITIONS, ...AREA_DEFINITIONS];

const ACTIVITY_SIGNALS = [
  { key: "activityGithub", match: ["contributed to a public or private github repo"], axis: 1 },
  { key: "activityMicro", match: ["prototype using microcontrollers"], axis: -1 },
  { key: "activityCad", match: ["sketch or drawing using a cad tool"], axis: -1 },
  { key: "activityWritingAi", match: ["assistant or ai like chatgpt"], axis: 1 },
  { key: "activityImageAi", match: ["generative ai like midjourney"], axis: 1 }
];

const SAMPLE_STUDENTS = [
  sampleStudent("Maya", "she/her", 2, { prototyping: 4, cad: 4, parametric: 3, microcontrollers: 3, electronics: 2, printing3d: 4, laserCutting: 3, figma: 3, javascript: 1, vscode: 1 }),
  sampleStudent("Leo", "he/him", 1, { javascript: 4, api: 4, webhooks: 3, github: 4, vscode: 4, database: 3, machineLearning: 3, openai: 4, llm: 3, prototyping: 2 }),
  sampleStudent("Sam", "they/them", 0, { figma: 4, prototyping: 3, cad: 2, javascript: 3, github: 2, openai: 4, projectManagement: 3, printing3d: 2 }),
  sampleStudent("Nia", "she/her", 3, { electronics: 4, microcontrollers: 4, prototyping: 4, cad: 2, api: 3, javascript: 3, github: 3, vscode: 3, printing3d: 3 }),
  sampleStudent("Owen", "he/him", 2, { machineLearning: 4, database: 4, nlp: 4, llm: 4, javascript: 3, github: 3, api: 4, openai: 4, electronics: 1 }),
  sampleStudent("Priya", "she/they", 1, { cad: 3, parametric: 4, printing3d: 3, laserCutting: 4, prototyping: 4, javascript: 2, figma: 3, microcontrollers: 2 }),
  sampleStudent("Rin", "they/them", 0, { prototyping: 2, figma: 4, projectManagement: 4, openai: 3, instruments: 4, javascript: 2, cad: 2, github: 2 }),
  sampleStudent("Theo", "he/they", 3, { microcontrollers: 4, electronics: 4, printing3d: 4, laserCutting: 3, prototyping: 4, cad: 3, vscode: 2, github: 2 }),
  sampleStudent("Amina", "she/her", 2, { javascript: 4, machineLearning: 3, api: 4, github: 4, vscode: 4, figma: 3, projectManagement: 4, prototyping: 2 }),
  sampleStudent("Jules", "they/she", 1, { parametric: 4, cad: 3, javascript: 3, printing3d: 3, microcontrollers: 3, electronics: 2, github: 3, vscode: 3, figma: 2 }),
  sampleStudent("Cal", "he/him", 0, { instruments: 4, prototyping: 3, electronics: 3, microcontrollers: 2, openai: 3, llm: 2, javascript: 2, projectManagement: 3 })
];

const COURSE_STUDENTS = [];
const COURSE_DATASET_LABEL = "No roster loaded";

function sampleStudent(name, pronouns, experience, skills) {
  return {
    id: `sample-${name.toLowerCase()}`,
    name,
    pronouns,
    experience,
    areas: [],
    skills: Object.fromEntries(TOOL_DEFINITIONS.map((tool) => [tool.key, skills[tool.key] || 0])),
    activities: {},
    directPosition: null
  };
}

let state = loadState() || {
  students: structuredClone(COURSE_STUDENTS),
  scoringModelVersion: SCORING_MODEL_VERSION,
  datasetLabel: COURSE_DATASET_LABEL,
  sortMode: "balanced",
  teams: null,
  decisionLog: []
};

let editingId = null;
let toastTimer = null;

const els = {};

document.addEventListener("DOMContentLoaded", init);

function init() {
  cacheElements();
  buildManualSkills();
  bindEvents();
  const params = new URLSearchParams(window.location.search);
  const requestedMode = params.get("mode");
  if (["balanced", "split"].includes(requestedMode)) {
    state.sortMode = requestedMode;
    state.teams = null;
  }
  renderAll();
  const requestedView = params.get("view");
  if (["roster", "scoring", "results"].includes(requestedView)) showView(requestedView);
}

function cacheElements() {
  [
    "restartButton", "csvInput", "addStudentButton", "studentCount",
    "landingPage", "enterSite", "brandHome",
    "datasetLabel", "studentSearch", "loadSampleButton", "rosterBody", "readinessDot",
    "readinessText", "previewDots", "classCenter",
    "classConfidence", "scoringStatus", "workedExampleStudent", "workedExampleBody", "formulaToggle", "formulaContent", "runSortButton", "sortButtonLabel", "sortAgainButton",
    "exportButton", "resultsTitle", "resultsSummary", "balanceScoreBadge", "balanceScore", "balanceDenominator", "balanceKicker", "balanceTitle", "balanceDescription",
    "balanceMetrics", "teamACount", "teamBCount", "teamAList", "teamBList", "teamARange",
    "teamBRange", "teamAName", "teamBName", "teamAFooter", "teamBFooter", "dragHint", "explainToggle", "explainBody", "decisionLog",
    "sortMapTitle", "sortMapSummary", "sortMapChart", "sortMapPlot", "sortMapMedian", "sortMapMedianLabel", "sortMapCut", "sortMapCutLabel", "sortMapStudents", "sortMapNote",
    "studentDialog", "studentDialogTitle", "studentForm", "manualAreas", "manualSkills", "saveStudentButton",
    "toast"
  ].forEach((id) => { els[id] = document.getElementById(id); });
}

function bindEvents() {
  els.enterSite.addEventListener("click", enterSite);
  els.brandHome.addEventListener("click", showLandingPage);
  document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => showView(button.dataset.view)));
  document.querySelectorAll("[data-next]").forEach((button) => button.addEventListener("click", () => showView(button.dataset.next)));
  els.addStudentButton.addEventListener("click", () => openStudentDialog());
  els.studentSearch.addEventListener("input", renderRoster);
  els.loadSampleButton.addEventListener("click", loadSampleRoster);
  els.csvInput.addEventListener("change", importCsv);
  els.runSortButton.addEventListener("click", runSort);
  els.sortAgainButton.addEventListener("click", runSort);
  els.exportButton.addEventListener("click", exportTeams);
  els.restartButton.addEventListener("click", restartSession);
  els.formulaToggle.addEventListener("click", () => togglePanel(els.formulaToggle.closest(".formula-card"), els.formulaToggle));
  els.explainToggle.addEventListener("click", () => togglePanel(els.explainToggle.closest(".explain-card"), els.explainToggle));
  els.studentForm.addEventListener("submit", saveStudent);
  els.rosterBody.addEventListener("click", handleRosterAction);
  els.workedExampleStudent.addEventListener("change", renderWorkedExample);
  document.querySelectorAll('input[name="sortMode"]').forEach((input) => input.addEventListener("change", handleSortModeChange));
  [els.teamAList, els.teamBList].forEach(bindDropZone);
}

function enterSite() {
  document.body.classList.remove("is-landing");
  requestAnimationFrame(() => document.querySelector(".workspace").scrollIntoView({ block: "start" }));
}

function showLandingPage(event) {
  event.preventDefault();
  document.body.classList.add("is-landing");
  window.scrollTo({ top: 0, behavior: "auto" });
  els.enterSite.focus({ preventScroll: true });
}

function renderAll() {
  normalizeState();
  renderRoster();
  renderPreview();
  renderScoringStatus();
  renderWorkedExample();
  renderSortMode();
  renderResults();
  saveState();
}

function normalizeState() {
  state.students ||= [];
  state.datasetLabel ||= "Local roster";
  state.sortMode ||= "balanced";
  const scoringModelChanged = state.scoringModelVersion !== SCORING_MODEL_VERSION;
  const hadLegacyWeights = Object.prototype.hasOwnProperty.call(state, "weights");
  if (hadLegacyWeights) {
    delete state.weights;
  }
  if (scoringModelChanged || hadLegacyWeights) {
    state.teams = null;
    state.decisionLog = [];
    state.scoringModelVersion = SCORING_MODEL_VERSION;
  }
}

function showView(name) {
  document.querySelectorAll(".step-tab").forEach((tab) => tab.classList.toggle("is-active", tab.dataset.view === name));
  document.querySelectorAll(".view").forEach((view) => view.classList.toggle("is-active", view.id === `view-${name}`));
  if (name === "results" && !state.teams && state.students.length >= 2) runSort(false);
  document.querySelector(".workspace").scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderRoster() {
  const query = els.studentSearch.value.trim().toLowerCase();
  const visible = state.students.filter((student) => `${student.name} ${student.pronouns}`.toLowerCase().includes(query));
  els.studentCount.textContent = `${state.students.length} student${state.students.length === 1 ? "" : "s"}`;
  els.datasetLabel.textContent = state.datasetLabel;
  els.readinessText.textContent = state.students.length >= 2 ? "Ready to score" : "Add at least 2 students";
  els.readinessDot.style.background = state.students.length >= 2 ? "#64a156" : "#d09a35";
  els.rosterBody.innerHTML = visible.length ? visible.map((student) => rosterRow(student)).join("") : `<tr><td colspan="5" class="empty-row">${state.students.length ? "No students match that search." : "Your roster is empty. Import a CSV or add a student."}</td></tr>`;
}

function rosterRow(student) {
  const score = scoreStudent(student);
  const evidence = strongestEvidence(student).slice(0, 3);
  const answered = Object.values(student.skills || {}).filter(Number).length + (student.areas?.length ? 1 : 0);
  const totalResponses = TOOL_DEFINITIONS.length + 1;
  const responsePct = Math.round((answered / totalResponses) * 100);
  return `<tr>
    <td><div class="student-id"><span class="student-avatar">${initials(student.name)}</span><div><strong>${escapeHtml(student.name)}</strong><small>${escapeHtml(student.pronouns || "Pronouns not provided")}</small></div></div></td>
    <td><span class="signal-badge ${score.band}">${score.band === "hardware" ? "←" : score.band === "software" ? "→" : "↔"} ${capitalize(score.band)}</span></td>
    <td><div class="evidence-tags">${evidence.length ? evidence.map((item) => `<span>${escapeHtml(item.label)} · ${item.value}/3</span>`).join("") : "<span>No skill evidence</span>"}</div></td>
    <td><span class="response-meter"><i style="--fill:${responsePct}%"></i>${answered}/${totalResponses}</span></td>
    <td><div class="row-menu"><button data-action="edit" data-id="${student.id}" aria-label="Edit ${escapeHtml(student.name)}">✎</button><button data-action="delete" data-id="${student.id}" aria-label="Delete ${escapeHtml(student.name)}">×</button></div></td>
  </tr>`;
}

function renderPreview() {
  const scored = state.students.map((student) => ({ student, ...scoreStudent(student) }));
  const layout = buildPreviewLayout(scored);
  els.previewDots.innerHTML = layout.map(({ item, top, offset }) => {
    return `<span class="preview-dot" style="--top:${top}px;--offset:${offset}px;--dot:${bandColor(item.band)}" title="${escapeHtml(item.student.name)} · ${formatPosition(item.position)}">${initials(item.student.name)}</span>`;
  }).join("");
  const mean = average(scored.map((item) => item.position));
  const confidence = average(scored.map((item) => item.confidence));
  els.classCenter.textContent = scored.length ? formatPosition(mean) : "—";
  els.classConfidence.textContent = scored.length ? `${Math.round(confidence)}%` : "—";
}

function getScoringStatus() {
  const balanced = state.sortMode === "balanced";
  return {
    title: "Student responses alone determine evidence strength",
    description: balanced
      ? "Each reported evidence point counts equally. Questions supply only Hardware, Bridge, or Software direction; no tool, area, activity, or manual response has a strength multiplier. The Hat then balances position, confidence, experience, and cohort size."
      : "Each reported evidence point counts equally. Questions supply only Hardware, Bridge, or Software direction; no tool, area, activity, or manual response has a strength multiplier before the ranked 50/50 split.",
    details: [`${SIGNAL_DEFINITIONS.length} categorical mappings`, "Equal-strength evidence points", balanced ? "Position + confidence balance" : "Ranked median split"]
  };
}

function renderScoringStatus() {
  const status = getScoringStatus();
  const signature = JSON.stringify(status);
  if (els.scoringStatus.dataset.signature === signature) return;
  els.scoringStatus.dataset.signature = signature;
  els.scoringStatus.innerHTML = `<span class="scoring-status-icon" aria-hidden="true">✓</span><div class="scoring-status-copy"><p>What drives this sort</p><h3>${escapeHtml(status.title)}</h3><p>${escapeHtml(status.description)}</p></div><div class="scoring-status-details">${status.details.map((detail) => `<span>${escapeHtml(detail)}</span>`).join("")}</div>`;
}

function renderWorkedExample() {
  const previousId = els.workedExampleStudent.value;
  const selectedStudent = state.students.find((student) => student.id === previousId) || state.students[0];
  els.workedExampleStudent.disabled = !selectedStudent;
  els.workedExampleStudent.innerHTML = selectedStudent
    ? state.students.map((student) => `<option value="${escapeHtml(student.id)}" ${student.id === selectedStudent.id ? "selected" : ""}>${escapeHtml(student.name)}</option>`).join("")
    : '<option value="">No students loaded</option>';
  els.workedExampleBody.innerHTML = renderWorkedExampleModel(buildWorkedExampleModel(selectedStudent));
}

function buildWorkedExampleModel(student) {
  if (!student) return { empty: true, message: "Import a roster or add a student to see a worked placement example." };
  const breakdown = calculateScoreBreakdown(student);
  return {
    empty: false,
    studentName: student.name,
    ...breakdown,
    noDirectionalEvidence: breakdown.directionalEvidence === 0,
    confidenceUnavailable: breakdown.possibleEvidence === 0
  };
}

function renderWorkedExampleModel(model) {
  if (model.empty) return `<p class="worked-example-empty">${escapeHtml(model.message)}</p>`;
  const noContributionMessage = "This student has no evidence points to show. Blank and unfamiliar tool responses contribute 0 evidence; unselected professional areas contribute none.";
  const rows = model.contributions.length ? model.contributions.map((item) => `<tr>
    <th scope="row"><strong>${escapeHtml(item.label)}</strong><small>${escapeHtml(item.context)}</small></th>
    <td><code>${escapeHtml(item.signedFormula)}</code></td>
    <td>${formatNumber(item.signed)}</td>
    <td>${formatNumber(item.directional)}</td>
  </tr>`).join("") : `<tr><td colspan="4" class="worked-example-empty">${escapeHtml(noContributionMessage)}</td></tr>`;
  const confidenceText = model.confidenceUnavailable
    ? "N/A — no questionnaire evidence is available for this student"
    : `${formatNumber(model.allEvidence)} ÷ ${formatNumber(model.possibleEvidence)} × 100 = ${Math.round(model.confidence)}%`;
  const positionMath = model.noDirectionalEvidence
    ? "No directional denominator → normalized 0 → 50 + (0 × 50) = 50"
    : `${formatNumber(model.signed)} ÷ ${formatNumber(model.directionalEvidence)} ≈ ${formatNumber(model.normalized, 3)} → 50 + (${formatNumber(model.normalized, 3)} × 50) ≈ ${formatNumber(model.position)}`;
  return `<div class="worked-example-name"><span>${escapeHtml(model.studentName)}</span><strong>${formatNumber(model.position)} / 100 · ${capitalize(model.band)}</strong></div>
    <div class="worked-example-axis" style="--position:${model.position}%" role="img" aria-label="${escapeHtml(model.studentName)} is at ${formatNumber(model.position)} out of 100, in the ${escapeHtml(model.band)} band"><div><span>0 · Hardware</span><span>50 · Bridge</span><span>Software · 100</span></div><i><b></b></i></div>
    <div class="worked-example-table-wrap"><table><thead><tr><th>Evidence contribution</th><th>Signed calculation</th><th>Numerator</th><th>Directional denominator</th></tr></thead><tbody>${rows}</tbody></table></div>
    <div class="worked-example-result">
      <div><small>Position arithmetic</small><code>${escapeHtml(positionMath)}</code></div>
      <div><small>Final placement</small><strong>${formatNumber(model.position)} / 100 · ${capitalize(model.band)}</strong><span>${escapeHtml(formatPosition(model.position))}</span></div>
      <div><small>Response confidence</small><code>${escapeHtml(confidenceText)}</code>${model.confidenceUnavailable ? "" : "<span>Possible evidence includes every tool at 3 points—even when blank or unfamiliar—and one point for each selected area.</span>"}</div>
    </div>`;
}

function buildPreviewLayout(scored) {
  const lanes = [0, -38, 38, -76, 76, -114, 114, -152, 152];
  const placed = [];
  return [...scored]
    .sort((a, b) => b.position - a.position || a.student.name.localeCompare(b.student.name))
    .map((item) => {
      const top = 430 - item.position * 3.75;
      let offset = lanes.find((lane) => placed.every((point) => Math.abs(point.top - top) >= 31 || Math.abs(point.offset - lane) >= 31));
      if (offset === undefined) {
        offset = lanes.reduce((best, lane) => {
          const clearance = Math.min(...placed.map((point) => Math.hypot(point.top - top, point.offset - lane)));
          return clearance > best.clearance ? { lane, clearance } : best;
        }, { lane: 0, clearance: -1 }).lane;
      }
      const point = { item, top, offset };
      placed.push(point);
      return point;
    });
}

function renderResults() {
  const splitMode = state.sortMode === "split";
  els.resultsTitle.textContent = splitMode ? "One spectrum, two cohorts" : "The Hat balances the room";
  els.teamAName.textContent = COHORT_NAMES.A;
  els.teamBName.textContent = COHORT_NAMES.B;
  els.balanceKicker.textContent = splitMode ? "COHORT SPLIT" : "BALANCE SCORE";
  els.balanceDenominator.textContent = splitMode ? "students" : "/ 100";
  els.balanceScoreBadge.classList.toggle("is-split", splitMode);
  els.dragHint.textContent = splitMode ? "Drag to change the median split. Cohort counts and centers update instantly." : "Drag a student between cohorts to challenge the algorithm. The balance score updates instantly.";
  if (!state.teams) {
    els.balanceScore.textContent = "—";
    els.balanceTitle.textContent = splitMode ? "Waiting for a median split" : "Waiting for a sort";
    els.balanceDescription.textContent = splitMode ? "Students will be ranked by skill-signal position and divided into two nearly equal cohorts." : "We compare size, hardware, software, and total experience across the two cohorts.";
    els.resultsSummary.textContent = splitMode ? "Run the sort to create a relative skill-spectrum split." : "Run the sort to build two balanced cohorts.";
    els.balanceMetrics.innerHTML = emptyMetrics(splitMode);
    renderTeam("A", []);
    renderTeam("B", []);
    renderSortMap([], []);
    renderDecisionLog();
    return;
  }
  const teamA = state.teams.A.map(findStudent).filter(Boolean);
  const teamB = state.teams.B.map(findStudent).filter(Boolean);
  renderSortMap(teamA, teamB);
  const balance = calculateBalance(teamA, teamB);
  if (splitMode) {
    const aPositions = teamA.map((student) => scoreStudent(student).position);
    const bPositions = teamB.map((student) => scoreStudent(student).position);
    const aCenter = average(aPositions, 50);
    const bCenter = average(bPositions, 50);
    const rankedPositions = [...aPositions, ...bPositions].sort((a, b) => a - b);
    const lowerCohortSize = Math.ceil(rankedPositions.length / 2);
    const cutPoint = rankedPositions[lowerCohortSize] == null ? rankedPositions[0] : (rankedPositions[lowerCohortSize - 1] + rankedPositions[lowerCohortSize]) / 2;
    els.balanceScore.textContent = `${teamA.length}/${teamB.length}`;
    els.balanceTitle.textContent = "A median split of the class";
    els.balanceDescription.textContent = `${COHORT_NAMES.A} contains the lower-position half and ${COHORT_NAMES.B} the higher-position half. Both cohorts still complete both course modules.`;
    els.resultsSummary.textContent = `${teamA.length + teamB.length} students divided into two approximately equal cohorts by relative skill signals.`;
    els.balanceMetrics.innerHTML = `<div><small>Size gap</small><strong>${Math.abs(teamA.length - teamB.length)}</strong></div><div><small>Cohort cut</small><strong>${cutPoint.toFixed(1)}</strong></div><div><small>Center gap</small><strong>${Math.abs(bCenter - aCenter).toFixed(1)}</strong></div>`;
    renderTeam("A", teamA);
    renderTeam("B", teamB);
    renderDecisionLog();
    return;
  }
  els.balanceScore.textContent = balance.score;
  els.balanceTitle.textContent = balance.score >= 90 ? "An unusually tidy cohort split" : balance.score >= 78 ? "A strong, teachable balance" : balance.score >= 60 ? "Balanced—with useful tension" : "Deliberately varied cohorts";
  els.balanceDescription.textContent = `The two cohorts differ by ${balance.orientationGap.toFixed(1)} points on the hardware–software skill axis.`;
  els.resultsSummary.textContent = `${teamA.length + teamB.length} students assigned with ${balance.score}% overall cohort balance.`;
  els.balanceMetrics.innerHTML = `<div><small>Size gap</small><strong>${Math.abs(teamA.length - teamB.length)}</strong></div><div><small>Skill gap</small><strong>${balance.orientationGap.toFixed(1)}</strong></div><div><small>Experience gap</small><strong>${balance.experienceGap.toFixed(1)}</strong></div>`;
  renderTeam("A", teamA);
  renderTeam("B", teamB);
  renderDecisionLog();
}

function renderSortMap(cohortA, cohortB) {
  const items = [
    ...cohortA.map((student) => ({ student, cohort: "A", score: scoreStudent(student) })),
    ...cohortB.map((student) => ({ student, cohort: "B", score: scoreStudent(student) }))
  ];

  if (!items.length) {
    els.sortMapTitle.textContent = "How the cohorts sit on the spectrum";
    els.sortMapSummary.textContent = "Run the sort to see every student and the class median.";
    els.sortMapMedian.style.setProperty("--median", "50%");
    els.sortMapMedianLabel.textContent = "Median";
    els.sortMapCut.hidden = true;
    els.sortMapStudents.innerHTML = "";
    els.sortMapChart.style.setProperty("--chart-height", "250px");
    els.sortMapNote.textContent = "Each name is positioned by equal-strength student evidence points and categorical directions.";
    return;
  }

  const scores = items.map((item) => item.score.position).sort((a, b) => a - b);
  const midpoint = Math.floor(scores.length / 2);
  const median = scores.length % 2 ? scores[midpoint] : (scores[midpoint - 1] + scores[midpoint]) / 2;
  const lowerCohortSize = Math.ceil(scores.length / 2);
  const cohortCut = scores[lowerCohortSize] == null ? median : (scores[lowerCohortSize - 1] + scores[lowerCohortSize]) / 2;
  const measuredWidth = els.sortMapPlot.clientWidth;
  const plotWidth = measuredWidth || Math.max(960, Math.min(1500, window.innerWidth - 190));
  const layout = buildSortMapLayout(items, plotWidth);
  const laneCount = Math.max(...layout.map((point) => point.lane)) + 1;

  els.sortMapMedian.style.setProperty("--median", `${median}%`);
  els.sortMapMedianLabel.textContent = `Median ${median.toFixed(1)}`;
  const separateCut = state.sortMode === "split" && Math.abs(cohortCut - median) >= 0.05;
  els.sortMapCut.hidden = !separateCut;
  els.sortMapCut.style.setProperty("--cut", `${cohortCut}%`);
  els.sortMapCutLabel.textContent = `Cohort cut ${cohortCut.toFixed(1)}`;
  els.sortMapChart.style.setProperty("--chart-height", `${Math.max(250, laneCount * 35 + 93)}px`);
  els.sortMapStudents.innerHTML = layout.map(({ item, top, anchor }) => {
    const position = item.score.position;
    const cohortName = COHORT_NAMES[item.cohort];
    const label = `${item.student.name}: ${position.toFixed(1)} on the skill-signal spectrum; ${cohortName}`;
    return `<span class="sort-map-student cohort-${item.cohort.toLowerCase()}" style="--x:${position}%;--y:${top}px;--anchor:${anchor}" title="${escapeHtml(label)}" aria-label="${escapeHtml(label)}"><span>${escapeHtml(item.student.name)}</span><b>${position.toFixed(1)}</b></span>`;
  }).join("");

  if (state.sortMode === "split") {
    els.sortMapTitle.textContent = "Where the cohort split happens";
    els.sortMapSummary.textContent = separateCut
      ? `The class median is ${median.toFixed(1)}; the cohort cut at ${cohortCut.toFixed(1)} falls between the two ranked groups.`
      : `The class median and cohort cut meet at ${median.toFixed(1)}. Manual moves remain visible across the line.`;
    els.sortMapNote.textContent = `Names are positioned by their data-derived questionnaire score. The ranked cut creates approximately equal cohorts—even when the class has more signals on one side.`;
  } else {
    els.sortMapTitle.textContent = "How the cohorts overlap";
    els.sortMapSummary.textContent = `The class median is ${median.toFixed(1)}. A balanced result mixes both cohort colors across the skill-signal spectrum.`;
    els.sortMapNote.textContent = "Names are positioned by their data-derived questionnaire score. Color shows cohort assignment, not a student's discipline or course path.";
  }
}

function buildSortMapLayout(items, plotWidth) {
  const lanes = [];
  return [...items]
    .sort((a, b) => a.score.position - b.score.position || a.student.name.localeCompare(b.student.name))
    .map((item) => {
      const position = clamp(item.score.position, 0, 100);
      const chipWidth = clamp(59 + item.student.name.length * 5.7, 82, 190);
      const rawX = (position / 100) * plotWidth;
      const anchor = position < 6 ? "translateX(0)" : position > 94 ? "translateX(-100%)" : "translateX(-50%)";
      const centerX = position < 6 ? rawX + chipWidth / 2 : position > 94 ? rawX - chipWidth / 2 : rawX;
      let lane = lanes.findIndex((placed) => placed.every((chip) => Math.abs(chip.centerX - centerX) >= (chip.width + chipWidth) / 2 + 10));
      if (lane === -1) {
        lane = lanes.length;
        lanes.push([]);
      }
      lanes[lane].push({ centerX, width: chipWidth });
      return { item, lane, top: lane * 35 + 8, anchor };
    });
}

function renderTeam(name, students) {
  const list = name === "A" ? els.teamAList : els.teamBList;
  const count = name === "A" ? els.teamACount : els.teamBCount;
  const range = name === "A" ? els.teamARange : els.teamBRange;
  const footer = name === "A" ? els.teamAFooter : els.teamBFooter;
  const scores = students.map(scoreStudent);
  count.textContent = students.length;
  list.innerHTML = students.map((student, index) => {
    const score = scoreStudent(student);
    const evidence = strongestEvidence(student)[0];
    return `<div class="team-student" draggable="true" data-id="${student.id}" style="--avatar-bg:${index % 2 ? "#eee4cf" : "#e2ead0"}">
      <span class="student-avatar">${initials(student.name)}</span>
      <div><strong>${escapeHtml(student.name)}</strong><small>${evidence ? `Strong in ${escapeHtml(evidence.label)}` : "No strong signal yet"}</small></div>
      <span class="mini-position" style="--tone:${bandColor(score.band)};--pos:${Math.max(7, score.position)}%"><b>${formatPosition(score.position)}</b><i></i></span>
    </div>`;
  }).join("");
  const avg = average(scores.map((score) => score.position));
  range.innerHTML = students.length ? `<i style="--tone:${axisColor((avg - 50) / 16.67)}"></i> COHORT CENTER · <strong>${formatPosition(avg)}</strong>` : "No students assigned";
  const hardware = scores.filter((score) => score.band === "hardware").length;
  const software = scores.filter((score) => score.band === "software").length;
  const bridge = scores.length - hardware - software;
  footer.textContent = students.length ? `${hardware} hardware · ${bridge} bridge · ${software} software` : "Drop students here";
  list.querySelectorAll(".team-student").forEach((row) => row.addEventListener("dragstart", (event) => event.dataTransfer.setData("text/plain", row.dataset.id)));
}

function renderDecisionLog() {
  const fallback = [
    "<strong>Translate:</strong> familiarity answers become 0–3 evidence points.",
    "<strong>Position:</strong> each evidence point counts equally in its categorical Hardware, Bridge, or Software direction.",
    "<strong>Balance:</strong> the hat searches for equal-size cohorts with similar hardware, software, and experience totals."
  ];
  els.decisionLog.innerHTML = (state.decisionLog.length ? state.decisionLog : fallback).map((entry) => `<li>${entry}</li>`).join("");
}

function renderSortMode() {
  document.querySelectorAll('input[name="sortMode"]').forEach((input) => { input.checked = input.value === state.sortMode; });
  els.sortButtonLabel.textContent = state.sortMode === "split" ? "Create 50/50 cohorts" : "Build balanced cohorts";
}

function handleSortModeChange(event) {
  state.sortMode = event.target.value === "split" ? "split" : "balanced";
  state.teams = null;
  state.decisionLog = [];
  renderSortMode();
  renderScoringStatus();
  renderResults();
  saveState();
}

function calculateScoreBreakdown(student, includeContributions = true) {
  let signed = 0;
  let directionalEvidence = 0;
  let allEvidence = 0;
  let possibleEvidence = 0;
  let hardware = 0;
  let software = 0;
  const contributions = includeContributions ? [] : null;
  TOOL_DEFINITIONS.forEach((tool) => {
    const response = clamp(Number(student.skills?.[tool.key]) || 0, 0, 4);
    const evidence = response ? response - 1 : 0;
    const signedContribution = evidence * tool.axis;
    const directionalContribution = evidence * Math.abs(tool.axis);
    signed += signedContribution;
    directionalEvidence += directionalContribution;
    allEvidence += evidence;
    possibleEvidence += 3;
    if (tool.axis < 0) hardware += evidence * Math.abs(tool.axis);
    if (tool.axis > 0) software += evidence * tool.axis;
    if (includeContributions && evidence) contributions.push({ label: tool.label, context: `Tool response ${response} → evidence ${evidence}; ${directionLabel(tool.axis)}`, signedFormula: `${formatNumber(evidence)} × ${formatNumber(tool.axis)}`, signed: signedContribution, directional: directionalContribution });
  });
  AREA_DEFINITIONS.forEach((area) => {
    if (!student.areas?.includes(area.key)) return;
    const evidence = 1;
    const signedContribution = evidence * area.axis;
    const directionalContribution = evidence * Math.abs(area.axis);
    signed += signedContribution;
    directionalEvidence += directionalContribution;
    allEvidence += evidence;
    possibleEvidence += 1;
    if (area.axis < 0) hardware += evidence * Math.abs(area.axis);
    if (area.axis > 0) software += evidence * area.axis;
    if (includeContributions) contributions.push({ label: area.label, context: `Selected area → one evidence point; ${directionLabel(area.axis)}`, signedFormula: `1 × ${formatNumber(area.axis)}`, signed: signedContribution, directional: directionalContribution });
  });
  ACTIVITY_SIGNALS.forEach((signal) => {
    const evidence = clamp(Number(student.activities?.[signal.key]) || 0, 0, 3);
    const signedContribution = evidence * signal.axis;
    const directionalContribution = evidence * Math.abs(signal.axis);
    signed += signedContribution;
    directionalEvidence += directionalContribution;
    if (signal.axis < 0) hardware += evidence;
    else software += evidence;
    if (includeContributions && evidence) contributions.push({ label: activityLabel(signal.key), context: `Recent activity level ${evidence}; ${directionLabel(signal.axis)}`, signedFormula: `${formatNumber(evidence)} × ${formatNumber(signal.axis)}`, signed: signedContribution, directional: directionalContribution });
  });
  if (student.directPosition != null) {
    const direct = clamp(Number(student.directPosition), 1, 5);
    const signedContribution = direct - 3;
    const directionalContribution = Math.abs(signedContribution);
    signed += signedContribution;
    directionalEvidence += directionalContribution;
    if (includeContributions) contributions.push({ label: "Manual direct position", context: `Choice ${direct} of 5; raw distance from center 3`, signedFormula: `${formatNumber(direct)} − 3`, signed: signedContribution, directional: directionalContribution });
  }
  const normalized = directionalEvidence ? signed / directionalEvidence : 0;
  const position = clamp(50 + normalized * 50, 0, 100);
  const confidence = possibleEvidence ? clamp((allEvidence / possibleEvidence) * 100, 0, 100) : 0;
  const band = position < 42 ? "hardware" : position > 58 ? "software" : "bridge";
  const score = { position, confidence, band, hardware, software, experience: Number(student.experience) || 0 };
  return includeContributions ? { ...score, contributions, signed, directionalEvidence, normalized, allEvidence, possibleEvidence } : score;
}

function scoreStudent(student) {
  return calculateScoreBreakdown(student, false);
}

function strongestEvidence(student) {
  const toolEvidence = TOOL_DEFINITIONS.map((tool) => ({
    label: tool.label.replace(/ \(.+\)/, ""),
    value: Math.max(0, (Number(student.skills?.[tool.key]) || 0) - 1),
  }));
  const areaEvidence = AREA_DEFINITIONS.filter((area) => student.areas?.includes(area.key)).map((area) => ({
    label: area.label,
    value: 1,
  }));
  return [...toolEvidence, ...areaEvidence]
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
}

function runSort(navigate = true) {
  if (state.students.length < 2) {
    showToast("Add at least two students before sorting.");
    showView("roster");
    return;
  }
  const scored = state.students.map((student) => ({ student, score: scoreStudent(student) }));
  let A = [];
  let B = [];
  let passes = 0;
  let swaps = 0;
  if (state.sortMode === "split") {
    const ranked = [...scored].sort((a, b) => a.score.position - b.score.position || b.score.confidence - a.score.confidence || a.student.name.localeCompare(b.student.name));
    const hardwareHalfSize = Math.ceil(ranked.length / 2);
    A = ranked.slice(0, hardwareHalfSize).map((entry) => entry.student);
    B = ranked.slice(hardwareHalfSize).map((entry) => entry.student);
  } else {
    const sorted = [...scored].sort((a, b) => Math.abs(b.score.position - 50) - Math.abs(a.score.position - 50) || b.score.confidence - a.score.confidence || a.student.name.localeCompare(b.student.name));
    sorted.forEach((entry) => {
      const canA = A.length < Math.ceil(sorted.length / 2);
      const canB = B.length < Math.floor(sorted.length / 2);
      if (!canA) B.push(entry.student);
      else if (!canB) A.push(entry.student);
      else {
        const costA = calculateBalance([...A, entry.student], B).loss;
        const costB = calculateBalance(A, [...B, entry.student]).loss;
        (costA <= costB ? A : B).push(entry.student);
      }
    });

    let improved = true;
    while (improved && passes < 20) {
      improved = false;
      passes += 1;
      let currentLoss = calculateBalance(A, B).loss;
      outer: for (let i = 0; i < A.length; i += 1) {
        for (let j = 0; j < B.length; j += 1) {
          const nextA = [...A];
          const nextB = [...B];
          [nextA[i], nextB[j]] = [nextB[j], nextA[i]];
          const nextLoss = calculateBalance(nextA, nextB).loss;
          if (nextLoss + 0.0001 < currentLoss) {
            A = nextA;
            B = nextB;
            swaps += 1;
            improved = true;
            break outer;
          }
        }
      }
    }
  }
  state.teams = { A: A.map((student) => student.id), B: B.map((student) => student.id) };
  const finalBalance = calculateBalance(A, B);
  const hardwareSignals = SIGNAL_DEFINITIONS.filter((signal) => signal.axis < 0).length;
  const softwareSignals = SIGNAL_DEFINITIONS.filter((signal) => signal.axis > 0).length;
  if (state.sortMode === "split") {
    const aPositions = A.map((student) => scoreStudent(student).position);
    const bPositions = B.map((student) => scoreStudent(student).position);
    const cutPoint = (Math.max(...aPositions) + Math.min(...bPositions)) / 2;
    state.decisionLog = [
      `<strong>Translated ${state.students.length} responses.</strong> Each student received one continuous Hardware ⇄ Software position.`,
      `<strong>Ranked the whole room.</strong> Students were ordered from the lowest to highest data-derived position; fixed Hardware, Bridge, and Software labels did not control the order.`,
      `<strong>Cut between the ranked groups at ${cutPoint.toFixed(1)}.</strong> The lower ${A.length} positions became ${COHORT_NAMES.A} and the upper ${B.length} became ${COHORT_NAMES.B}.`,
      `<strong>Guaranteed an approximate 50/50 split.</strong> This median method stays ${A.length}/${B.length} even when far more students cross the absolute Software signal threshold.`,
      `<strong>Kept course pathways separate from skill labels.</strong> Cohort names do not prescribe a discipline; both cohorts complete Physical Computing and Computational Design.`
    ];
  } else {
    state.decisionLog = [
      `<strong>Translated ${state.students.length} responses.</strong> Blank answers contributed no evidence; familiarity levels contributed 0–3 points.`,
      `<strong>Counted evidence without strength weights.</strong> Every evidence point counted equally; ${hardwareSignals} questionnaire mappings point toward Hardware and ${softwareSignals} point toward Software.`,
      `<strong>Seeded the cohorts.</strong> Students furthest from the class midpoint were placed first so rare strengths were distributed early.`,
      `<strong>Tested local swaps.</strong> The hat made ${swaps} improving swap${swaps === 1 ? "" : "s"} across ${passes} pass${passes === 1 ? "" : "es"}, minimizing hardware, software, experience, and size gaps.`,
      `<strong>Stopped at ${finalBalance.score}/100.</strong> A higher score means the two cohorts have more similar skill totals—not that either cohort is “better.”`
    ];
  }
  saveState();
  renderResults();
  if (navigate) showView("results");
  showToast("The two cohorts are ready.");
}

function calculateBalance(teamA, teamB) {
  const metric = (team) => {
    const scores = team.map(scoreStudent);
    return {
      orientation: average(scores.map((score) => score.position), 50),
      hardware: average(scores.map((score) => score.hardware), 0),
      software: average(scores.map((score) => score.software), 0),
      confidence: average(scores.map((score) => score.confidence), 0),
      experience: average(scores.map((score) => score.experience), 0)
    };
  };
  const a = metric(teamA);
  const b = metric(teamB);
  const sizeGap = Math.abs(teamA.length - teamB.length);
  const orientationGap = Math.abs(a.orientation - b.orientation);
  const hardwareGap = normalizedDifference(a.hardware, b.hardware);
  const softwareGap = normalizedDifference(a.software, b.software);
  const confidenceGap = Math.abs(a.confidence - b.confidence);
  const experienceGap = Math.abs(a.experience - b.experience);
  const unavoidableSizeGap = (teamA.length + teamB.length) % 2;
  const avoidableSizeGap = Math.max(0, sizeGap - unavoidableSizeGap);
  const loss = avoidableSizeGap * 40 + orientationGap * 1.3 + hardwareGap * 20 + softwareGap * 20 + confidenceGap * 0.18 + experienceGap * 5;
  const score = Math.round(clamp(100 - loss * 0.55, 0, 100));
  return { loss, score, sizeGap, orientationGap, hardwareGap, softwareGap, confidenceGap, experienceGap };
}

function normalizedDifference(a, b) {
  const scale = Math.max(a, b, 1);
  return Math.abs(a - b) / scale;
}

function openStudentDialog(student = null) {
  editingId = student?.id || null;
  els.studentDialogTitle.textContent = student ? "Edit student" : "Add a student";
  els.saveStudentButton.textContent = student ? "Save changes" : "Add to roster";
  els.studentForm.reset();
  if (student) {
    els.studentForm.elements.name.value = student.name;
    els.studentForm.elements.pronouns.value = student.pronouns || "";
    els.studentForm.elements.experience.value = student.experience || 0;
    els.studentForm.elements.useDirectPosition.checked = student.directPosition != null;
    els.studentForm.elements.directPosition.value = student.directPosition || 3;
    AREA_DEFINITIONS.forEach((area) => { els.studentForm.elements[`area-${area.key}`].checked = student.areas?.includes(area.key) || false; });
    TOOL_DEFINITIONS.forEach((tool) => { els.studentForm.elements[`skill-${tool.key}`].value = student.skills?.[tool.key] || 0; });
  }
  els.studentDialog.showModal();
}

function buildManualSkills() {
  els.manualAreas.innerHTML = AREA_DEFINITIONS.map((area) => `<label><input name="area-${area.key}" type="checkbox" />${escapeHtml(area.label)}</label>`).join("");
  els.manualSkills.innerHTML = TOOL_DEFINITIONS.map((tool) => `<label>${escapeHtml(tool.label)}<select name="skill-${tool.key}"><option value="0">No answer</option><option value="1">Unfamiliar</option><option value="2">Somewhat</option><option value="3">Moderately</option><option value="4">Very familiar</option></select></label>`).join("");
}

function saveStudent(event) {
  const submitter = event.submitter;
  if (!submitter || submitter.value === "cancel") return;
  event.preventDefault();
  if (!els.studentForm.reportValidity()) return;
  const form = new FormData(els.studentForm);
  const existing = editingId ? findStudent(editingId) : null;
  const student = {
    id: existing?.id || `student-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: String(form.get("name")).trim(),
    pronouns: String(form.get("pronouns") || "").trim(),
    experience: Number(form.get("experience")) || 0,
    areas: AREA_DEFINITIONS.filter((area) => form.get(`area-${area.key}`)).map((area) => area.key),
    skills: Object.fromEntries(TOOL_DEFINITIONS.map((tool) => [tool.key, Number(form.get(`skill-${tool.key}`)) || 0])),
    activities: existing?.activities || {},
    directPosition: form.get("useDirectPosition") ? Number(form.get("directPosition")) : null
  };
  if (existing) state.students = state.students.map((item) => item.id === student.id ? student : item);
  else state.students.push(student);
  state.datasetLabel = state.datasetLabel === COURSE_DATASET_LABEL ? "Local roster" : state.datasetLabel;
  state.teams = null;
  els.studentDialog.close();
  renderAll();
  showToast(existing ? `${student.name} updated.` : `${student.name} added to the roster.`);
}

function handleRosterAction(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const student = findStudent(button.dataset.id);
  if (!student) return;
  if (button.dataset.action === "edit") openStudentDialog(student);
  if (button.dataset.action === "delete") {
    state.students = state.students.filter((item) => item.id !== student.id);
    state.teams = null;
    state.datasetLabel = state.datasetLabel === COURSE_DATASET_LABEL ? "Local roster" : state.datasetLabel;
    renderAll();
    showToast(`${student.name} removed.`);
  }
}

async function importCsv(event) {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) return;
  try {
    const text = await file.text();
    const rows = parseCsv(text);
    if (rows.length < 2) throw new Error("The CSV has no response rows.");
    const headers = rows[0].map((header) => header.trim());
    const students = rows.slice(1).filter((row) => row.some((cell) => cell.trim())).map((row, index) => csvRowToStudent(headers, row, index)).filter((student) => student.name);
    if (!students.length) throw new Error("No preferred-name column was found. Add a column containing ‘preferred name’. ");
    const recognized = students.reduce((sum, student) => sum + Object.values(student.skills).filter(Number).length, 0);
    if (!recognized) throw new Error("Names were found, but no tool-familiarity columns matched the questionnaire.");
    state.students = students;
    state.datasetLabel = file.name.replace(/\.csv$/i, "");
    state.teams = null;
    renderAll();
    showToast(`Imported ${students.length} student${students.length === 1 ? "" : "s"}.`);
  } catch (error) {
    showToast(error.message || "That CSV could not be read.", 5000);
  }
}

function csvRowToStudent(headers, row, index) {
  const entries = headers.map((header, i) => ({ header: normalizeText(header), value: row[i] || "" }));
  const read = (...patterns) => entries.find((entry) => patterns.some((pattern) => entry.header.includes(pattern)))?.value || "";
  const skills = {};
  TOOL_DEFINITIONS.forEach((tool) => {
    const aliases = toolAliases(tool);
    const candidates = entries.filter((entry) => aliases.some((alias) => entry.header.includes(alias)));
    const match = candidates.sort((a, b) => toolHeaderPriority(b.header, tool) - toolHeaderPriority(a.header, tool))[0];
    skills[tool.key] = parseLikert(match?.value);
  });
  const activities = {};
  ACTIVITY_SIGNALS.forEach((signal) => {
    const match = entries.find((entry) => signal.match.some((alias) => entry.header.includes(alias)));
    activities[signal.key] = parseFrequency(match?.value);
  });
  return {
    id: `import-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
    name: read("preferred name", "what name", "student name", "name" ).trim(),
    pronouns: read("preferred pronouns", "pronouns").trim(),
    experience: parseExperience(read("describes your background", "professional experience")),
    areas: parseAreas(read("in which areas do you have most", "professional or academic experience")),
    skills,
    activities,
    directPosition: null
  };
}

function parseAreas(value) {
  const text = normalizeText(value);
  return AREA_DEFINITIONS.filter((area) => text.includes(normalizeText(area.value))).map((area) => area.key);
}

function toolAliases(tool) {
  const aliases = {
    prototyping: ["prototyping"], cad: ["cad [", "cad (", "[cad]"], parametric: ["parametric"],
    database: ["database", "mysql"], machineLearning: ["machine learning"], microcontrollers: ["microcontroller", "arduino"],
    electronics: ["electronics", "sensors and actuators"], webhooks: ["webhook"], api: ["[api]", " api ", "apis"],
    javascript: ["javascript", "p5"], printing3d: ["3d printing"], laserCutting: ["laser cutting"], figma: ["figma"],
    github: ["[github]", "github repo familiarity"], copilot: ["github copilot", "copilot"], vscode: ["visual studio code", "vs code"],
    visualStudio: ["[visual studio]", "visual studio]"], openai: ["openai", "chatgpt"], llm: ["large language model"],
    instruments: ["musical instrument"], projectManagement: ["project management"], nlp: ["natural language processing"]
  };
  return aliases[tool.key] || [normalizeText(tool.label)];
}

function toolHeaderPriority(header, tool) {
  let priority = header.includes("familiar") ? 20 : 0;
  if (header === normalizeText(tool.label) || header === tool.key.toLowerCase()) priority += 15;
  if (header.includes("please indicate how familiar")) priority += 10;
  if (header.includes("made a ") || header.includes("used ") || header.includes("contributed ")) priority -= 15;
  return priority;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { cell += '"'; i += 1; }
      else quoted = !quoted;
    } else if (char === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += char;
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

function parseLikert(value) {
  const text = normalizeText(value);
  if (!text) return 0;
  if (text.includes("very familiar") || text.includes("confident")) return 4;
  if (text.includes("moderately") || text.includes("some experience")) return 3;
  if (text.includes("somewhat") || text.includes("heard of")) return 2;
  if (text.includes("unfamiliar") || text.includes("not heard")) return 1;
  const number = Number(text.match(/\d+(?:\.\d+)?/)?.[0]);
  return Number.isFinite(number) ? clamp(Math.round(number), 0, 4) : 0;
}

function parseFrequency(value) {
  const text = normalizeText(value);
  if (!text || text.includes("never")) return 0;
  if (text.includes("10-12") || text.includes("10–12") || text.includes("12+")) return 3;
  if (text.includes("4-10") || text.includes("4–10")) return 2;
  if (text.includes("1-3") || text.includes("1–3")) return 1;
  return clamp(Number(text.match(/\d+/)?.[0]) || 0, 0, 3);
}

function parseExperience(value) {
  const text = normalizeText(value);
  if (text.includes("more than 3")) return 3;
  if (text.includes("1-3") || text.includes("1–3")) return 2;
  if (text.includes("less than")) return 1;
  return 0;
}

function bindDropZone(zone) {
  zone.addEventListener("dragover", (event) => { event.preventDefault(); zone.classList.add("is-over"); });
  zone.addEventListener("dragleave", () => zone.classList.remove("is-over"));
  zone.addEventListener("drop", (event) => {
    event.preventDefault();
    zone.classList.remove("is-over");
    if (!state.teams) return;
    const id = event.dataTransfer.getData("text/plain");
    const target = zone.dataset.dropTeam;
    const source = state.teams.A.includes(id) ? "A" : "B";
    if (!id || source === target) return;
    state.teams[source] = state.teams[source].filter((studentId) => studentId !== id);
    state.teams[target].push(id);
    state.decisionLog.push(`<strong>Manual move:</strong> ${escapeHtml(findStudent(id)?.name || "A student")} moved from ${COHORT_NAMES[source]} to ${COHORT_NAMES[target]}; the displayed metrics were recalculated.`);
    saveState();
    renderResults();
  });
}

function exportTeams() {
  if (!state.teams) { showToast("Run the sort before exporting."); return; }
  const rows = [["Cohort", "Preferred name", "Pronouns", "Hardware–software position", "Signal", "Confidence"]];
  ["A", "B"].forEach((team) => state.teams[team].forEach((id) => {
    const student = findStudent(id);
    if (!student) return;
    const score = scoreStudent(student);
    const groupLabel = COHORT_NAMES[team];
    rows.push([groupLabel, student.name, student.pronouns || "", Math.round(score.position), score.band, `${Math.round(score.confidence)}%`]);
  }));
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `sortinghat-cohorts-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
  showToast("Cohort CSV exported.");
}

function loadSampleRoster() {
  state.students = structuredClone(SAMPLE_STUDENTS);
  state.datasetLabel = "Sample roster";
  state.teams = null;
  renderAll();
  showToast("Fictional sample roster loaded.");
}

function restartSession() {
  const approved = window.confirm("Start a new session? This clears the local roster and starts with the fixed scoring model.");
  if (!approved) return;
  state = { students: structuredClone(COURSE_STUDENTS), scoringModelVersion: SCORING_MODEL_VERSION, datasetLabel: COURSE_DATASET_LABEL, sortMode: "balanced", teams: null, decisionLog: [] };
  renderAll();
  showView("roster");
  showToast("New session started.");
}

function togglePanel(container, button) {
  const collapsed = container.classList.toggle("is-collapsed");
  button.setAttribute("aria-expanded", String(!collapsed));
  const indicator = button.lastElementChild;
  if (indicator) indicator.textContent = collapsed ? "⌄" : "⌃";
}

function loadState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); }
  catch { return null; }
}

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch { /* Local storage can be disabled; the app still works for this session. */ }
}

function findStudent(id) { return state.students.find((student) => student.id === id); }
function normalizeText(value) { return String(value || "").trim().toLowerCase().replace(/\s+/g, " "); }
function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
function average(values, fallback = 0) { return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : fallback; }
function capitalize(value) { return value.charAt(0).toUpperCase() + value.slice(1); }
function initials(name) { return String(name || "?").split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase(); }
function bandColor(band) { return band === "hardware" ? "#ee713d" : band === "software" ? "#6d5bd0" : "#bed64b"; }
function axisColor(axis) { return axis < -0.5 ? "#ee713d" : axis > 0.5 ? "#6d5bd0" : "#8fa630"; }
function formatNumber(value, decimals = 2) { return Number(value).toFixed(decimals).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1"); }
function directionLabel(direction) { return direction < 0 ? "Hardware direction −1" : direction > 0 ? "Software direction +1" : "Bridge direction 0"; }
function activityLabel(key) { return ({ activityGithub: "Recent GitHub contribution", activityMicro: "Recent microcontroller prototype", activityCad: "Recent CAD drawing", activityWritingAi: "Recent writing-AI use", activityImageAi: "Recent image-AI use" })[key] || key; }
function formatPosition(position) {
  if (position < 45) return `H ${Math.round(50 - position)}`;
  if (position > 55) return `S ${Math.round(position - 50)}`;
  return "Bridge";
}
function emptyMetrics(splitMode = false) { return splitMode ? "<div><small>Size gap</small><strong>—</strong></div><div><small>Cohort cut</small><strong>—</strong></div><div><small>Center gap</small><strong>—</strong></div>" : "<div><small>Size gap</small><strong>—</strong></div><div><small>Skill gap</small><strong>—</strong></div><div><small>Experience gap</small><strong>—</strong></div>"; }
function csvCell(value) { const text = String(value ?? ""); return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text; }
function escapeHtml(value) { return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]); }
function showToast(message, duration = 2600) {
  clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.add("is-visible");
  toastTimer = setTimeout(() => els.toast.classList.remove("is-visible"), duration);
}
