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

The score is driven by reported student evidence. Mappings only classify evidence as Hardware (`−1`), Bridge (`0`), or Software (`+1`): there are no per-tool or per-student weighting controls. **Page 1 is deliberately raw:** its roster badge, strongest-evidence labels, and all-student signal graph always use questions-as-is scoring, with Hardware and Software at `1×`. The graph sits above the roster and shows the raw Hardware / Bridge / Software counts and class median, exposing the questionnaire’s original directional skew. It never changes when the Page 2 slider moves.

**Page 2** has one global **Hardware / Software question-balance** slider. Its default 50 / 50 setting compensates for the questionnaire’s unequal directional capacity (28 Hardware points and 51 Software points), so either category has the same maximum opportunity to affect placement. It applies one shared multiplier to every mapped Hardware question and another to every mapped Software question; it never changes relative strength within a category. The marked **Questions as-is** point, 35.4 / 64.6, restores raw 1× / 1× question points. Directly below the slider, the horizontal live preview places adjusted student scores from Hardware `0` through Bridge `50` to Software `100`. The Page 2 preview, worked example, status, results, Balanced-cohort metrics, and Skill-spectrum ranking use this adjusted score.

A tool response supplies 0–3 points (`response − 1`, with blank and unfamiliar both 0); a selected area supplies one point; recent activity uses its reported level (0–3); and an optional manual choice supplies its signed distance from choice 3. The slider affects mapped tools, areas, and activities, but not Bridge mappings, confidence, or the manual response.

Page 2 labels its live, student-specific worked example **A student’s conversation with the Hat**. It shows every contribution, the signed numerator, directional denominator, placement, and response confidence. In the Page 2 control flow, the full-width Cohort strategy panel comes before the separate full-width Scoring maths panel. The maths panel explains the four calculation stages and a concrete evidence example. The cohort panel offers either:

- **Balanced cohorts** — distributes the room to reduce gaps in position, hardware and software evidence, confidence, experience, and avoidable size. Its balancing optimizer still uses fixed trade-off coefficients; those affect cohort assignment, not a student's evidence strength or placement.
- **Skill-spectrum split** — ranks the room on the line and divides it approximately 50/50.

See [the scoring architecture](docs/architecture.md#scoring-and-sorting) for the balance formula and mappings, and [development notes](docs/development.md) for verification and local-state details.

## Deployment and data safety

The project is static and has no deployment workflow; it can be served by a GitHub Pages configuration that publishes this directory. The `.gitignore` excludes questionnaire CSV files, local roster files, and captures that may include student data. Check `git status` before pushing and do not force-add files from `data/`.
