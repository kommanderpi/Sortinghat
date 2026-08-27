"use strict";

const fs = require("node:fs");
const path = require("node:path");

const appPath = path.join(__dirname, "..", "app.js");
const source = fs.readFileSync(appPath, "utf8");

const assertions = `
  const assert = (condition, message) => { if (!condition) throw new Error(message); };

  const initialState = state;
  state = { students: [], weights: {
    javascript: { axis: "not-a-number", influence: 1 },
    cad: { axis: 99, influence: 4 },
    api: { axis: "2.24", influence: "2" }
  }, datasetLabel: "Migration test", sortMode: "balanced", teams: null, decisionLog: [] };
  normalizeState();
  assert(Object.keys(state.weights).length === SIGNAL_DEFINITIONS.length, "State normalization should restore every signal setting");
  assert(state.weights.javascript.axis === 3 && state.weights.javascript.influence === 1, "A missing or invalid override axis should fall back to its built-in definition");
  assert(state.weights.cad.axis === 3 && state.weights.cad.influence === 0, "Out-of-range axes should clamp and invalid influences should become baseline");
  assert(state.weights.api.axis === 2.2 && state.weights.api.influence === 2, "Persisted numeric strings should normalize to valid slider and influence values");
  state = initialState;

  const neutralWeights = createNeutralWeights();
  assert(Object.keys(neutralWeights).length === 31, "Neutral reset should cover all 31 instructor-controlled settings");
  assert(SIGNAL_DEFINITIONS.every((signal) => neutralWeights[signal.key].axis === 0 && neutralWeights[signal.key].influence === 1), "Neutral reset should set every axis to 0 and every influence to 1× light");
  assert(SIGNAL_DEFINITIONS.some((signal) => DEFAULT_WEIGHTS[signal.key].axis !== 0 || DEFAULT_WEIGHTS[signal.key].influence !== 1), "First-run defaults should remain distinct from the neutral reset");

  const isolatedWeights = Object.fromEntries(SIGNAL_DEFINITIONS.map((signal) => [signal.key, { axis: 0, influence: 0 }]));
  isolatedWeights.javascript = { axis: 3, influence: 2 };
  isolatedWeights.areaTechnology = { axis: 3, influence: 2 };
  const workedStudent = sampleStudent("Worked", "", 0, { javascript: 4 });
  workedStudent.areas = ["areaTechnology"];
  workedStudent.activities.activityMicro = 2;
  workedStudent.directPosition = 5;
  const worked = calculateScoreBreakdown(workedStudent, isolatedWeights);
  assert(Math.abs(worked.signed - 38.1) < 0.000001, "Breakdown numerator should include tool, area, fixed 0.65 activity, and manual contributions");
  assert(Math.abs(worked.directionalEvidence - 45.9) < 0.000001, "Breakdown denominator should use evidence × |axis| plus the fixed manual denominator");
  assert(Math.abs(worked.position - (50 + (38.1 / 45.9) * 50)) < 0.000001, "Breakdown should map its normalized score onto the 0–100 line");
  assert(Math.abs(worked.confidence - (10 / 73) * 100) < 0.000001, "Breakdown confidence should include baseline possible evidence for rows without instructor adjustments");
  assert(worked.contributions.length === 4 && worked.contributions.some((item) => item.context.includes("0.65")), "Breakdown rows should expose every production contribution and the fixed activity multiplier");
  assert(!Object.hasOwn(calculateScoreBreakdown(workedStudent, isolatedWeights, false), "contributions"), "Production scoring should omit worked-example detail allocations");
  const defaultStateWeights = state.weights;
  state.weights = isolatedWeights;
  assert(scoreStudent(workedStudent).position === worked.position, "Production scoring and the worked breakdown should share the same calculation");
  state.weights = defaultStateWeights;
  const workedModel = buildWorkedExampleModel(workedStudent, isolatedWeights);
  const workedHtml = renderWorkedExampleModel(workedModel);
  assert(workedHtml.includes("38.1 ÷ 45.9") && workedHtml.includes("Manual direct position") && workedHtml.includes("Software"), "Worked-example render model should expose exact arithmetic and final placement without a DOM");
  const emptyWorkedHtml = renderWorkedExampleModel(buildWorkedExampleModel(null, isolatedWeights));
  assert(emptyWorkedHtml.includes("Import a roster"), "Worked example should explain the empty-roster state");
  const neutralWorked = buildWorkedExampleModel(sampleStudent("Neutral", "", 0, { javascript: 4 }), neutralWeights);
  assert(neutralWorked.noDirectionalEvidence && neutralWorked.position === 50 && neutralWorked.confidence > 0, "Neutral-axis evidence should build confidence while leaving the student at Bridge");
  state.weights = neutralWeights;
  const neutralModelStatus = getScoringStatus();
  assert(neutralModelStatus.neutral && neutralModelStatus.title.includes("confidence only"), "An all-neutral reset should explain that instructor weights only build confidence");
  state.weights = defaultStateWeights;
  const blankWorkedHtml = renderWorkedExampleModel(buildWorkedExampleModel(sampleStudent("Blank", "", 0, {}), neutralWeights));
  assert(blankWorkedHtml.includes("Blank and unfamiliar") && blankWorkedHtml.includes("every tool at 3 × its effective influence"), "Worked example should explain zero-evidence rows and the confidence denominator");
  const offWeights = Object.fromEntries(SIGNAL_DEFINITIONS.map((signal) => [signal.key, { axis: 0, influence: 0 }]));
  const answeredWithWeightsOff = renderWorkedExampleModel(buildWorkedExampleModel(sampleStudent("Answered", "", 0, { javascript: 4 }), offWeights));
  assert(answeredWithWeightsOff.includes("baseline mapping at 1×") && answeredWithWeightsOff.includes("3 × 3 × 1"), "Worked example should show baseline tool evidence when instructor adjustments are off");

  const offJavascript = { axis: -3, influence: 0 };
  const baselineJavascript = resolveEffectiveSetting(TOOL_DEFINITIONS.find((tool) => tool.key === "javascript"), { javascript: offJavascript });
  assert(baselineJavascript.isBaseline && baselineJavascript.axis === 3 && baselineJavascript.influence === 1, "An Off row should ignore its stored override axis and use the built-in axis at 1×");
  const overriddenJavascript = resolveEffectiveSetting(TOOL_DEFINITIONS.find((tool) => tool.key === "javascript"), { javascript: { axis: -2, influence: 3 } });
  assert(!overriddenJavascript.isBaseline && overriddenJavascript.axis === -2 && overriddenJavascript.influence === 3, "An enabled instructor setting should override the baseline axis and influence");

  const mixedStudent = sampleStudent("Mixed", "", 0, { javascript: 4, cad: 4 });
  const mixedWeights = structuredClone(offWeights);
  mixedWeights.javascript = { axis: -3, influence: 2 };
  const mixedBreakdown = calculateScoreBreakdown(mixedStudent, mixedWeights);
  assert(Math.abs(mixedBreakdown.signed - (-24.6)) < 0.000001, "Mixed scoring should combine a JavaScript override with baseline CAD evidence");
  assert(mixedBreakdown.contributions.some((item) => item.label.startsWith("JavaScript") && item.context.includes("instructor override")), "Worked rows should label instructor overrides");
  assert(mixedBreakdown.contributions.some((item) => item.label.startsWith("CAD") && item.context.includes("baseline mapping")), "Worked rows should label baseline evidence");

  const baselineAreaStudent = sampleStudent("Baseline area", "", 0, {});
  baselineAreaStudent.areas = ["areaTechnology"];
  assert(calculateScoreBreakdown(baselineAreaStudent, offWeights).position === 100, "Professional-area responses should use their built-in baseline mapping when instructor adjustments are off");

  const currentWeights = state.weights;
  const currentWeightsList = els.weightsList;
  state.weights = structuredClone(offWeights);
  state.weights.javascript.axis = -3;
  els.weightsList = { innerHTML: "" };
  renderWeights();
  assert(els.weightsList.innerHTML.includes('JavaScript (p5.js, etc.) built-in baseline position') && els.weightsList.innerHTML.includes('value="3" disabled'), "A baseline row should display its effective built-in axis in a disabled slider");
  state.weights = currentWeights;
  els.weightsList = currentWeightsList;

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
  renderWeights = () => {};
  renderRoster = () => {};
  renderPreview = () => {};
  renderScoringStatus = () => {};
  renderWorkedExample = () => {};
  resetWeights();
  assert(SIGNAL_DEFINITIONS.every((signal) => state.weights[signal.key].axis === 0 && state.weights[signal.key].influence === 1), "Reset action should apply axis 0 and 1× light to every instructor setting");
  state.decisionLog = ["stale sort explanation"];
  resetWeights();
  assert(state.decisionLog.length === 0, "Reset action should clear the previous sort explanation");
  let scoringStatusRenders = 0;
  renderScoringStatus = () => { scoringStatusRenders += 1; };
  const axisInput = { disabled: false, value: "", setAttribute(name, value) { this[name] = value; } };
  const axisControl = { style: { setProperty() {} } };
  const weightSubtitle = { textContent: "" };
  const axisRow = { dataset: { key: "javascript" }, querySelector(selector) { return selector.includes("input") ? axisInput : selector.includes("weight-name") ? weightSubtitle : axisControl; } };
  handleWeightChange({ target: { dataset: { setting: "axis" }, value: "2", closest() { return axisRow; } } });
  assert(state.weights.javascript.axis === 2 && scoringStatusRenders === 1, "An axis change should refresh the neutral-versus-directional scoring status");
  state.weights.javascript = { axis: -3, influence: 1 };
  handleWeightChange({ target: { dataset: { setting: "influence" }, value: "0", closest() { return axisRow; } } });
  assert(state.weights.javascript.axis === -3 && axisInput.disabled && Number(axisInput.value) === 3 && weightSubtitle.textContent.includes("built-in position"), "Selecting baseline should retain the saved override but show and label the disabled built-in axis");
  handleWeightChange({ target: { dataset: { setting: "influence" }, value: "1", closest() { return axisRow; } } });
  assert(!axisInput.disabled && Number(axisInput.value) === -3 && !weightSubtitle.textContent.includes("built-in position"), "Re-enabling an instructor adjustment should restore and relabel its saved override axis");
  state.weights = structuredClone(DEFAULT_WEIGHTS);
  state.decisionLog = ["stale sort explanation"];
  turnOffAllWeights();
  assert(SIGNAL_DEFINITIONS.every((signal) => state.weights[signal.key].influence === 0) && state.decisionLog.length === 0, "The baseline action should disable every instructor adjustment and clear stale sort explanations");
  assert(scoreStudent(sampleStudent("Baseline action", "", 0, { javascript: 4 })).band === "software", "The baseline action should preserve student tool evidence");
  state.weights = structuredClone(DEFAULT_WEIGHTS);
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
  assert(offStatus.title.includes("baseline questionnaire mapping is active"), "The scoring status should explain that baseline student evidence remains active");

  const baselineMaya = scoreStudent(SAMPLE_STUDENTS.find((student) => student.name === "Maya"));
  const baselineLeo = scoreStudent(SAMPLE_STUDENTS.find((student) => student.name === "Leo"));
  assert(baselineMaya.band === "hardware" && baselineLeo.band === "software", "Tool responses should still separate hardware and software signals with all instructor adjustments off");
  assert(baselineMaya.confidence > 0 && baselineLeo.confidence > 0, "Baseline questionnaire responses should continue building confidence");

  state.sortMode = "balanced";
  runSort(false);
  assert(state.teams.A.length === 6 && state.teams.B.length === 5, "An all-off balanced sort should keep cohort sizes as equal as possible");

  state.sortMode = "split";
  runSort(false);
  const baselineLowerHalf = state.teams.A.map(findStudent).map(scoreStudent);
  const baselineUpperHalf = state.teams.B.map(findStudent).map(scoreStudent);
  assert(Math.max(...baselineLowerHalf.map((score) => score.position)) <= Math.min(...baselineUpperHalf.map((score) => score.position)), "An all-off spectrum split should rank baseline questionnaire positions rather than discard them");

  const completeRoster = state.students;
  state.sortMode = "balanced";
  state.students = [sampleStudent("Fixed one", "", 0, {}), sampleStudent("Fixed two", "", 0, {})];
  state.students[0].activities.activityGithub = 1;
  state.students[1].activities.activityGithub = 3;
  assert(scoreStudent(state.students[0]).position === scoreStudent(state.students[1]).position, "Same-direction fixed activity can produce equal positions");
  assert(getScoringStatus().title.includes("baseline questionnaire mapping is active"), "Baseline status should remain explicit when fixed activity evidence is also present");
  state.students[1].activities.activityGithub = 1;
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
