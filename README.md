# discrete-convergence

**Phase 2 of the SDD Research Program**

## What This Is

discrete-convergence validates and hardens the Spec-Driven Development (SDD) master methodology against automated, tool-driven quality measurement.

**Phase 1** ([layered-convergence](https://github.com/stephendeslate/layered-convergence)) discovered failure modes through LLM-based scoring — three separate Claude sessions producing subjective assessments across 44 trials, 132 builds, 10 layers, and 102 failure modes.

**Phase 2** (this project) replaces LLM scoring with discrete tool output. Automated tools measure what LLM scoring estimated. The delta between the two reveals blind spots in the methodology.

## Research Program

```
layered-convergence (complete)     discrete-convergence (active)
─────────────────────────         ──────────────────────────────
44 trials, 10 layers              Validates LC methodology
LLM-based scoring                 Tool-based scoring
102 failure modes found           Measures how much they fail
Master methodology v1.0           Refines to production standard
```

## Phase Status

| Phase | Name | Status |
|-------|------|--------|
| 0 | Calibration | Active |
| 1 | Test Execution | Pending |
| 2 | Container Verification | Pending |
| 3 | Runtime Validation | Pending |
| 4 | Edge Case & Completeness | Pending |

## Scoring

Scoring uses automated tools — linters, type checkers, test runners, container builds, security scanners, load testers, and accessibility auditors — to produce numeric scores across multiple dimensions. Each dimension maps to a specific tool with a defined pass/fail threshold. Phases activate progressively more dimensions as infrastructure requirements increase.

## What's Public vs Private

This repository publishes **trial builds** (source code) and **aggregate results** (pass/fail, overall scores). The methodology, scoring rubrics, failure mode definitions, and scorer implementation are not tracked in git — see `.gitignore`.

**Published:** Trial source code, README, phase status, aggregate scores
**Not published:** Methodology, scoring dimensions, trial protocols, scorer scripts, per-dimension scores, failure mode details

## Trial Builds

Trial directories contain full-stack applications (NestJS + Next.js + Prisma + PostgreSQL + Turborepo) built from the SDD methodology. Each is an independent build — no code copying between trials.

---

**SJD Labs, LLC** — Stephen Deslate
**Research Program:** Spec-Driven Development (SDD)
**Phase:** 2 (discrete-convergence)
