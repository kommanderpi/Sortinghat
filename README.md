# Sorting Hat

A local-first, static teaching app for DES INV 202. It imports questionnaire responses, maps tool familiarity onto a visible hardware-to-software skill spectrum, and creates two student cohorts while showing its scoring assumptions and decision trail.

Both cohorts complete both quarter-semester modules:

- **Physical Computing:** hardware and computation, producing physical artifacts and things.
- **Computational Design:** software, AI, and simulations without producing physical artifacts.

Hardware, Bridge, and Software describe skill signals only. They are not cohort names, student identities, or separate educational tracks.

The two cohort names are **Hufflestuff** and **Ravenworks**. These playful names are independent of module order and skill orientation.

The published app contains no student roster. Instructors import a Google Forms CSV during class; the browser processes and stores the selected data locally without uploading it to a server. The refresh button beside roster search loads a fictional demonstration roster.

## Run it

On Windows, double-click `start-sortinghat.bat`. You can also open `index.html` directly, or from this directory run:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

Run the dependency-free smoke test with:

```bash
node test/smoke.test.js
```

## CSV input

Export responses from Google Forms as CSV. The importer recognizes:

- Preferred name, pronouns, and professional experience
- The tool-familiarity grid from the supplied DES INV 202 questionnaire
- Recent activity involving GitHub, microcontrollers, CAD, and generative AI

Unrecognized questionnaire fields remain private and are ignored. All app state stays in browser local storage.

## GitHub Pages deployment

This directory includes a GitHub Actions workflow that publishes the static app whenever the `main` branch is pushed.

1. Create a GitHub repository and copy this directory into it.
2. Commit and push to `main`.
3. In **Settings → Pages**, choose **GitHub Actions** as the source.
4. Open the URL shown by the completed `Deploy GitHub Pages` workflow.

The `.gitignore` excludes questionnaire CSV files, generated roster bundles, and local screenshots. Check `git status` before every push and never force-add files from `data/`.

## Scoring model

Each familiarity answer becomes 0–3 evidence points. Fixed professional/academic area choices contribute background evidence. The instructor can assign every tool and background area an axis position from −3 (hardware) to +3 (software), plus an influence multiplier from 0× to 3×. Blank answers contribute no evidence.

The deterministic balanced sorter seeds students with the strongest orientations first, then tests cross-cohort swaps to minimize differences in cohort size, hardware evidence, software evidence, overall orientation, familiarity coverage, and professional experience.

The alternative skill-spectrum split ranks the complete roster by continuous spectrum position and divides at the cohort median. This guarantees approximately equal cohort sizes even when the class contains many more software-oriented signals. The resulting groups remain simply Cohort A and Cohort B; both take both modules.
