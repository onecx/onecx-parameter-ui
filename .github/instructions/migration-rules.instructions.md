---
name: Migration Rules
description: Core rules for OneCX Angular migration agents — auto-injected into every agent
applyTo: '**'
---

# Migration Hard Rules

## State Management
- MIGRATION_PROGRESS.md is the ONLY source of truth — read it before every action
- Use only 3 markers: `[ ]` not started, `[x]` completed, `[-]` not applicable
- Update in-place (find exact task entry, replace that section) — never append to end
- Read the ENTIRE file before writing to it
- Task numbering must be contiguous (A.1, A.2, A.3 — no gaps)
- Parent tasks stay `[ ]` while any child task is `[ ]` — mark parent `[x]` ONLY when ALL children complete
- If target version conflicts with repo state (e.g. target Angular 19 but package.json says Angular 17) → STOP, ask user which state is correct — never guess

## Initialization Gates
- Migration requires a feature branch — never work on main, master, or develop
- Target version must be explicitly specified by the user
- `npm install`, `npm run build`, `npm run lint`, `npm run test` must ALL pass before proceeding
- If any baseline check fails, stop and report to developer — do not attempt fixes yourself

## Task Execution
- Executor handles exactly ONE `[ ]` task per spawn. Orchestrator decides whether to continue or stop based on stop conditions (see orchestrator agent).
- At the START of every executor invocation: read the version-specific data file (e.g. `migration-18-19.instructions.md`) — it contains URLs, version targets, and migration-path-specific rules that are NOT auto-injected
- Fetch and read the FULL source documentation page for every task before executing
- Never assume page content from its title — read the actual content
- Every H2 heading on a documentation page = one separate task (never combine)
- All bullet sub-items within an H2 = sub-steps of ONE task (execute all in sequence)
- Check repository evidence (grep/search) for EVERY item before deciding applicability
- **Search scope**: ALWAYS search the ENTIRE repository (all directories, all file types: `.ts`, `.html`, `.scss`, `.json`, `.js`, etc.) — NEVER limit searches to a single folder like `src/templates`. Use `grep -r` across the whole project root or equivalent full-repo search.
- Mark `[-]` not applicable ONLY when ALL items confirmed absent from **entire codebase** (not just one folder)
- If ANY item in a task applies → execute the task (do applicable parts, note the rest)
- Each sub-step in a doc section must be independently checked — a package not being installed does NOT mean template tags or code patterns from that task are absent. Check EVERY sub-step separately.
- When in doubt about applicability, default to must-have (safer than skipping)
- Tasks must come from fetched documentation only — never generate tasks from "best practices"
- Search local workspace for code patterns before using MCP
- Component replacement must be doc-driven: NEVER use hardcoded "never replace" lists — always fetch CURRENT docs and defer to what they say
- If docs are silent or contradictory about replacing a component → stop and ask, do not guess based on memory or previous runs

## Documentation Discovery
- Fetch FULL content of every link on the migration index page
- Count H2 headings per page — each becomes a separate task
- Check for sub-links on each page and fetch those too
- Verify after each page: tasks_created == h2_count (if mismatch, re-split)
- For PrimeNG: if major version gap > 1, MANDATORY check each intermediate migration guide per hop
  - Example: primeng@17 → primeng@19 requires checking v18 guide AND v19 guide
  - **Use PrimeNG MCP tools FIRST** (e.g. `mcp_primeng_migrate_v18_to_v19`, `mcp_primeng_get_migration_guide`) — these are more reliable than URL fetching
  - For intermediate version URLs, use the subdomain pattern: `https://v{N}.primeng.org/guides/migration` (note: `https://primeng.org/migration/v{N}` may 404 for older versions)
  - Only fall back to URLs if MCP tools are unavailable or return no data
  - If a fallback URL returns 404/not found, record it as "not found via URL" but DO NOT skip — try MCP tool or subdomain URL as alternative
  - Record: "v18 guide: found/not-found (source: MCP/URL/subdomain) | v19 guide: found/not-found (source: MCP/URL/subdomain)"

## Task Classification (Phase A vs Phase C)
- The migration index page clearly separates "Migration Steps before upgrading" (Phase A) and "Migration Steps after upgrading" (Phase C)
- Tasks listed under the PRE-upgrade section go to Phase A ONLY
- Tasks listed under the POST-upgrade section go to Phase C ONLY
- NEVER place a post-upgrade task in Phase A or a pre-upgrade task in Phase C
- If the index page structure is ambiguous, fetch the full page and look for section headings like "before upgrading" / "after upgrading" to determine classification

## Validation Rules
- ALL phases (A, B, C): run `npm run build` → `npm run lint` → `npm run test` after every task. Phase A changes are made against the CURRENT Angular version — the build must pass.
- Try VS Code tasks (npm:build, npm:lint, npm:test) first; if unavailable, fall back to terminal — always log which method was used
- Read COMPLETE terminal output — return codes alone are insufficient
- If build fails: capture error, fix in same invocation, rerun before proceeding to lint
- If lint fails: capture, fix, rerun before proceeding to test — 0 errors, 0 NEW warnings vs baseline
- If test fails: capture, fix, rerun until passing
- Never mark `[x]` without all evidence fields filled and validation passed
- Phase B: transitional build/test failures allowed ONLY if every error maps to a documented Phase C task
- Lint must ALWAYS pass, even in Phase B and Phase C

## Phase Boundaries
- Phase 1 → A: automatic after planning completes
- Phase A → B: requires explicit developer approval (mandatory gate)
- Phase B → C: requires developer confirmation after stable build/test
- Phase 1 (planner) never executes code changes — discovery and planning only

## No-Defer Rule
- You CANNOT defer any sub-step to a later phase or future invocation
- If a task requires a package incompatible with the current Angular version: leave task `[ ]`, reclassify entire task to the correct phase (e.g., Phase C) — do NOT partially execute with workarounds like `CUSTOM_ELEMENTS_SCHEMA`
- Before installing any package: run `npm view <pkg>@<ver> peerDependencies` — if incompatible, reclassify; if compatible, install it now
- If `npm install` breaks the dependency tree: revert immediately (remove from package.json, delete lock file, rerun `npm install`), then reclassify

## Error Handling
- Errors during execution are YOUR job to fix in the SAME invocation — never defer
- Error retry limit: attempt up to 3 different approaches per error — after 3 failures, escalate to developer with full attempt log
- Log-based debugging: capture the **last 20 lines** of error output — never summarize failures, copy the actual output
- Before declaring an import/API unresolvable:
  1. `grep -r "Name" node_modules/@onecx/ --include="*.ts" -l`
  2. Search `v5-libs/libs/` or `v6-libs/libs/` source
  3. Read `public_api.ts` or `index.ts` of found package
  4. Check `package.json` exports field
  Only after all 4 return nothing → escalate to user with full evidence
- Complex tasks: NEVER skip a task because it's complex — break it into sub-steps and execute methodically
- node_modules CHANGELOGs: Check `node_modules/<package>/CHANGELOG.md` as a secondary documentation source when MCP and fallback URLs lack detail

## Verification Checklist (Before Marking [x])
- Before marking ANY task `[x]`, verify ALL sub-steps are complete
- For component migration: old import removed (grep proof), new import added, template updated, API matches, CSS updated if needed, no duplicates in bootstrap
- After migration, run `grep -r` for the OLD import/tag across the entire codebase — if any remain, the task is NOT complete
- Provider deduplication: if a provider (e.g. `REMOTE_COMPONENT_CONFIG`) exists in both `bootstrap.ts` and `component.ts`, keep it ONLY in `bootstrap.ts` — remove from `component.ts`
- If ANY sub-step is unchecked → task stays `[ ]` not started — note which parts are incomplete
- Compare changes against a working example in repo if one exists
- ONLY mark `[x]` when ALL sub-steps verified AND validation passed

## MCP Tool Usage
- When an MCP tool returns code examples, ALWAYS verify the returned code is relevant to your SPECIFIC query before applying it
- If the MCP response appears unrelated to the query (e.g. querying a component replacement but getting unrelated code), DISCARD the response and search local workspace or docs instead
- NEVER blindly apply code fragments from MCP responses without checking they match the component/service you are migrating
- Prefer local workspace searches and official migration docs over MCP for component-level code patterns

## Build Failure Discipline
- If a build fails after applying a valid migration step, DO NOT undo the migration change
- Instead: diagnose whether the error is caused by a LATER migration step that hasn't been applied yet
- Pre-migration (Phase A) changes should build with the CURRENT Angular version — if they don't, fix the error without reverting the migration
- Post-migration (Phase C) changes may cause transitional failures — record the error and check if a later Phase C task resolves it

## CSS and File Scope
- NEVER modify files in other repositories (e.g. shell-ui, workspace-ui) to fix issues in YOUR application
- CSS fixes must be in YOUR application's component styles or global styles — not in library files or other microfrontends
- If a CSS issue seems to require library changes, document it and escalate to the developer

## Test Strategy
- During component migration: focus on getting the component working first, then fix tests
- Do not let test failures block component migration work — record test failures, complete the migration, then fix tests
- After ALL migration tasks complete, run full test suite and fix remaining failures

## Decision Protocol
- ASK the user for: branch issues, doc conflicts, version conflicts, phase gates, risky adaptations
- DO NOT ask for: routine searches, applicability checks, next task routing, whether to read docs
- If docs are ambiguous: stop, document the ambiguity, ask ONE concise question
- Only the orchestrator routes to other agents — agents never call each other directly
