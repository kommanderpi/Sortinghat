"use strict";

const fs = require("node:fs");
const path = require("node:path");

const appPath = path.join(__dirname, "..", "app.js");
const indexPath = path.join(__dirname, "..", "index.html");
const stylesPath = path.join(__dirname, "..", "styles.css");
const source = fs.readFileSync(appPath, "utf8");
const indexSource = fs.readFileSync(indexPath, "utf8");
const stylesSource = fs.readFileSync(stylesPath, "utf8");

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
  assert(DIRECTION_CAPACITY.hardware === 28 && DIRECTION_CAPACITY.software === 51, "Direction capacity should reflect all available mapped evidence points");
  assert(Math.abs(RAW_QUESTION_BALANCE - (51 / 79) * 100) < 0.000001, "Questions-as-is marker should sit where both point multipliers are 1×");
  assert(!Object.hasOwn(state, "weights"), "New application state should not contain instructor weights");
  assert(state.scoringModelVersion === SCORING_MODEL_VERSION, "New state should identify the equal-evidence scoring model");
  assert(state.directionBalance === 50, "New state should balance Hardware and Software question opportunities equally");

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

  const defaultDirectionWeights = getDirectionWeights();
  assert(Math.abs(defaultDirectionWeights.hardware * DIRECTION_CAPACITY.hardware - defaultDirectionWeights.software * DIRECTION_CAPACITY.software) < 0.000001, "Centered balance should equalize maximum Hardware and Software opportunity");
  const workedStudent = sampleStudent("Worked", "", 0, { javascript: 4 });
  workedStudent.areas = ["areaTechnology"];
  workedStudent.activities.activityMicro = 2;
  workedStudent.directPosition = 5;
  const worked = calculateScoreBreakdown(workedStudent);
  const expectedWorkedSigned = 4 * defaultDirectionWeights.software - 2 * defaultDirectionWeights.hardware + 2;
  const expectedWorkedDirectional = 4 * defaultDirectionWeights.software + 2 * defaultDirectionWeights.hardware + 2;
  assert(Math.abs(worked.signed - expectedWorkedSigned) < 0.000001, "Breakdown numerator should apply one global category balance");
  assert(Math.abs(worked.directionalEvidence - expectedWorkedDirectional) < 0.000001, "Breakdown denominator should apply the same category balance");
  assert(Math.abs(worked.position - (50 + expectedWorkedSigned / expectedWorkedDirectional * 50)) < 0.000001, "Breakdown should map its normalized score onto the 0–100 line");
  assert(Math.abs(worked.confidence - (4 / 67) * 100) < 0.000001, "Confidence should count one point for a selected area");
  assert(worked.contributions.length === 4 && worked.contributions.every((item) => !item.context.includes("override")), "Worked rows should contain only categorical directions and response evidence");
  assert(!Object.hasOwn(calculateScoreBreakdown(workedStudent, false), "contributions"), "Production scoring should skip worked-example allocations");
  assert(scoreStudent(workedStudent).position === worked.position, "Production scoring and worked arithmetic should share one calculation");

  const workedHtml = renderWorkedExampleModel(buildWorkedExampleModel(workedStudent));
  assert(workedHtml.includes(formatNumber(expectedWorkedSigned) + " ÷ " + formatNumber(expectedWorkedDirectional)) && workedHtml.includes("category balance") && workedHtml.includes("Manual direct position") && workedHtml.includes("Software"), "Worked example should expose exact category-balanced arithmetic and final placement");
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
  const opposedStudent = sampleStudent("Opposed", "", 0, { javascript: 4, microcontrollers: 4 });
  assert(scoreStudent(opposedStudent).position < 50, "At equal opportunity, a Hardware point is stronger because the form offers fewer Hardware points");
  assert(scoreStudentRaw(opposedStudent).position === 50, "Page 1 raw scoring should always use 1× Hardware and 1× Software points");
  const rawRosterHtml = rosterRow(opposedStudent);
  assert(rawRosterHtml.includes("signal-badge bridge") && rawRosterHtml.includes("Raw questions-as-is position 50 / 100"), "Page 1 should render the unadjusted raw signal rather than the Page 2 score");
  assert(indexSource.includes("Signals on this page show the raw, unadjusted questions as-is") && indexSource.includes("<th>Raw signal</th>") && indexSource.includes("The room before question balancing"), "Page 1 should label its signals and graph as raw and unadjusted");
  const rawHardwareStudent = sampleStudent("Raw hardware", "", 0, { cad: 4 });
  const rawSoftwareStudent = sampleStudent("Raw software", "", 0, { javascript: 4 });
  state.directionBalance = 25;
  const rawGraphAtHardwareSetting = buildRawSignalGraphModel([rawHardwareStudent, opposedStudent, rawSoftwareStudent]);
  state.directionBalance = 75;
  const rawGraphAtSoftwareSetting = buildRawSignalGraphModel([rawHardwareStudent, opposedStudent, rawSoftwareStudent]);
  assert(rawGraphAtHardwareSetting.hardware === 1 && rawGraphAtHardwareSetting.bridge === 1 && rawGraphAtHardwareSetting.software === 1 && rawGraphAtHardwareSetting.median === 50, "Raw graph should summarize every raw signal and its median");
  assert(rawGraphAtHardwareSetting.items.map((item) => item.score.position).join(",") === rawGraphAtSoftwareSetting.items.map((item) => item.score.position).join(","), "Raw graph positions should remain independent of the Page 2 slider");
  assert(buildRawSignalGraphModel([]).items.length === 0 && buildRawSignalGraphModel([]).median === 50, "Raw graph should provide a stable empty state");
  assert(medianLabelEdge(0) === "left" && medianLabelEdge(50) === "center" && medianLabelEdge(100) === "right", "Raw graph median labels should remain visible at both axis edges");
  assert(indexSource.includes('role="list" aria-label="Students on the raw Hardware to Software spectrum"') && appSource.includes('role="listitem"'), "Raw graph should expose list semantics for student points");
  assert(appSource.includes("ResizeObserver") && appSource.includes("renderRawSignalGraph();") && appSource.includes("renderPreview();"), "Responsive graphs should recompute after their containers become visible or resize");
  state.directionBalance = DEFAULT_DIRECTION_BALANCE;
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
  [oneToolPoint, oneAreaPoint, oneActivityPoint].forEach((breakdown) => {
    assert(Math.abs(breakdown.signed - defaultDirectionWeights.software) < 0.000001 && Math.abs(breakdown.directionalEvidence - defaultDirectionWeights.software) < 0.000001, "One Software point should have the same category weight across mapped sources");
  });
  assert(oneManualPoint.signed === 1 && oneManualPoint.directionalEvidence === 1, "Manual placement should remain outside the question-balance adjustment");
  const centeredManualStudent = sampleStudent("Centered manual", "", 0, {});
  centeredManualStudent.directPosition = 3;
  const centeredManual = calculateScoreBreakdown(centeredManualStudent);
  assert(centeredManual.signed === 0 && centeredManual.directionalEvidence === 0 && centeredManual.position === 50, "A centered manual response should add no directional strength");
  const crossSourceOpposition = sampleStudent("Cross-source opposition", "", 0, { javascript: 2 });
  crossSourceOpposition.activities.activityMicro = 1;
  state.directionBalance = RAW_QUESTION_BALANCE;
  const rawQuestionWeights = getDirectionWeights();
  const crossSourceScore = calculateScoreBreakdown(crossSourceOpposition);
  assert(Math.abs(rawQuestionWeights.hardware - 1) < 0.000001 && Math.abs(rawQuestionWeights.software - 1) < 0.000001, "Questions-as-is marker should apply 1× to both directions");
  assert(crossSourceScore.signed === 0 && crossSourceScore.directionalEvidence === 2 && crossSourceScore.position === 50, "At the questions-as-is marker, equal opposing raw points should cancel at Bridge");
  state.directionBalance = 25;
  assert(scoreStudent(crossSourceOpposition).position < 50, "Moving the slider toward Hardware should favor Hardware evidence");
  state.directionBalance = 75;
  assert(scoreStudent(crossSourceOpposition).position > 50, "Moving the slider toward Software should favor Software evidence");
  state.directionBalance = DEFAULT_DIRECTION_BALANCE;

  const maya = scoreStudent(SAMPLE_STUDENTS.find((student) => student.name === "Maya"));
  const leo = scoreStudent(SAMPLE_STUDENTS.find((student) => student.name === "Leo"));
  assert(maya.band === "hardware" && leo.band === "software", "Categorical mappings should retain recognizable hardware and software signals");
  const tiedEvidence = strongestEvidence(sampleStudent("Tie test", "", 0, { database: 3, api: 3 }));
  assert(tiedEvidence[0].label === "APIs", "Equal evidence should use a stable alphabetical tie-break");

  const balancedStatus = getScoringStatus();
  assert(balancedStatus.title.includes("balanced equally") && balancedStatus.details.some((detail) => detail.includes("Hardware point")) && balancedStatus.details.some((detail) => detail.includes("Software point")) && balancedStatus.details.includes("Position + confidence balance"), "Page 2 should explain the centered question balance");
  state.sortMode = "split";
  assert(getScoringStatus().details.includes("Ranked median split"), "Page 2 should explain the selected spectrum strategy");

  const sliderAttributes = {};
  let rawMarkerPosition = "";
  const rawMarkerAttributes = {};
  els.directionBalance = { value: "", setAttribute(name, value) { sliderAttributes[name] = value; } };
  els.directionBalanceOutput = { textContent: "" };
  els.hardwareBalanceValue = { textContent: "" };
  els.softwareBalanceValue = { textContent: "" };
  els.directionWeightSummary = { textContent: "" };
  els.rawQuestionMarker = { title: "", style: { setProperty(name, value) { if (name === "--raw-question-balance") rawMarkerPosition = value; } }, setAttribute(name, value) { rawMarkerAttributes[name] = value; } };
  els.rawQuestionMarkerValue = { textContent: "" };
  state.directionBalance = DEFAULT_DIRECTION_BALANCE;
  renderDirectionBalance();
  assert(rawMarkerPosition === String(RAW_QUESTION_BALANCE) + "%" && els.rawQuestionMarkerValue.textContent === "35.4 / 64.6", "Balance control should render the questions-as-is marker at 51/79");
  assert(rawMarkerAttributes["aria-label"].includes("35.4% Hardware") && rawMarkerAttributes["aria-label"].includes("both point multipliers are 1×"), "Questions-as-is marker should expose its ratio and meaning accessibly");
  let balanceRenderCount = 0;
  let balanceSaveCount = 0;
  renderRoster = () => { balanceRenderCount += 1; };
  renderPreview = () => { balanceRenderCount += 1; };
  renderScoringStatus = () => { balanceRenderCount += 1; };
  renderWorkedExample = () => { balanceRenderCount += 1; };
  renderResults = () => { balanceRenderCount += 1; };
  saveState = () => { balanceSaveCount += 1; };
  state.teams = { A: [retainedStudent.id], B: [] };
  state.decisionLog = ["stale result"];
  handleDirectionBalanceChange({ target: { value: "25" } });
  assert(state.directionBalance === 25 && state.teams === null && state.decisionLog.length === 0, "Moving the balance slider should invalidate prior cohort results");
  assert(balanceRenderCount === 4 && balanceSaveCount === 1, "Moving the balance slider should refresh adjusted views, leave the raw roster unchanged, and persist once");

  renderResults = () => {};
  showView = () => {};
  showToast = () => {};
  saveState = () => {};
  const balanceSensitive = sampleStudent("Balance sensitive", "", 0, { microcontrollers: 2 });
  balanceSensitive.directPosition = 5;
  const centeredComparison = sampleStudent("Centered comparison", "", 0, {});
  centeredComparison.directPosition = 3;
  state.directionBalance = 25;
  const adjustedOrientationGap = Math.abs(scoreStudent(balanceSensitive).position - scoreStudent(centeredComparison).position);
  const rawOrientationGap = Math.abs(scoreStudentRaw(balanceSensitive).position - scoreStudentRaw(centeredComparison).position);
  const adjustedBalanceMetrics = calculateBalance([balanceSensitive], [centeredComparison]);
  assert(Math.abs(adjustedBalanceMetrics.orientationGap - adjustedOrientationGap) < 0.000001 && Math.abs(adjustedBalanceMetrics.orientationGap - rawOrientationGap) > 1, "Balanced-mode metrics should use adjusted Page 2 scores rather than raw Page 1 signals");
  assert(scoreStudent(balanceSensitive).position < scoreStudent(centeredComparison).position && scoreStudentRaw(balanceSensitive).position > scoreStudentRaw(centeredComparison).position, "Regression fixture should reverse raw and adjusted ordering");
  state.students = [balanceSensitive, centeredComparison];
  state.sortMode = "split";
  runSort(false);
  assert(state.teams.A[0] === balanceSensitive.id && state.teams.B[0] === centeredComparison.id, "Spectrum split should rank adjusted Page 2 positions rather than raw Page 1 signals");
  state.students = structuredClone(SAMPLE_STUDENTS);
  state.datasetLabel = "Test roster";
  state.sortMode = "balanced";
  state.directionBalance = DEFAULT_DIRECTION_BALANCE;
  runSort(false);
  assert(state.teams.A.length === 6 && state.teams.B.length === 5, "Balanced mode should split an odd roster 6/5");
  const balance = calculateBalance(state.teams.A.map(findStudent), state.teams.B.map(findStudent));
  assert(balance.score >= 80, "Response-driven balanced mode should create strongly balanced cohorts");
  assert(state.decisionLog.some((entry) => entry.includes("transparent category balance")), "Balanced decision trail should disclose the global question balance");

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
  const narrowMapLayout = buildSortMapLayout(crowdedMap, 240);
  assert(new Set(narrowMapLayout.map((point) => point.lane)).size === 3, "Raw graph should separate crowded students at a narrow viewport");

  const horizontalPreview = buildPreviewLayout([
    { student: { name: "Hardware" }, position: 0 },
    { student: { name: "Bridge" }, position: 50 },
    { student: { name: "Software" }, position: 100 }
  ], 900);
  assert(horizontalPreview.map((point) => point.left).join(",") === "0,50,100", "Page 2 preview should map score position to a horizontal left-to-right axis");
  assert(horizontalPreview.every((point) => Object.hasOwn(point, "lane") && !Object.hasOwn(point, "offset")), "Page 2 preview should use vertical collision lanes on its horizontal axis");
  const crowdedPreview = buildPreviewLayout([
    { student: { name: "A" }, position: 50 },
    { student: { name: "B" }, position: 50 },
    { student: { name: "C" }, position: 50 }
  ], 240);
  assert(new Set(crowdedPreview.map((point) => point.lane)).size === 3, "Horizontal preview should separate overlapping students into rows");
  const balanceCardIndex = indexSource.indexOf('class="direction-balance-card"');
  const previewIndex = indexSource.indexOf('class="score-preview"');
  const formulaIndex = indexSource.indexOf('class="formula-card"');
  assert(balanceCardIndex < previewIndex && previewIndex < formulaIndex, "Adjusted live preview should sit directly below the Page 2 balance slider");
  assert(indexSource.includes("A student’s conversation with the Hat"), "Page 2 worked example should frame the score as a student conversation with the Hat");
  assert(indexSource.includes("Numerator N = Σ(evidence × direction × category balance) + m") && indexSource.includes("Denominator D = Σ(evidence × |direction| × category balance) + |m|") && indexSource.includes("The denominator measures total directional evidence, so it is never negative"), "The full scoring panel should clearly explain the complete numerator and denominator maths");
  assert(indexSource.includes("3 Hardware points + 1 Software point") && indexSource.includes("position 25") && indexSource.includes("signed Hardware evidence is greater"), "The scoring panel should derive a concrete position from actual directional evidence");
  assert(stylesSource.includes('.model-controls .direction-balance-card, .model-controls .score-preview, .model-controls .formula-card, .model-controls .sort-mode-card { grid-column: 1 / -1; }'), "Formula and cohort-strategy panels should each span the full Page 2 width");
  const controlsIndex = indexSource.indexOf('class="model-controls"');
  const strategyIndex = indexSource.indexOf('class="sort-mode-card"');
  const scoringStatusIndex = indexSource.indexOf('class="scoring-status"');
  assert(controlsIndex < formulaIndex && formulaIndex < strategyIndex && strategyIndex < scoringStatusIndex, "Full-width formula and cohort-strategy panels should remain in the Page 2 controls flow");

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

const execute = new Function("document", "localStorage", "structuredClone", "indexSource", "appSource", "stylesSource", source + assertions);
execute(documentStub, localStorageStub, structuredClone, indexSource, source, stylesSource);
