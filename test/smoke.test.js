"use strict";

const fs = require("node:fs");
const path = require("node:path");

const appPath = path.join(__dirname, "..", "app.js");
const source = fs.readFileSync(appPath, "utf8");

const assertions = `
  const assert = (condition, message) => { if (!condition) throw new Error(message); };

  const maya = scoreStudent(SAMPLE_STUDENTS.find((student) => student.name === "Maya"));
  const leo = scoreStudent(SAMPLE_STUDENTS.find((student) => student.name === "Leo"));
  assert(maya.band === "hardware", "Maya should produce a hardware signal");
  assert(leo.band === "software", "Leo should produce a software signal");

  const tiedEvidence = strongestEvidence(sampleStudent("Tie test", "", 0, { database: 3, api: 3 }));
  assert(tiedEvidence[0].label === "APIs", "Equal evidence must not be ordered by questionnaire position");

  renderResults = () => {};
  showView = () => {};
  showToast = () => {};
  saveState = () => {};
  state.students = structuredClone(SAMPLE_STUDENTS);
  state.datasetLabel = "Test roster";
  runSort(false);
  assert(state.teams.A.length === 6 && state.teams.B.length === 5, "Odd rosters should split 6/5");
  const balance = calculateBalance(state.teams.A.map(findStudent), state.teams.B.map(findStudent));
  assert(balance.score >= 80, "Sample sort should create strongly balanced teams");

  state.sortMode = "split";
  runSort(false);
  const lowerHalf = state.teams.A.map(findStudent).map(scoreStudent);
  const upperHalf = state.teams.B.map(findStudent).map(scoreStudent);
  assert(state.teams.A.length === 6 && state.teams.B.length === 5, "Median mode should keep an odd roster approximately 50/50");
  assert(Math.max(...lowerHalf.map((score) => score.position)) <= Math.min(...upperHalf.map((score) => score.position)), "Median mode should keep every lower position in the lower-ranked cohort");

  const crowdedMap = [
    { student: { name: "Alexandra Longname" }, cohort: "A", score: { position: 50 } },
    { student: { name: "Bo" }, cohort: "B", score: { position: 50 } },
    { student: { name: "Casey" }, cohort: "A", score: { position: 51 } }
  ];
  const mapLayout = buildSortMapLayout(crowdedMap, 1200);
  assert(mapLayout.length === crowdedMap.length, "Sort map should retain every student");
  assert(new Set(mapLayout.map((point) => point.lane)).size === 3, "Crowded sort-map names should move into separate lanes");

  SIGNAL_DEFINITIONS.forEach((signal) => { state.weights[signal.key].influence = 0; });
  assert(SIGNAL_DEFINITIONS.every((signal) => state.weights[signal.key].influence === 0), "Turning instructor weights off should update every visible influence control");
  const offStatus = getScoringStatus();
  assert(offStatus.allOff, "The scoring status should identify when every instructor weight is off");
  assert(offStatus.title.includes("everyone ties at Bridge"), "The scoring status should explain the no-evidence fallback");

  state.sortMode = "balanced";
  runSort(false);
  assert(state.teams.A.length === 6 && state.teams.B.length === 5, "An all-off balanced sort should keep cohort sizes as equal as possible");
  assert(state.students.every((student) => scoreStudent(student).position === 50), "Students without fixed evidence should sit at Bridge when weights are off");

  state.sortMode = "split";
  runSort(false);
  const alphabeticalNames = state.students.map((student) => student.name).sort((a, b) => a.localeCompare(b));
  assert(state.teams.A.map(findStudent).map((student) => student.name).join("|") === alphabeticalNames.slice(0, 6).join("|"), "An all-off spectrum split should use the documented alphabetical tie-break");

  state.students[0].directPosition = 3;
  const neutralStatus = getScoringStatus();
  assert(neutralStatus.title.includes("does not separate this roster"), "Neutral fixed evidence should not claim to separate the roster");
  state.students[0].directPosition = null;
  state.students[0].activities.activityGithub = 1;
  const fixedStatus = getScoringStatus();
  assert(fixedStatus.title.includes("fixed evidence still separates"), "The scoring status should identify recent activity evidence that separates students");

  const completeRoster = state.students;
  state.sortMode = "balanced";
  state.students = [sampleStudent("Fixed one", "", 0, {}), sampleStudent("Fixed two", "", 0, {})];
  state.students[0].activities.activityGithub = 1;
  state.students[1].activities.activityGithub = 3;
  assert(scoreStudent(state.students[0]).position === scoreStudent(state.students[1]).position, "Same-direction fixed activity can produce equal positions");
  assert(getScoringStatus().title.includes("fixed evidence still separates"), "Balanced mode should recognize different raw software evidence at equal positions");
  state.students[1].activities.activityGithub = 1;
  assert(getScoringStatus().title.includes("does not separate this roster"), "Identical fixed evidence should not claim to separate the roster");
  state.students = completeRoster;

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
  assert(imported.skills.microcontrollers === 4, "CSV importer should recognize microcontroller familiarity");
  assert(imported.skills.javascript === 2, "CSV importer should recognize JavaScript familiarity");
  assert(imported.activities.activityGithub === 2, "CSV importer should recognize recent GitHub activity");
  assert(imported.areas.includes("areaTechnology") && imported.areas.includes("areaDesign"), "CSV importer should preserve fixed professional-area choices");

  console.log("Sortinghat smoke tests passed", JSON.stringify({
    students: state.students.length,
    teamSizes: [state.teams.A.length, state.teams.B.length],
    balance: balance.score,
    csvFields: 5
  }));
`;

const documentStub = { addEventListener() {} };
const localStorageStub = { getItem() { return null; }, setItem() {} };

const execute = new Function("document", "localStorage", "structuredClone", source + assertions);
execute(documentStub, localStorageStub, structuredClone);
