# Migration Progress: OneCX Angular 18 → 19

Date Started: **[YYYY-MM-DD]**
Repository: **[path/to/repo]**
Git Branch: **[branch name]**
Status: **[In Progress / Completed]**

---

## Custom Rules & Constraints

<!-- Rules from migration-custom-user.instructions.md and any developer-specified overrides -->
- [Add project-specific rules here during Phase 1]

---

## Documentation Discovery

<!-- Comprehensive map of all documentation pages visited during Phase 1 -->

| Page URL | Title | H2 Count | Tasks Created | Match? |
|----------|-------|----------|---------------|--------|
| [URL] | [Title] | [N] | [N] | [✓/✗] |

**Secondary links found:** [list any sub-pages discovered and their status]

---

## Dependency Analysis

| @onecx Package | Current Version | Documented Version | Action |
|---|---|---|---|
| [package] | [current] | [documented] | [update/skip/not-in-docs] |

- **TypeScript**: current [X.Y.Z] → required for target Angular: [range]
- **Peer dependency conflicts**: [list or "none found"]

---

## Phase 1: Preparation & Planning (STRICT — all must pass or STOP)

| Task | Status | Notes |
|------|--------|-------|
| npm install fresh baseline | [ ] | Run once, capture baseline. STRICT: must succeed or STOP. |
| npm run build baseline | [ ] | STRICT: must pass or STOP. Fix before proceeding. |
| npm run lint baseline | [ ] | STRICT: must pass or STOP. Fix before proceeding. |
| npm run test baseline | [ ] | STRICT: must pass or STOP. Record coverage %. Fix before proceeding. |
| TypeScript compatibility check | [ ] | Verify TS version matches target Angular requirements. |
| Check .vscode/tasks.json | [ ] | Verify npm:build, npm:lint, npm:test exist. Create from template if missing. |
| Check copilot-instructions.md | [ ] | Tag all Angular 18 specific lines with # [REMOVE-AFTER-MIGRATION]. |
| Vulnerability & deprecation scan | [ ] | If NPM MCP available: scan packages. Otherwise: note "manual scan recommended". |
| Discover OneCX docs | [ ] | Fetch migration index page + all linked pages. Visit EVERY link. |
| Discover PrimeNG docs | [ ] | If repo uses primeng: fetch migration guide (detect version from package.json). |
| Discover Nx migration docs | [ ] | If workspace is Nx: fetch migration guide. |
| Build complete task tree | [ ] | Count H2 subsections per page. One H2 = one task. Show verification table. |
| Create MIGRATION_PROGRESS.md | [ ] | Populate task list below using this template exactly. |

**Phase 1 Baseline Records:**
- npm install: [pass/fail]
- npm run build: [pass/fail — if fail: STOPPED, developer fixed]
- npm run lint: [pass/fail — if fail: STOPPED, developer fixed]
- npm run test: [pass/fail — coverage: X%]
- Lint warning baseline: [N warnings — frozen for all Phase A comparisons]

**Phase 1 Summary:**
- [ ] All audits complete
- [ ] Documentation fully expanded (no assumptions from headlines)
- [ ] Task tree created and reviewed
- [ ] Ready to start Phase A

---

## Phase A: Pre-Migration Code Changes

> Execute one task per invocation. DO NOT combine multiple H2 sections.
> Each entry = ONE H2 section from documentation.
> Validation order: build → lint → test (always in this order).
> Phase A tasks = pre-upgrade code changes ONLY (no package version upgrades here — those are Phase B).

### Task Template (COPY for each task)

```
**[A.N]. [Task Name from H2 heading]**
- [ ] Status: [ ] not started | [x] completed | [-] not applicable
- Source page: [URL — exact page where this H2 was found]
- Applicability: must-have | nice-to-have | not applicable
- Repository evidence: [grep results for EVERY item in this task — one search per sub-item]
- Sub-steps executed: [list each 📌 bullet item and whether done/not-applicable/not-found]
- Files changed: [exact file list with specific lines changed]
- Validation (in order):
  * npm run build: [✓ pass or full error output]
  * npm run lint: [✓ N warnings (vs baseline N) or full error output]
  * npm run test: [✓ X% coverage or full error output]
- Final outcome: success | error
- Edge cases: [any gotchas, partial applicability notes]
```

### Phase A Tasks (discovered by planner — all from fetched H2 headings)

> PLANNER NOTE: List tasks below. One entry per H2 heading on fetched doc pages.
> Do NOT add time estimates. Do NOT add package upgrade tasks here.

**[A.1]. [Task Name]**
- [ ] not started
- Source page: [URL — fetched by planner]
- Applicability: [TBD by executor]
- Repository evidence: [TBD by executor]
- Sub-steps executed: [TBD by executor]
- Files changed: [TBD]
- Validation: build [TBD] | lint [TBD] | test [TBD]
- Final outcome: [TBD]

**[A.N — Last Phase A Task]. End-of-Phase-A Build State Record**
- [ ] not started
- Source page: N/A — required by migration process
- **STRICT MODE**: Build/lint/test MUST pass. Phase A changes are made with the CURRENT Angular version — the build should work.
- If build or test fails, fix errors before proceeding to Phase B. This is the executor's responsibility.
- Validation (MUST pass — fix failures before marking complete):
  * npm run build: [must pass — fix errors if failing]
  * npm run lint: [must pass — 0 errors, 0 NEW warnings vs baseline]
  * npm run test: [must pass — record coverage %]
- Final outcome: [success only after all three pass]
- Remaining issues: [list any issues found and how they were resolved]

---

## Phase B: Core Upgrade Gate (Manual Developer Approval Required)

> Phase B is triggered after ALL Phase A tasks are [x] complete.
> The orchestrator presents a summary and asks for explicit developer approval.
> Agent does NOT proceed to Phase B upgrades without developer's "Yes".

**Orchestrator presents:**
- Files changed in Phase A: [git diff --stat]
- End-of-Phase-A build state: [pass/fail from last Phase A task]
- Upgrade target versions: [@angular/core X.Y.Z, nx M.N.P if applicable]

**Developer approval:**
- [ ] Approved to proceed with core package upgrades
- Approval recorded by: [Developer Name] on [Date]

**Phase B Tasks (doc-driven — fetched from OneCX upgrade guide at approval time):**

> EXECUTOR NOTE: When Phase B is approved:
> 1. Fetch OneCX migration index page
> 2. Find the "Upgrade to Angular N" section and all linked sub-pages
> 3. Create tasks from H2 headings on those pages (same rule: 1 H2 = 1 task)
> 4. Execute each task with full validation (build → lint → test)
> These tasks are NOT pre-planned — they are discovered at Phase B execution time.

---

## Phase C: Post-Migration Cleanup

> Execute after Phase B is confirmed stable (developer sign-off).
> Same format as Phase A (one task per invocation).
> Validation order: build → lint → test.
> Transitional build/test failures allowed per task if fully documented.
> After ALL Phase C tasks: run Error Recovery Loop to resolve remaining failures.

### Phase C Task Template (COPY for each task)

```
**[C.N]. [Task Name from H2 heading]**
- [ ] Status: [ ] not started | [x] completed | [-] not applicable
- Source page: [URL — exact page where this H2 was found]
- Applicability: must-have | nice-to-have | not applicable
- Repository evidence: [grep results for EVERY item in this task]
- Sub-steps executed: [list each sub-item and whether done/not-applicable]
- Files changed: [exact file list]
- Validation (in order):
  * npm run build: [✓ pass or full error output — record transitional errors]
  * npm run lint: [✓ pass — MUST pass even in Phase C]
  * npm run test: [✓ X% coverage or full error output]
- Final outcome: success | error-recorded-for-recovery
```

### Phase C Tasks (discovered by planner — all from fetched H2 headings)

**[C.1]. [Task Name]**
- [ ] not started
- Source page: [URL]
- Applicability: [TBD by executor]
- Repository evidence: [TBD by executor]
- Sub-steps executed: [TBD]
- Files changed: [TBD]
- Validation: build [TBD] | lint [TBD] | test [TBD]
- Final outcome: [TBD]

**[Continue per documented tasks]**

---

### Phase C: Error Recovery Loop (After All Phase C Tasks Complete)

> Run AFTER all Phase C tasks are marked [x].
> Purpose: Verify that errors recorded during Phase C are now resolved.

- [ ] Rerun: npm run build (should now pass)
- [ ] Rerun: npm run lint (must pass — 0 errors, vs baseline warnings)
- [ ] Rerun: npm run test (should pass, coverage at or above baseline)
- [ ] For each error recorded during Phase C: check if NOW fixed → update entry
- [ ] Remaining unfixed errors: document for manual fix, add to blockers

---

## Current Session Context

<!-- Updated continuously — helps resume across chat sessions -->
- Last executed step: [step name and outcome]
- Next planned step: [step name and dependencies]
- Open issues/blockers: [current blocking issues]
- Recent discoveries: [new information from documentation]

---

## Error Log Repository

<!-- Captured during execution — each build/lint/test failure -->

| Timestamp | Phase | Error (last 20 lines) | Root Cause | Fix Applied | Result |
|-----------|-------|-----------------------|------------|-------------|--------|
| [time] | [A/B/C] | [error output] | [cause] | [fix] | [resolved/pending] |

---

## Decision Log

<!-- Track all non-trivial choices made during migration -->

| Decision | Rationale | Alternatives Considered | Date |
|----------|-----------|------------------------|------|
| [what] | [why] | [other options] | [when] |

---

## Summary

**Start date:** [YYYY-MM-DD]
**End date:** [YYYY-MM-DD when complete]
**Total tasks:** [N] (Phase A: X, Phase C: Y)
**Completed:** [N]
**Skipped:** [N] (via skip~X by developer)

**Test coverage baseline:** [%] → **Final coverage:** [%]
**Lint warning baseline:** [N] → **Final lint warnings:** [N]

**Critical blockers:** [if any]

**Sign-off:** [Developer Name, Date]
