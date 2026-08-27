# Development

## Run locally

The app has no package manifest or build step. On Windows, [start-sortinghat.bat](../start-sortinghat.bat) opens [index.html](../index.html) in the default browser. You can also open `index.html` directly.

To serve the directory locally when Python 3 is available, run:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Smoke test

When Node.js is available, run the dependency-free smoke test:

```bash
node test/smoke.test.js
```

The test loads [app.js](../app.js) with browser stubs and checks sample scoring, the live worked-example calculation, neutral-reset semantics, both cohort strategies, all-instructor-weights-off fallbacks, fixed activity evidence, CSV import, and sort-map layout.

## Debugging state

The app persists its session in browser local storage under `desinv-sortinghat-v4`. Use the app’s “Start new session” control to clear the roster and restore default weights. The repository’s [.gitignore](../.gitignore) excludes local CSV rosters and screenshot captures that could contain student data.
