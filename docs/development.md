# Development

## Run locally

The application has no package manifest, dependencies, or build step. On Windows, [start-sortinghat.bat](../start-sortinghat.bat) opens [index.html](../index.html) in the default browser. You can also open that file directly.

To serve the repository with Python 3, run from the repository root:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Verify changes

The dependency-free smoke test loads [app.js](../app.js) with browser stubs and checks that cached DOM IDs exist in [index.html](../index.html). When Node.js is available, run it from the repository root:

```bash
node test/smoke.test.js
```

The current test covers categorical Hardware (`−1`), Bridge (`0`), and Software (`+1`) mappings; removal and migration of legacy instructor weights; signed and directional score arithmetic; response confidence; the Page 2 worked example; equal placement effects across tool, area, activity, and manual sources; opposing cross-source evidence; both cohort strategies; sort-map layout; and CSV import recognition. It also checks that legacy saved weights are removed while the roster and selected strategy remain, and that old teams and decision explanations are invalidated when either legacy weights are present or the saved scoring-model version changes.

For a browser check, import a non-sensitive CSV or load the fictional sample roster, visit Page 2, select a student, and compare the displayed contribution rows with the formula card. Then run each cohort strategy and inspect the decision trail and spectrum map.

## Local state and privacy

The app stores browser state using `desinv-sortinghat-v4`. It includes the scoring-model version, imported or manually entered students, and the selected sort strategy. At load time, a saved legacy `weights` property is discarded. Previously generated teams and the decision log are cleared when that property is present **or** when the saved scoring-model version differs from the current `SCORING_MODEL_VERSION`; the roster and strategy are retained. **Start new session** clears the local roster and returns to the equal-evidence scoring model with the Balanced strategy selected.

Questionnaire CSV files and local review captures may contain student information. The repository’s [.gitignore](../.gitignore) excludes `data/*.csv`, `data/real-roster.js`, and `sortinghat-*.png`; inspect `git status` before committing.
