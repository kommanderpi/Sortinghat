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
  assert(!Object.hasOwn(state, "weights"), "New application state should not contain instructor weights");

  const initialState = state;
  const retainedStudent = sampleStudent("Retained", "", 0, { javascript: 4 });
  state = { students: [retainedStudent], weights: { javascript: { axis: -3, influence: 3 } }, datasetLabel: "Legacy roster", sortMode: "split", teams: { A: [retainedStudent.id], B: [] }, decisionLog: ["old weighted sort"] };
  normalizeState();
  assert(!Object.hasOwn(state, "weights"), "Legacy instructor weights should be removed during state migration");
  assert(state.students.length === 1 && state.sortMode === "split", "Legacy migration should retain roster and strategy");
  assert(state.teams === null && state.decisionLog.length === 0, "Legacy migration should invalidate teams and explanations created by the old weighted model");
  state = initialState;

  const workedStudent = sampleStudent("Worked", "", 0, { javascript: 4 });
  workedStudent.areas = ["areaTechnology"];
  workedStudent.activities.activityMicro = 2;
  workedStudent.directPosition = 5;
  const worked = calculateScoreBreakdown(workedStudent);
  assert(Math.abs(worked.signed - 23.1) < 0.000001, "Breakdown numerator should include equal-1× questionnaire, fixed activity, and manual contributions");
  assert(Math.abs(worked.directionalEvidence - 30.9) < 0.000001, "Breakdown denominator should use fixed axes plus the manual denominator");
  assert(Math.abs(worked.position - (50 + (23.1 / 30.9) * 50)) < 0.000001, "Breakdown should map its normalized score onto the 0–100 line");
  assert(Math.abs(worked.confidence - (5 / 68) * 100) < 0.000001, "Confidence should treat every questionnaire row equally at 1×");
  assert(worked.contributions.length === 4 && worked.contributions.every((item) => !item.context.includes("override")), "Worked rows should contain only fixed mappings and fixed signals");
  assert(!Object.hasOwn(calculateScoreBreakdown(workedStudent, false), "contributions"), "Production scoring should skip worked-example allocations");
  assert(scoreStudent(workedStudent).position === worked.position, "Production scoring and worked arithmetic should share one calculation");

  const workedHtml = renderWorkedExampleModel(buildWorkedExampleModel(workedStudent));
  assert(workedHtml.includes("23.1 ÷ 30.9") && workedHtml.includes("Manual direct position") && workedHtml.includes("Software"), "Worked example should expose exact arithmetic and final placement");
  assert(renderWorkedExampleModel(buildWorkedExampleModel(null)).includes("Import a roster"), "Worked example should explain the empty-roster state");
  const blankHtml = renderWorkedExampleModel(buildWorkedExampleModel(sampleStudent("Blank", "", 0, {})));
  assert(blankHtml.includes("Blank and unfamiliar") && blankHtml.includes("every tool at 3 points"), "Worked example should explain zero evidence and the confidence denominator");

  const javascriptOnly = scoreStudent(sampleStudent("JavaScript", "", 0, { javascript: 4 }));
  const cadOnly = scoreStudent(sampleStudent("CAD", "", 0, { cad: 4 }));
  const neutralOnly = scoreStudent(sampleStudent("Neutral", "", 0, { instruments: 4 }));
  assert(javascriptOnly.position === 100 && javascriptOnly.band === "software", "Fixed JavaScript evidence should place toward Software");
  assert(cadOnly.position === 0 && cadOnly.band === "hardware", "Fixed CAD evidence should place toward Hardware");
  assert(neutralOnly.position === 50 && neutralOnly.confidence > 0, "A fixed neutral-axis response should build confidence without moving position");
  const technologyArea = sampleStudent("Technology", "", 0, {});
  technologyArea.areas = ["areaTechnology"];
  assert(scoreStudent(technologyArea).position === 100, "Selected professional-area evidence should use its fixed built-in axis at 1×");

  const maya = scoreStudent(SAMPLE_STUDENTS.find((student) => student.name === "Maya"));
  const leo = scoreStudent(SAMPLE_STUDENTS.find((student) => student.name === "Leo"));
  assert(maya.band === "hardware" && leo.band === "software", "Fixed mappings should retain recognizable hardware and software signals");
  const tiedEvidence = strongestEvidence(sampleStudent("Tie test", "", 0, { database: 3, api: 3 }));
  assert(tiedEvidence[0].label === "APIs", "Equal evidence should use a stable alphabetical tie-break");

  const balancedStatus = getScoringStatus();
  assert(balancedStatus.title.includes("fixed scoring model") && balancedStatus.details.includes("Position + confidence balance"), "Page 2 should explain the fixed balanced model");
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
  assert(balance.score >= 80, "Fixed-data balanced mode should create strongly balanced cohorts");
  assert(state.decisionLog.some((entry) => entry.includes("Applied the fixed model")), "Balanced decision trail should disclose the fixed equal-1× model");

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
