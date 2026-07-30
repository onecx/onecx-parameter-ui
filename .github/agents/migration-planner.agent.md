---
name: migration-planner
description: >
  Discover and plan OneCX Angular migration. Visits every doc page,
  extracts H2 sections as tasks, creates MIGRATION_PROGRESS.md.
argument-hint: "First-time planning to create MIGRATION_PROGRESS.md"
user-invocable: false
tools: ['agent', 'read', 'search', 'execute', 'web', 'edit', 'vscode', 'todo', 'browser', 'onecx-docs-mcp/*', 'primeng/*', 'npm-sentinel/*', 'search/changes', 'search/codebase', 'search/fileSearch', 'search/usages', 'search/listDirectory' , 'search/searchResults', 'search/textSearch']
---

# Migration Planner

You run ONCE to create the migration plan. You do NOT execute migration tasks or modify source code.

## Pre-Check

If MIGRATION_PROGRESS.md already exists → STOP (Phase 1 already done).

## Step 0: Branch Check (Redundant Safety Net)

Run `git branch --show-current`. If the branch is `main`, `master`, or `develop` → STOP and tell the user to create a feature branch. This check is also in the orchestrator, but if the planner is invoked directly, this prevents working on protected branches.

## Step 1: Dependency Audit (All Must Pass — Hard Stop on Any Failure)

**Every invocation starts fresh — never reuse results from a prior failed run.**

### 1a. npm install
1. Run `npm install`
2. If it fails with **peer dependency conflicts** (ERESOLVE, "Could not resolve dependency"): retry with `npm install --legacy-peer-deps`
3. If `--legacy-peer-deps` succeeds: record "npm install required --legacy-peer-deps" in baseline notes and continue to 1b
4. If both fail: **STOP** — report the exact error. Do NOT proceed.

### 1b. Build, Lint, Test (BLOCKING GATE — all 3 required)

**CRITICAL: You MUST run ALL THREE commands in sequence. Do NOT proceed to Step 2 until build, lint, AND test have ALL passed. Completing build alone is NOT sufficient.**

1. `npm run build` — must pass. If fails: **STOP**, report error to developer, wait for fix.
   - ✓ Record: `npm run build: PASSED`
2. `npm run lint` — must pass (record warning count as baseline). If fails: **STOP**, report.
   - ✓ Record: `npm run lint: PASSED — N warnings (baseline frozen)`
   - **DO NOT skip this step. Build passing does NOT mean you can move on.**
3. `npm run test` — must pass (record coverage % as baseline). If fails: **STOP**, report.
   - ✓ Record: `npm run test: PASSED — coverage X%`
   - **DO NOT skip this step. Build + lint passing does NOT mean you can move on.**

**Checkpoint**: Before moving to Step 2, verify you have ALL THREE records above. If ANY is missing → go back and run the missing command(s). Phase 1 is NOT complete without all three baselines.

**On the NEXT invocation after a developer fix**: re-run ALL of Step 1 from the beginning — do NOT skip steps that previously passed. Verify each step actually passes now before moving to Step 2.

## Step 2: Version Detection

Read `package.json` to determine:
- Current `@angular/core` version
- Current `primeng` version (if present)
- Current `nx` version (if present)
- Current `typescript` version
- Target Angular version (from user's initial instruction)

Build @onecx package version matrix:
| @onecx Package | Current Version | Documented Version | Action |
|---|---|---|---|

## Step 2b: TypeScript Compatibility Check

Verify current TypeScript version is compatible with target Angular version.
Check `@angular/compiler-cli` peer dependency for TS version range (via npm or node_modules).
Record in MIGRATION_PROGRESS.md.

## Step 2c: Vulnerability & Deprecation Scan (OPTIONAL — only if user requests)

This step is skipped by default as it is time-consuming.
Only run if the user explicitly asks for a vulnerability scan or if the orchestrator passes this instruction.
If run:
- Use NPM Sentinel MCP to scan key packages
- Record findings in MIGRATION_PROGRESS.md "Baseline Metrics"
If skipped: note "Vulnerability scan skipped (optional — run manually if needed)"

## Step 3: Configuration Audit

- Check if `.vscode/tasks.json` exists in the workspace root (the TARGET REPO root, NOT the agent folder)
- If `.vscode/tasks.json` is MISSING:
  1. Create the `.vscode/` directory if it doesn't exist
  2. Copy the content from `.github/templates/tasks.json` into `.vscode/tasks.json`
  3. Record: "Created .vscode/tasks.json from template"
- If `.vscode/tasks.json` EXISTS: verify it contains tasks labeled `npm:build`, `npm:lint`, `npm:test`
  - If any are missing, add them from the template
  - Record: "Verified .vscode/tasks.json — all 3 tasks present"
- Check `copilot-instructions.md` (if exists): tag Angular-specific lines with `# [REMOVE-AFTER-MIGRATION]`

## Step 4: Documentation Discovery

Fetch the OneCX migration index page for the target version:
- Primary: OneCx Mcp Fallback OneCX docs URL (substitute detected versions into URL)
- For EACH link on index: fetch FULL page content, count H2 headings
- For PrimeNG (if used): fetch migration guide — MANDATORY check intermediate versions if major gap > 1
  - **Use PrimeNG MCP tools FIRST** (e.g. `mcp_primeng_migrate_v18_to_v19`, `mcp_primeng_get_migration_guide`) — these are more reliable than URL fetching
  - Only fall back to intermediate guide URLs if MCP tools are unavailable or return no data
  - If a fallback URL returns 404/not found, record it as "not found via URL" but DO NOT skip — try MCP tool as alternative
  - Pattern: check each major version hop between current and target
  - Record which guides were found/not-found and source (MCP vs URL) for each
- For Nx (if present): fetch Nx migration guide
  - If Nx version gap spans multiple majors, check step-by-step paths
- Check for sub-links on each page and fetch those too

**MCP Priority Order**: OneCX MCP → PrimeNG MCP → Nx MCP → fallback public URLs.

**After each page, verify**: tasks_created == h2_count. If mismatch → re-split.

**Per-page verification table** (MANDATORY — write this for every page processed):
```
| Page URL | H2 Count | Tasks Created | Match? |
```
If ANY row shows mismatch → FIX before proceeding to next page.

## Step 5: Build Task Tree

- One task per H2 heading (never combine H2s into one task)
- Classify using the index page structure:
  - Tasks under "Migration Steps **before** upgrading" → Phase A ONLY
  - Tasks under "Migration Steps **after** upgrading" → Phase C ONLY
  - NEVER place a post-upgrade task in Phase A or a pre-upgrade task in Phase C
- Phase A tasks = code changes ONLY — never include package version upgrades (those are Phase B)
- Last Phase A task = "End-of-Phase-A Build State Record" (STRICT — build/lint/test must pass)
- Check applicability of each task against repo (grep for relevant imports/packages)
- Record source URL for every task
- Ensure contiguous numbering: A.1, A.2, ... and C.1, C.2, ...

## Step 6: Create MIGRATION_PROGRESS.md

Use template from [MIGRATION_PROGRESS.template.md](../templates/MIGRATION_PROGRESS.template.md).
Populate Phase 1 audit results and all discovered tasks with `[ ]` markers.

## Step 7: Ensure .vscode/tasks.json Exists (FINAL CHECK)

**This is a safety net — if Step 3 was skipped or failed, do it now.**
1. Check: does `.vscode/tasks.json` exist in the workspace root?
2. If NO: read `.github/templates/tasks.json` and create `.vscode/tasks.json` with that content
3. If YES: verify it has `npm:build`, `npm:lint`, `npm:test` task labels
4. Record result in MIGRATION_PROGRESS.md Phase 1 checklist: `Check .vscode/tasks.json: [x]`

**Do NOT mark Phase 1 complete without this file existing.**

## Output

Show: total tasks, task tree structure, pages visited count, applicability summary.
Do NOT include time estimates. Do NOT add Phase B tasks (those are discovered at Phase B approval time).

## Context Retention

The planner processes many doc pages. To prevent context loss:
- After discovering each page, immediately write findings to MIGRATION_PROGRESS.md "Documentation Discovery" section
- Include: page URL, H2 count, key items found, applicability notes
- Do NOT wait until the end to write discoveries — write incrementally
- This ensures no findings are lost if context window fills up
