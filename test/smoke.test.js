"use strict";

const fs = require("node:fs");
const path = require("node:path");

const appPath = path.join(__dirname, "..", "app.js");
const indexPath = path.join(__dirname, "..", "index.html");
const source = fs.readFileSync(appPath, "utf8");
const indexSource = fs.readFileSync(indexPath, "utf8");

const cacheList = source.match(/function cacheElements\(\) \{\s*\[([\s\S]*?)\]\.forEach/);
if (!cacheList) throw new Error("Could not find the cached-element list");
const cachedIds = [...cacheList[1].matchAll(/"([^"]+)"/g)].map((match) => match[1]);
cachedIds.forEach((id) => {
  if (!indexSource.includes(`id="${id}"`)) throw new Error(`Cached element #${id} is missing from index.html`);
});
if (/turnOffWeightsButton|resetWeightsButton|weightsList/.test(indexSource)) throw new Error("Removed instructor-weight controls remain in index.html");

const assertions = `
  const assert = (condition, message) => { if (!condition) throw new Error(message); };

  assert(SIGNAL_DEFINITIONS.every((signal) => !Object.hasOwn(signal, "influence")), "Questionnaire mappings should not contain weighting controls");
  assert(SIGNAL_DEFINITIONS.every((signal) => [-1, 0, 1].includes(signal.axis)), "Questionnaire mappings should provide direction only, never strength");
  assert(ACTIVITY_SIGNALS.every((signal) => Math.abs(signal.axis) === 1), "Activity mappings should provide equal-strength direction only");
  assert(!Object.hasOwn(state, "weights"), "New application state should not contain instructor weights");
  assert(state.scoringModelVersion === SCORING_MODEL_VERSION, "New state should identify the equal-evidence scoring model");

  const initialState = state;
  const retainedStudent = sampleStudent("Retained", "", 0, { javascript: 4 });
  state = { students: [retainedStudent], weights: { javascript: { axis: -3, influence: 3 } }, scoringModelVersion: SCORING_MODEL_VERSION, datasetLabel: "Legacy roster", sortMode: "split", teams: { A: [retainedStudent.id], B: [] }, decisionLog: ["old weighted sort"] };
  normalizeState();
  assert(!Object.hasOwn(state, "weights"), "Legacy instructor weights should be removed during state migration");
  assert(state.students.length === 1 && state.sortMode === "split", "Legacy migration should retain roster and strategy");
  assert(state.teams === null && state.decisionLog.length === 0 && state.scoringModelVersion === SCORING_MODEL_VERSION, "Legacy migration should invalidate old results and adopt the equal-evidence model");
  state = { students: [retainedStudent], scoringModelVersion: 1, datasetLabel: "Previous model", sortMode: "balanced", teams: { A: [retainedStudent.id], B: [] }, decisionLog: ["old scoring model"] };
  normalizeState();
  assert(state.students.length === 1 && state.sortMode === "balanced" && state.teams === null && state.decisionLog.length === 0 && state.scoringModelVersion === SCORING_MODEL_VERSION, "A scoring-model version change should retain inputs while invalidating old results");
  state = initialState;

  const workedStudent = sampleStudent("Worked", "", 0, { javascript: 4 });
  workedStudent.areas = ["areaTechnology"];
  workedStudent.activities.activityMicro = 2;
  workedStudent.directPosition = 5;
  const worked = calculateScoreBreakdown(workedStudent);
  assert(worked.signed === 4, "Breakdown numerator should sum raw equal-strength evidence points");
  assert(worked.directionalEvidence === 8, "Breakdown denominator should sum raw directional evidence strength");
  assert(worked.position === 75, "Breakdown should map its normalized score onto the 0–100 line");
  assert(Math.abs(worked.confidence - (4 / 67) * 100) < 0.000001, "Confidence should count one point for a selected area");
  assert(worked.contributions.length === 4 && worked.contributions.every((item) => !item.context.includes("override")), "Worked rows should contain only categorical directions and response evidence");
  assert(!Object.hasOwn(calculateScoreBreakdown(workedStudent, false), "contributions"), "Production scoring should skip worked-example allocations");
  assert(scoreStudent(workedStudent).position === worked.position, "Production scoring and worked arithmetic should share one calculation");

  const workedHtml = renderWorkedExampleModel(buildWorkedExampleModel(workedStudent));
  assert(workedHtml.includes("4 ÷ 8") && workedHtml.includes("Manual direct position") && workedHtml.includes("Software"), "Worked example should expose exact equal-evidence arithmetic and final placement");
  assert(renderWorkedExampleModel(buildWorkedExampleModel(null)).includes("Import a roster"), "Worked example should explain the empty-roster state");
  const blankHtml = renderWorkedExampleModel(buildWorkedExampleModel(sampleStudent("Blank", "", 0, {})));
  assert(blankHtml.includes("Blank and unfamiliar") && blankHtml.includes("every tool at 3 points"), "Worked example should explain zero evidence and the confidence denominator");

  const javascriptOnly = scoreStudent(sampleStudent("JavaScript", "", 0, { javascript: 4 }));
  const cadOnly = scoreStudent(sampleStudent("CAD", "", 0, { cad: 4 }));
  const prototypingOnly = calculateScoreBreakdown(sampleStudent("Prototyping", "", 0, { prototyping: 4 }));
  const microOnly = calculateScoreBreakdown(sampleStudent("Microcontrollers", "", 0, { microcontrollers: 4 }));
  const neutralOnly = scoreStudent(sampleStudent("Neutral", "", 0, { instruments: 4 }));
  assert(javascriptOnly.position === 100 && javascriptOnly.band === "software", "JavaScript evidence should place toward Software");
  assert(cadOnly.position === 0 && cadOnly.band === "hardware", "CAD evidence should place toward Hardware");
  assert(prototypingOnly.signed === microOnly.signed && prototypingOnly.directionalEvidence === microOnly.directionalEvidence, "Different Hardware tools should contribute equal strength for equal responses");
  assert(neutralOnly.position === 50 && neutralOnly.confidence > 0, "A Bridge response should build confidence without moving position");
  const opposed = scoreStudent(sampleStudent("Opposed", "", 0, { javascript: 4, microcontrollers: 4 }));
  assert(opposed.position === 50, "Equal opposing responses should cancel regardless of tool identity");
  const technologyArea = sampleStudent("Technology", "", 0, {});
  technologyArea.areas = ["areaTechnology"];
  assert(scoreStudent(technologyArea).position === 100, "A selected Software area should contribute one Software evidence point");
  const oneToolPoint = calculateScoreBreakdown(sampleStudent("One tool point", "", 0, { javascript: 2 }));
  const oneAreaPoint = calculateScoreBreakdown(technologyArea);
  const oneActivityStudent = sampleStudent("One activity point", "", 0, {});
  oneActivityStudent.activities.activityGithub = 1;
  const oneActivityPoint = calculateScoreBreakdown(oneActivityStudent);
  const oneManualStudent = sampleStudent("One manual point", "", 0, {});
  oneManualStudent.directPosition = 4;
  const oneManualPoint = calculateScoreBreakdown(oneManualStudent);
  [oneToolPoint, oneAreaPoint, oneActivityPoint, oneManualPoint].forEach((breakdown) => {
    assert(breakdown.signed === 1 && breakdown.directionalEvidence === 1, "One Software evidence point should have the same effect across every source");
  });
  const centeredManualStudent = sampleStudent("Centered manual", "", 0, {});
  centeredManualStudent.directPosition = 3;
  const centeredManual = calculateScoreBreakdown(centeredManualStudent);
  assert(centeredManual.signed === 0 && centeredManual.directionalEvidence === 0 && centeredManual.position === 50, "A centered manual response should add no directional strength");
  const crossSourceOpposition = sampleStudent("Cross-source opposition", "", 0, { javascript: 2 });
  crossSourceOpposition.activities.activityMicro = 1;
  const crossSourceScore = calculateScoreBreakdown(crossSourceOpposition);
  assert(crossSourceScore.signed === 0 && crossSourceScore.directionalEvidence === 2 && crossSourceScore.position === 50, "Equal opposing points from different sources should cancel at Bridge");

  const maya = scoreStudent(SAMPLE_STUDENTS.find((student) => student.name === "Maya"));
  const leo = scoreStudent(SAMPLE_STUDENTS.find((student) => student.name === "Leo"));
  assert(maya.band === "hardware" && leo.band === "software", "Categorical mappings should retain recognizable hardware and software signals");
  const tiedEvidence = strongestEvidence(sampleStudent("Tie test", "", 0, { database: 3, api: 3 }));
  assert(tiedEvidence[0].label === "APIs", "Equal evidence should use a stable alphabetical tie-break");

  const balancedStatus = getScoringStatus();
  assert(balancedStatus.title.includes("responses alone") && balancedStatus.details.includes("Equal-strength evidence points") && balancedStatus.details.includes("Position + confidence balance"), "Page 2 should explain the equal-evidence balanced model");
  state.sortMode = "split";
  assert(getScoringStatus().details.includes("Ranked median split"), "Page 2 should explain the selected spectrum strategy");

  renderResults = () => {};
  showView = () => {};
  showToast = () => {};
  saveState = () => {};
  state.students = structuredClone(SAMPLE_STUDENTS);
  state.datasetLabel = "Test roster";
  state.sortMode = "balanced";
  runSort(false);
  assert(state.teams.A.length === 6 && state.teams.B.length === 5, "Balanced mode should split an odd roster 6/5");
  const balance = calculateBalance(state.teams.A.map(findStudent), state.teams.B.map(findStudent));
  assert(balance.score >= 80, "Response-driven balanced mode should create strongly balanced cohorts");
  assert(state.decisionLog.some((entry) => entry.includes("without strength weights")), "Balanced decision trail should disclose the equal-evidence model");

  state.sortMode = "split";
  runSort(false);
  const lowerHalf = state.teams.A.map(findStudent).map(scoreStudent);
  const upperHalf = state.teams.B.map(findStudent).map(scoreStudent);
  assert(state.teams.A.length === 6 && state.teams.B.length === 5, "Spectrum mode should remain approximately 50/50");
  assert(Math.max(...lowerHalf.map((score) => score.position)) <= Math.min(...upperHalf.map((score) => score.position)), "Spectrum mode should divide the ranked fixed-data positions");

  const fixedOne = sampleStudent("Fixed one", "", 0, {});
  const fixedTwo = sampleStudent("Fixed two", "", 0, {});
  fixedOne.activities.activityGithub = 1;
  fixedTwo.activities.activityGithub = 3;
  assert(scoreStudent(fixedOne).position === scoreStudent(fixedTwo).position, "Same-direction fixed activity can produce equal normalized positions");

  const crowdedMap = [
    { student: { name: "Alexandra Longname" }, cohort: "A", score: { position: 50 } },
    { student: { name: "Bo" }, cohort: "B", score: { position: 50 } },
    { student: { name: "Casey" }, cohort: "A", score: { position: 51 } }
  ];
  const mapLayout = buildSortMapLayout(crowdedMap, 1200);
  assert(mapLayout.length === crowdedMap.length && new Set(mapLayout.map((point) => point.lane)).size === 3, "Sort-map layout should retain and separate crowded students");

  const headers = [
    "What is your preferred name?",
    "What are your preferred pronouns?",
    "In which areas do you have most of your professional or academic experience?",
    "Please indicate how familiar are you with the following tools [Microcontrollers [Arduino, etc]]",
    "Please indicate how familiar are you with the following tools [Javascript [P5, etc]]",
    "Contributed to a public or private github repo"
  ];
  const imported = csvRowToStudent(headers, ["Avery", "they/them", "Technology and Software Development, Design (Graphic, UX/UI, Industrial)", "Very Familiar", "Somewhat Familiar", "(4-10 times)"], 0);
  assert(imported.name === "Avery", "CSV importer should recognize preferred name");
  assert(imported.skills.microcontrollers === 4 && imported.skills.javascript === 2, "CSV importer should recognize fixed tool evidence");
  assert(imported.activities.activityGithub === 2, "CSV importer should recognize recent activity frequency");
  assert(imported.areas.includes("areaTechnology") && imported.areas.includes("areaDesign"), "CSV importer should preserve professional areas");

  console.log("Sortinghat smoke tests passed", JSON.stringify({ students: state.students.length, teamSizes: [state.teams.A.length, state.teams.B.length], balance: balance.score, csvFields: 5 }));
`;

const documentStub = { addEventListener() {} };
const localStorageStub = { getItem() { return null; }, setItem() {} };

const execute = new Function("document", "localStorage", "structuredClone", source + assertions);
execute(documentStub, localStorageStub, structuredClone);
