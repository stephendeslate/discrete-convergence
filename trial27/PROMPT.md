You are running Trial 27 of the Discrete Convergence experiment (Phase 4: Edge Case & Completeness).

## Context
- Phase 4 activates FC (Feature Completeness) and UI (User Experience) as new focus dimensions
- All 24 dimensions are scored cumulatively (phases 0–4) — nothing is dropped
- Phase 4 convergence requires 2 consecutive clean trials (all 24 dims ≥8, 0 new failure modes)
- T26 was clean (24/24 PASS, 220/240, avg 9.17) — consecutive clean count: 1/2
- This is T27 — if clean, Phase 4 converges and the experiment completes
- Methodology: v3.0-dc (read /METHODOLOGY-v3.0-dc.md)

## Scorer environment
- `PHASE=4` is the default — scores all 24 dimensions: AX, BV, CD, CQ-S, DA, DB, EC, FC, FI, II, LT, PF-L, PF-R, SE, SE-R, SE-S, ST, SV, TA-I, TA-U, TE, TS, TX, UI
- Trial score per dimension = min across all 3 projects
- A clean trial = all 24 dims ≥8 AND 0 new failure modes

## Phase 4 active dimensions — what the scorers check

### FC (Feature Completeness) — fc.sh
- **Floor (0–7):** endpoint ratio = (implemented endpoints matching spec) / (spec endpoints) × 7
- **C8 (+1):** Schema-Code Parity — ≥80% of Prisma models with ≥2 scalar fields have a matching service file. Infrastructure models excluded: Tenant, Organization, Company, Account
- **C9 (+1):** No Stubs — domain-action service methods must contain conditional logic (if/switch/throw/ternary) within 30 lines of method signature
- **C10 (+1):** DTO-Schema Alignment — create DTO field names must overlap ≥50% with Prisma model scalar fields

### UI (User Experience) — ui.sh
- **Floor (7 checks for score 0–7):** ≥8 components, dark mode support, loading states, error states, cn() utility, 'use server' actions, form validation (zod/yup/pattern)
- **C8 (+1):** ≥3 domain route pages (page.tsx NOT in login/register/settings/dashboard/data-sources)
- **C9 (+1):** ≥3 write server actions (POST/PUT/PATCH/DELETE in 'use server' files)
- **C10 (+1):** ≥2 tsx files with form submission (form/onSubmit/handleSubmit/formAction/useFormState/useFormStatus)

## T26 baseline — weakest dimensions (score=8, at risk of regression)
CD, CQ-S, II, PF-L, PF-R, SE, SE-R, TA-I, TE — pay attention to these during builds.

## Your task
Build all 3 projects from scratch following the methodology exactly:

1. **Read the methodology first:** /METHODOLOGY-v3.0-dc.md — follow it step by step
2. **Read the build plans:** /BUILD_PLANS/analytics-engine.md, /BUILD_PLANS/event-management.md, /BUILD_PLANS/fleet-dispatch.md
3. **Build into:** /trial27/analytics-engine/, /trial27/event-management/, /trial27/fleet-dispatch/
4. **Run convergence gates** as specified in the methodology — do not skip gates or self-assess
5. **Score each project** when complete: `bash scorer/score-trial.sh trial27/<project>`
6. **Final scoring:** `bash scorer/score-trial.sh trial27` (scores all 3, produces SCORE_REPORT.md and DISCRETE_SCORES.json)

## Critical rules
- Do NOT copy from previous trials — fresh builds only
- Do NOT self-assess — run the scorer at every gate
- The scorer is the source of truth, not your estimation
- Fix any dimension scoring <8 before moving to the next gate
- All 3 projects must pass all 24 dimensions for a clean trial
