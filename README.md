# Sorting Hat

Sorting Hat is a local-first, static teaching app for DES INV 202. It imports questionnaire responses, places each student on a visible hardware-to-software skill line, and forms two cohorts. Both cohorts complete both quarter-semester modules: Physical Computing and Computational Design. Hardware, Bridge, and Software are scoring signals, not student tracks or cohort names.

The app has no published roster. During class, an instructor imports a Google Forms CSV; the browser processes it locally and stores the session in browser local storage. The refresh control beside roster search loads a fictional demonstration roster.

## Run it

On Windows, double-click `start-sortinghat.bat`. You can also open `index.html` directly, or serve this directory with Python 3:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

Run the dependency-free smoke test with:

```bash
node test/smoke.test.js
```

## CSV input and privacy

Export the Google Forms responses as CSV. The importer recognizes preferred name, pronouns, professional experience, the tool-familiarity grid, professional or academic areas, and recent GitHub, microcontroller, CAD, and generative-AI activity. Other fields are ignored. State remains in the current browser; it is never uploaded by this static app.

## Scoring and cohort strategies

There are no instructor weighting controls. Tool and selected-area responses use their fixed built-in hardware/software axes at equal 1×. A tool response becomes 0–3 evidence points; a selected area contributes 2. Recent activity uses its fixed axis and a 0.65 multiplier. An optional manual direct-position response uses a separate fixed rule.

Page 2 provides a live, student-specific worked example with every contribution, the signed numerator, directional denominator, placement, and response confidence. Choose either:

- **Balanced cohorts** — distributes the room to reduce gaps in position, hardware and software evidence, confidence, experience, and avoidable size.
- **Skill-spectrum split** — ranks the room on the line and divides it approximately 50/50.

See [the scoring architecture](docs/architecture.md#scoring-and-sorting) for the fixed mappings and formulas, and [development notes](docs/development.md) for verification and local-state details.

## Deployment and data safety

The project is static and has no deployment workflow; it can be served by a GitHub Pages configuration that publishes this directory. The `.gitignore` excludes questionnaire CSV files, local roster files, and captures that may include student data. Check `git status` before pushing and do not force-add files from `data/`.
