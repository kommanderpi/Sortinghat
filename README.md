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

This repository has no deployment workflow. Because the app is static, it can be published with any GitHub Pages configuration that serves this directory’s static files.

The `.gitignore` excludes questionnaire CSV files, local roster files, and screenshots. Check `git status` before every push and never force-add files from `data/`.

## Scoring model

Each familiarity answer becomes 0–3 evidence points. Fixed professional/academic area choices contribute background evidence. The instructor can assign every tool and background area an axis position from −3 (hardware) to +3 (software), plus an influence multiplier from 0× to 3×. Blank answers contribute no evidence. Directional active weights move a student’s position; neutral active weights add response confidence without moving it.

Turning instructor weights off removes tool and professional-area evidence, but recent-activity answers and optional manual self-described practice remain fixed signals. The Scoring page states whether those signals distinguish the roster, remain without differentiating it, or are absent. With no fixed evidence, all students sit at Bridge. When fixed evidence does not differentiate students, balanced cohorts fall back to professional experience, cohort size, then name; a skill-spectrum split falls back to alphabetical order.

Balanced cohorts distribute the strongest orientations first and improve the result with swaps that reduce differences in size, orientation, hardware and software evidence, confidence, and professional experience. A skill-spectrum split ranks the roster by position, then confidence, then name, and divides it at the median for an approximately 50/50 split. Both cohorts complete both modules. See [the scoring architecture](docs/architecture.md#scoring-and-sorting).
