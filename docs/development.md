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

The current test covers categorical Hardware (`−1`), Bridge (`0`), and Software (`+1`) mappings; removal and migration of legacy instructor weights; the 28 Hardware / 51 Software directional capacities; the centered global question-balance calculation; the Questions-as-is marker and its accessible label; signed and directional score arithmetic; response confidence; and the Page 2 worked example. It also checks that all mapped sources on the same side receive the same global multiplier, while manual direct position remains unadjusted; that moving the slider invalidates teams and the decision log, refreshes dependent views, and persists once; both cohort strategies; sort-map layout; and CSV import recognition.

For a browser check, import a non-sensitive CSV or load the fictional sample roster, visit Page 2, and verify that the Hardware / Software question-balance slider starts at `50 / 50`. Its summary should report Hardware `×1.41` and Software `×0.77` (rounded), and the marked Questions-as-is position should read `35.4 / 64.6`. Move the control and confirm that its accessible value text, multiplier summary, student placements, worked-example rows, and scoring status change together. Existing cohort results should clear; run either strategy again and inspect the decision trail.

## Local state and privacy

The app stores browser state using `desinv-sortinghat-v4`. It includes the scoring-model version, `directionBalance`, imported or manually entered students, and the selected sort strategy. At load time, a saved legacy `weights` property is discarded. `SCORING_MODEL_VERSION` is `3`; results from older scoring versions are invalidated, while the roster and strategy are retained. Teams and the decision log are also cleared when a saved slider value must be normalized. **Start new session** clears the local roster and returns to the `50 / 50` question balance with the Balanced strategy selected.

Questionnaire CSV files and local review captures may contain student information. The repository’s [.gitignore](../.gitignore) excludes `data/*.csv`, `data/real-roster.js`, and `sortinghat-*.png`; inspect `git status` before committing.
