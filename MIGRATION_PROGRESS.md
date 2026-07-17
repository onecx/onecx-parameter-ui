# Migration Progress: OneCX Angular 18 → 19 → 20

Date Started: **2026-07-16**
Repository: **/home/suhail/projects/migration/onecx-parameter-ui**
Git Branch: **feat/DIGIHUB-374758/angular-upgrade-version-20**
Status: **In Progress — Phase 1 (Planning) complete, Angular 18→19 leg**

---

## Custom Rules & Constraints

<!-- Rules from migration-custom-user.instructions.md and any developer-specified overrides -->

- Final target is Angular 20. This requires TWO hops: **18→19** (this document's active leg) then **19→20** (planned separately once this leg's Phase C is signed off — see `.github/instructions/migration-19-20.instructions.md`).
- Task granularity convention (established by `.github/instructions/migration-18-19.instructions.md` "Task-Specific Applicability Rules", itself derived from verified real-world reference migrations): **one task per linked documentation page**, NOT one task per raw H2 heading within a page. Multi-H2 pages (e.g. "Update Component Imports" has 4 H2 subsections) are kept as ONE task with each H2/bullet group checked and recorded as an independent sub-step. This matches the task list already implied by the project's own instructions file and the verified reference repo `ct-management-page`. Deviation from the generic "1 H2 = 1 task" default rule is intentional and documented here per the ambiguity-resolution protocol.
- Reference repos are for verification/comparison ONLY (not a source of tasks): `/home/suhail/projects/titans/ct-management-page` (Angular 18→19 + OneCX 5→6, DIGIHUB-341488) and `/home/suhail/projects/gandalf/supplier-rules-regular-page` (Angular 19→20 + OneCX 6→7, DIGIHUB-370710).
- Workspace is a plain Angular CLI project (no `nx.json`/`workspace.json` present) — the official Angular Update Guide (`https://angular.dev/update-guide?v=18.0-19.0&l=3`) governs Phase B, not the NX-specific upgrade page.
- Anti-patterns from `migration-custom-user.instructions.md` apply throughout (no halfway completion, no CUSTOM_ELEMENTS_SCHEMA workarounds, no reverting correct changes on build failure, etc.)

---

## Documentation Discovery

<!-- Comprehensive map of all documentation pages visited during Phase 1 -->

| Page URL                                                                                                                                                                                     | Title                                                             | H2 Count                                                                                                                                                                                           | Tasks Created                                                                        | Match?                    |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------- |
| [.../angular-19/index.html](https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/index.html)                                                        | Migrate OneCX App from Angular 18 to Angular 19                   | 6 (Overview, Prerequisites, AI Driven Migration Assistance, Migration Steps before upgrading, Upgrade to Angular 19, Migration Steps after upgrading)                                              | 0 (index page only — links to real task pages below)                                 | N/A (index)               |
| [.../remove-keycloak-auth.html](https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/remove-keycloak-auth.html)                                     | Remove @onecx/keycloak-auth                                       | 2 (Update module imports, Update Packages)                                                                                                                                                         | 1 (A.1)                                                                              | ✓ (page-level convention) |
| [.../update-component-imports.html](https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/update-component-imports.html)                             | Update Component Imports                                          | 4 (Components Moved to Different Libraries, Components/Services Removed Without Replacement, Replaced Components and Functions in the Same Library, Components now Available as Remote Components) | 1 (A.2)                                                                              | ✓ (page-level convention) |
| [.../switch-to-new-components.html](https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/switch-to-new-components.html)                             | Replace Removed Components                                        | 0 (pure link hub, no content H2s)                                                                                                                                                                  | 0 (hub — links to 4 real task pages below)                                           | N/A (hub)                 |
| [.../switch-to-interactive-data-view.html](https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/switch-to-interactive-data-view.html)               | Replace DataViewControlsComponent                                 | 3 (Code Changes, Properties Mapping, Additional Notes)                                                                                                                                             | 1 (A.3)                                                                              | ✓                         |
| [.../switch-to-ocx-content-or-container.html](https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/switch-to-ocx-content-or-container.html)         | Replace PageContentComponent                                      | 2 (Code Changes, Properties Mapping)                                                                                                                                                               | 1 (A.4)                                                                              | ✓                         |
| [.../switch-to-search-header.html](https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/switch-to-search-header.html)                               | Replace SearchCriteriaComponent                                   | 2 (Code Changes, Properties Mapping)                                                                                                                                                               | 1 (A.5)                                                                              | ✓                         |
| [.../switch-to-ocx-dialog-inline.html](https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/switch-to-ocx-dialog-inline.html)                       | Replace ButtonDialogComponent                                     | 2 (Code Changes, Properties Mapping)                                                                                                                                                               | 1 (A.6)                                                                              | ✓                         |
| [.../adjust-packages-in-webpack-config.html](https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/adjust-packages-in-webpack-config.html)           | Adjust Packages in Webpack Config                                 | 1 (Update configuration)                                                                                                                                                                           | 1 (A.7)                                                                              | ✓                         |
| [.../remove-menuservice.html](https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/remove-menuservice.html)                                         | Remove MenuService                                                | 0 (single paragraph, no H2)                                                                                                                                                                        | 1 (A.8)                                                                              | ✓ (page-level convention) |
| [.../update-translations.html](https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/update-translations.html)                                       | Update Translation Path Factories                                 | 2 (Update Imports, Configure Translation Providers for Remote Components)                                                                                                                          | 1 (A.9)                                                                              | ✓                         |
| [.../update-packages.html](https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/update-packages.html)                                               | Required Package Updates                                          | 1 (Installation Commands)                                                                                                                                                                          | 1 (C.1)                                                                              | ✓                         |
| [.../update-filtertype-value.html](https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/update-filtertype-value.html)                               | Update FilterType Value                                           | 1 (Update values)                                                                                                                                                                                  | 1 (C.2)                                                                              | ✓                         |
| [.../update-configuration-service-usage.html](https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/update-configuration-service-usage.html)         | Update ConfigurationService Usage                                 | 1 (Update the following methods)                                                                                                                                                                   | 1 (C.3)                                                                              | ✓                         |
| [.../update-component-import-post-migration.html](https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/update-component-import-post-migration.html) | Update Component Imports Post Migration                           | 1 (Components Moved to Different Libraries)                                                                                                                                                        | 1 (C.4)                                                                              | ✓                         |
| [.../update-portal-api-configuration.html](https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/update-portal-api-configuration.html)               | Update Portal API Configuration object parameters                 | 0 (single H3-level page, no H2)                                                                                                                                                                    | 1 (C.5)                                                                              | ✓ (page-level convention) |
| [.../remove-portal-layout-styles.html](https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/remove-portal-layout-styles.html)                       | Remove @onecx/portal-layout-styles                                | 3 (Uninstall package, Update style imports/references, Expose styles.css if required)                                                                                                              | 1 (C.6)                                                                              | ✓                         |
| [.../remove-add-initialize-module-guard.html](https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/remove-add-initialize-module-guard.html)         | Remove addInitializeModuleGuard()                                 | 1 (Update imports and providers)                                                                                                                                                                   | 1 (C.7)                                                                              | ✓                         |
| [.../remove-portal-core-module.html](https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/remove-portal-core-module.html)                           | Remove PortalCoreModule                                           | 2 (Update imports, Remove '@onecx/portal-integration-angular')                                                                                                                                     | 1 (C.8)                                                                              | ✓                         |
| [.../adjust-standalone-mode.html](https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/adjust-standalone-mode.html)                                 | Adjust Standalone Mode                                            | 2 (Update Imports and Providers, Uninstall Deprecated Package)                                                                                                                                     | 1 (C.9)                                                                              | ✓                         |
| [.../update-base-url.html](https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/update-base-url.html)                                               | Replace BASE_URL injection token                                  | 2 (Update imports, Update component code)                                                                                                                                                          | 1 (C.10)                                                                             | ✓                         |
| [.../update-theme-service.html](https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/update-theme-service.html)                                     | Update Theme Service usage                                        | 1 (Remove deprecated ThemeService members)                                                                                                                                                         | 1 (C.11)                                                                             | ✓                         |
| [.../add-required-plugin-to-primeng.html](https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/add-required-plugin-to-primeng.html)                 | Add Webpack Plugin for PrimeNG                                    | 1 (Install and Configure the Webpack Plugin) — fetched via OneCX MCP fallback (direct URL fetch failed twice — "Failed to extract meaningful content")                                             | 1 (C.12)                                                                             | ✓                         |
| [.../add-angular-material-plugin.html](https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/add-angular-material-plugin.html)                       | Add Webpack Plugin for Angular Material                           | 1 (Install and Configure Webpack Plugin)                                                                                                                                                           | 1 (C.13)                                                                             | ✓                         |
| [.../provide-theme-config.html](https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/provide-theme-config.html)                                     | Provide ThemeConfig                                               | 3 (Microfrontend theme configuration, Remote components theme configuration, Provide theme overrides)                                                                                              | 1 (C.14)                                                                             | ✓                         |
| [.../update-webpack-config.html](https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/update-webpack-config.html)                                   | Update Webpack Config to Use Dynamic Shared Entries               | 1 (Update webpack.config.js)                                                                                                                                                                       | 1 (C.15)                                                                             | ✓                         |
| PrimeNG MCP `mcp_primeng_migrate_v18_to_v19`                                                                                                                                                 | v18→v19 breaking changes (design tokens, Angular 17+ requirement) | N/A (MCP summary, not an H2 page)                                                                                                                                                                  | Folded into C.1 (package update) + C.12 (PrimeNG webpack plugin) applicability notes | N/A                       |

**Secondary links found:** "Replace Removed Components" (switch-to-new-components.html) is a pure hub page linking to 4 sub-task pages (all fetched and listed above as A.3–A.6). No other undiscovered sub-links found on any page.

**Pages visited: 26** (1 index + 10 Phase-A-cluster pages + 15 Phase-C pages) + 1 MCP tool call (PrimeNG).

---

## Dependency Analysis

| @onecx Package                       | Current Version | Documented Version                                                               | Action                                                                                                  |
| ------------------------------------ | --------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| @onecx/accelerator                   | ^5.47.5         | ^6.x.y (resolve latest stable via `npm view`)                                    | update (Phase B)                                                                                        |
| @onecx/angular-accelerator           | ^5.47.5         | ^6.x.y                                                                           | update (Phase B)                                                                                        |
| @onecx/angular-auth                  | ^5.47.5         | ^6.x.y                                                                           | update (Phase B)                                                                                        |
| @onecx/angular-integration-interface | ^5.47.5         | ^6.x.y                                                                           | update (Phase B)                                                                                        |
| @onecx/angular-remote-components     | ^5.47.5         | ^6.x.y                                                                           | update (Phase B)                                                                                        |
| @onecx/angular-testing               | ^5.47.5         | ^6.x.y                                                                           | update (Phase B)                                                                                        |
| @onecx/angular-utils                 | ^5.47.5         | ^6.x.y                                                                           | update (Phase B)                                                                                        |
| @onecx/angular-webcomponents         | ^5.47.5         | ^6.x.y                                                                           | update (Phase B)                                                                                        |
| @onecx/integration-interface         | ^5.47.5         | ^6.x.y                                                                           | update (Phase B)                                                                                        |
| @onecx/keycloak-auth                 | ^5.47.5         | removed in v6                                                                    | uninstall (Phase A task A.1)                                                                            |
| @onecx/portal-integration-angular    | ^5.47.5         | removed in v6                                                                    | uninstall (Phase C task C.8, after all imports migrated)                                                |
| @onecx/portal-layout-styles          | ^5.47.5         | removed in v6                                                                    | uninstall (Phase C task C.6)                                                                            |
| @onecx/angular-standalone-shell      | not present     | new package, needed only if `<ocx-portal-viewport>` used                         | install (Phase C task C.9) — **APPLIES**: `<ocx-portal-viewport>` found in `src/app/app.component.html` |
| @onecx/shell-core                    | not present     | needed if PortalFooterComponent/HeaderComponent/PortalViewportComponent imported | not applicable — 0 matches found in repo                                                                |
| primeng                              | ^17.18.11       | ^19.0.0                                                                          | update (Phase B/C.1)                                                                                    |
| primeicons                           | ^7.0.0          | ^7.0.0                                                                           | already current                                                                                         |
| primeflex                            | ^3.3.1          | ^4.0.0                                                                           | update (Phase C.1)                                                                                      |
| @ngx-translate/core                  | ^15.0.0         | ^16.0.0                                                                          | update (Phase C.1)                                                                                      |
| @ngx-translate/http-loader           | ^8.0.0          | ^8.0.0                                                                           | already current                                                                                         |
| ngx-build-plus                       | ^18.0.0         | ^19.0.0                                                                          | update (Phase C.1)                                                                                      |
| keycloak-angular                     | ^16.1.0         | removed alongside @onecx/keycloak-auth (unless still used directly)              | evaluate during A.1 execution                                                                           |

- **TypeScript**: current `5.5.4` → `@angular/compiler-cli@19.2.x` requires `>=5.5 <5.9` — **already compatible, no TS bump strictly required for 19.2.x**, though later 19.x patch/typescript alignment should be re-verified at Phase B.
- **Peer dependency conflicts**: none found yet (not attempted `ng update` — that happens at Phase B).
- **Nx**: not applicable — this is a plain Angular CLI workspace (no `nx.json`/`workspace.json`), confirmed via directory listing.

---

## Phase 1: Preparation & Planning (STRICT — all must pass or STOP)

| Task                             | Status | Notes                                                                                                                                                                                         |
| -------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| npm install fresh baseline       | [x]    | Passed. 1740 packages audited, up to date. 112 pre-existing vulnerabilities noted (not blocking, not in scope for this migration).                                                            |
| npm run build baseline           | [x]    | Passed. Build completed in ~42s. 2 pre-existing warnings (`app.component.ts` / `app.module.ts` "part of TypeScript compilation but unused" — cosmetic, pre-existing, unrelated to migration). |
| npm run lint baseline            | [x]    | Passed. "All files pass linting." 0 warnings — this is the frozen baseline for all Phase A/C comparisons.                                                                                     |
| npm run test baseline            | [x]    | Passed. 147 SUCCESS (1 skipped), 100% statement/branch/function/line coverage.                                                                                                                |
| TypeScript compatibility check   | [x]    | TS `5.5.4` satisfies `@angular/compiler-cli@19.2.x` peer requirement (`>=5.5 <5.9`). No blocking TS upgrade needed for the 19 leg.                                                            |
| Check .vscode/tasks.json         | [x]    | Was MISSING — created from `.github/templates/tasks.json` with `npm:build`, `npm:lint`, `npm:test` tasks.                                                                                     |
| Check copilot-instructions.md    | [-]    | File does not exist in this repo — not applicable.                                                                                                                                            |
| Vulnerability & deprecation scan | [-]    | Skipped (optional, not requested by developer).                                                                                                                                               |
| Discover OneCX docs              | [x]    | Index page + all 25 linked/sub-linked pages fetched in full (see Documentation Discovery table).                                                                                              |
| Discover PrimeNG docs            | [x]    | Used `mcp_primeng_migrate_v18_to_v19` MCP tool (primary source per rules). Confirms PrimeNG 19 requires Angular 17+, new design-token theming, component API changes for tree-shaking.        |
| Discover Nx migration docs       | [-]    | Not applicable — workspace is plain Angular CLI, no Nx.                                                                                                                                       |
| Build complete task tree         | [x]    | 9 Phase A tasks + 1 build-state-record task + 15 Phase C tasks = 25 total. Verification table above shows page-level task granularity (see Custom Rules for rationale).                       |
| Create MIGRATION_PROGRESS.md     | [x]    | This file.                                                                                                                                                                                    |

**Phase 1 Baseline Records:**

- npm install: pass
- npm run build: pass
- npm run lint: pass — 0 warnings (frozen baseline)
- npm run test: pass — coverage 100% (statements/branches/functions/lines)
- Lint warning baseline: 0 warnings

**Phase 1 Summary:**

- [x] All audits complete
- [x] Documentation fully expanded (no assumptions from headlines — every linked page fetched in full)
- [x] Task tree created and reviewed
- [x] Ready to start Phase A

---

## Phase A: Pre-Migration Code Changes

> Execute one task per invocation. Validation order: build → lint → test.
> Phase A tasks = pre-upgrade code changes ONLY (no package version upgrades here — those are Phase B).

### Phase A Tasks (discovered by planner)

**[A.1]. Remove @onecx/keycloak-auth**

- [x] complete
- Source page (fetched this invocation): https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/remove-keycloak-auth.html
- Applicability: **must-have**
- Repository evidence: `KeycloakAuthModule` imported and used in [src/app/app.module.ts](src/app/app.module.ts) (lines 9, 34); `@onecx/keycloak-auth` and `keycloak-angular` present in [package.json](package.json) (lines 64, 69); `@onecx/keycloak-auth` referenced in [webpack.config.js](webpack.config.js) shared config (line 30). Fresh full-repo grep for `KeycloakAuthModule|keycloak-angular|keycloak-js|@onecx/keycloak-auth|KeycloakService|KeycloakEvent` confirmed only `src/app/app.module.ts` used `KeycloakAuthModule` directly in source code (other matches were in package.json/package-lock.json/instructions files only, no direct `keycloak-angular`/`keycloak-js` API usage in `src/`).
- Sub-steps executed:
  1. Install `@onecx/angular-auth` — **not-applicable**, already present in [package.json](package.json) at `^5.47.5` (no install needed).
  2. Replace `KeycloakAuthModule` import from `@onecx/keycloak-auth` with `AngularAuthModule` from `@onecx/angular-auth` — done in [src/app/app.module.ts](src/app/app.module.ts).
  3. Replace `KeycloakAuthModule` in the `@NgModule` imports array with `AngularAuthModule` — done in [src/app/app.module.ts](src/app/app.module.ts).
  4. Uninstall `@onecx/keycloak-auth` and `keycloak-angular` — done via `npm uninstall --save @onecx/keycloak-auth keycloak-angular`.
  5. keycloak-js note — not-applicable (keycloak-js was never a direct dependency; no direct usage found).
  6. Edge-case cleanup (not from this doc page, but required for the build to succeed after uninstall): removed the now-dangling `'@onecx/keycloak-auth': { requiredVersion: 'auto', includeSecondaries: true }` shared entry in [webpack.config.js](webpack.config.js) Module Federation `share({...})` block — module federation would otherwise try to share a package no longer in `node_modules`.
- Files changed: [src/app/app.module.ts](src/app/app.module.ts), [webpack.config.js](webpack.config.js), [package.json](package.json), package-lock.json
- Validation: build **PASS** (only pre-existing 2 baseline warnings, unrelated) | lint **PASS** (0 warnings, matches baseline) | test **PASS** (147 SUCCESS / 1 skipped, matches baseline; coverage 100%/100%/100%/100%, matches baseline)
- Final outcome: **success**
- Edge cases: webpack.config.js `share()` cleanup was necessary but not explicitly documented on the doc page — done to prevent module federation build failure from referencing an uninstalled package. `@onecx/angular-auth` was already a dependency, so no fresh install was required for this task.

**[A.2]. Update Component Imports**

- [x] complete
- Source page (fetched this invocation): https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/update-component-imports.html
- Applicability: **must-have (partial)** — only Section 2 of 4 "Moved to Different Libraries" sub-sections applies; all other sub-sections not applicable
- Repository evidence (fresh full-repo grep this invocation for every listed symbol across all 4 "moved" sub-sections, all 3 "removed without replacement" sub-sections, both "replaced in same library" items, and all 3 "remote component" groups — single combined regex covering `ColumnGroupSelectionComponent|CustomGroupColumnSelectorComponent|DataLayoutSelectionComponent|DataListGridComponent|DataListGridSortingComponent|DataTableComponent|DataViewComponent|DiagramComponent|FilterViewComponent|GroupByCountDiagramComponent|InteractiveDataViewComponent|LifecycleComponent|PageHeaderComponent|SearchHeaderComponent|AdvancedDirective|IfBreakpointDirective|IfPermissionDirective|SrcDirective|TooltipOnOverflowDirective|HasPermissionChecker|HAS_PERMISSION_CHECKER|AlwaysGrantPermissionChecker|TranslationCacheService|CachingTranslateLoader|TranslateCombinedLoader|DataLoadingErrorComponent|IAuthService|AUTH_SERVICE|HelpPageAPIService|UserProfileAPIService|AppInlineProfileComponent|AnnouncementsApiService|provideAppServiceMock|filterForOnlyQueryParamsChanged|filterForQueryParamsChanged|PortalMenuComponent|PortalMenuHorizontalComponent|UserAvatarComponent|PortalFooterComponent|HeaderComponent|PortalViewportComponent|PortalPageComponent` returned **0 matches in `src/`** (only unrelated hits in `.github/instructions/*.md`). Section 2 (`PortalPageComponent`, `PortalApiConfiguration`): `PortalPageComponent` — 0 matches; `PortalApiConfiguration` — **FOUND**, imported from `@onecx/portal-integration-angular` and constructed in [src/app/onecx-parameter-remote.module.ts](src/app/onecx-parameter-remote.module.ts) (`apiConfigProvider` function). Verified via `node_modules/@onecx/angular-utils/index.d.ts` that the currently-installed v5.47.5 package ALREADY exports `PortalApiConfiguration` (from `./lib/utils/portal-api-configuration.utils`), so the import can be safely switched now in Phase A without waiting for the Phase B major version bump.
- Sub-steps executed:
  1. Section 1 (→ `@onecx/angular-accelerator`) — not-found, no matching symbols anywhere in `src/`.
  2. Section 2 (→ `@onecx/angular-utils`) — done: `PortalApiConfiguration` import moved from `@onecx/portal-integration-angular` to `@onecx/angular-utils` in [src/app/onecx-parameter-remote.module.ts](src/app/onecx-parameter-remote.module.ts) (merged into the existing `@onecx/angular-utils` import statement). `PortalPageComponent` — not-applicable, not used.
  3. Section 3 (→ `@onecx/shell-core`) — not-found, no matching symbols; `@onecx/shell-core` install not required.
  4. Section 4 (`@onecx/angular-accelerator` → `@onecx/angular-utils`) — not-found, no matching symbols.
  5. "Removed Without Replacement" (all 3 sub-sections) — not-found, no matching symbols.
  6. "Replaced Components and Functions in Same Library" (both items) — not-found, no matching symbols.
  7. "Remote Components" (onecx-help-ui, onecx-announcement-ui, onecx-workspace-ui groups) — not-found, no matching symbols.
- Files changed: [src/app/onecx-parameter-remote.module.ts](src/app/onecx-parameter-remote.module.ts)
- Validation: build **PASS** (only pre-existing 2 baseline warnings) | lint **PASS** (0 warnings, matches baseline) | test **PASS** (147 SUCCESS / 1 skipped; coverage 100%/100%/100%/100%, matches baseline)
- Final outcome: **success**
- Edge cases: `Column`, `DataViewControlTranslations`, `Action`, `PortalDialogService` imports flagged in the planner note were re-checked — none of them appear as literal strings anywhere in this doc's sub-sections, confirming they belong to a different doc page (they are addressed separately in Phase C task C.4 "Update Component Imports Post Migration", which explicitly lists `PortalDialogService` and `Action`). No changes made to those imports in this task.

**[A.3]. Replace DataViewControlsComponent with InteractiveDataViewComponent**

- [x] completed
- Source page: https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/switch-to-interactive-data-view.html (linked from "Replace Removed Components" hub)
- Applicability: **must-have**
- Repository evidence: `<ocx-data-view-controls>` found wrapping `<p-table>` in [src/app/parameter/parameter-search/parameter-search.component.html](src/app/parameter/parameter-search/parameter-search.component.html) (lines 58–66) and in [src/app/parameter/usage-search/usage-search.component.html](src/app/parameter/usage-search/usage-search.component.html) (lines 59–67); matching SCSS selectors in both components' `.scss` files.
- Sub-steps executed:
  1. **parameter-search.component.ts**: replaced `Column`/`ExtendedColumn` (from `@onecx/portal-integration-angular`) with `DataTableColumn` (from `@onecx/angular-accelerator`); rewrote `columns` array using `id`/`nameKey`/`columnType` (`ColumnType.STRING`/`DATE`)/`sortable`/`filterable`/`filterType` (`FilterType.EQUAL`) instead of the old `field`/`header`/`translationPrefix`/`active`/`css` shape; removed `filteredColumns`, `onColumnsChange`, `@ViewChild('dataTable') dataTable: Table`, `dataViewControlsTranslations$`, and `prepareDialogTranslations()` (translations now handled internally by `InteractiveDataViewComponent`); added `additionalActions: DataAction[]` (copy/usage row actions, replacing per-row template buttons) and `filters: Filter[]`; changed `onFilterChange(event: string)` → `onFilterChange(filters: Filter[])`; removed `Event` param from `onDelete`/`onDetailUsage` (row click propagation now handled by the new component); `ExtendedParameter` now requires `id: string` and `imagePath: string` (added `id: p.id ?? ''` and `imagePath: ''` in the `onSearch` map pipeline).
  2. **parameter-search.component.html**: replaced `<ocx-data-view-controls>` + `<p-table>` markup (325 lines) with `<ocx-interactive-data-view>` bound to `columns`/`filters`/`additionalActions`.
  3. **parameter-search.component.scss**: removed obsolete `::ng-deep` / data-view-controls selectors (9 lines).
  4. **usage-search.component.ts / .html / .scss**: identical pattern applied — `columns: DataTableColumn[]` rewrite, `additionalActions`/`filters` added, `filteredColumns`/`onColumnsChange`/`dataTable`/`dataViewControlsTranslations$`/`prepareDialogTranslations()` removed, `onFilterChange(filters: Filter[])`, `ExtendedHistory` extended with `imagePath: string`.
  5. **usage-detail.component.ts**: cascading fix — added `imagePath: ''` to the `ExtendedHistory` object built in its own `map` pipeline (same shared type now requires the field).
  6. **Spec files** (parameter-search, usage-search, usage-detail, usage-detail-criteria): updated to match new component API (`DataTableColumn` mock shape, `additionalActions`/`filters` instead of `filteredColumns`/`dataTable` spy/`onColumnsChange`, single-argument `onDelete`/`onDetailUsage`/`onUsage` calls instead of `(event, item)`), plus one added mock parameter (`paramRespData[7]`, no `id` field) in `parameter-search.component.spec.ts` to restore branch coverage on the `p.id ?? ''` fallback that the rewritten spec no longer exercised.
- Files changed: [src/app/parameter/parameter-search/parameter-search.component.ts](src/app/parameter/parameter-search/parameter-search.component.ts), [src/app/parameter/parameter-search/parameter-search.component.html](src/app/parameter/parameter-search/parameter-search.component.html), [src/app/parameter/parameter-search/parameter-search.component.scss](src/app/parameter/parameter-search/parameter-search.component.scss), [src/app/parameter/parameter-search/parameter-search.component.spec.ts](src/app/parameter/parameter-search/parameter-search.component.spec.ts), [src/app/parameter/usage-search/usage-search.component.ts](src/app/parameter/usage-search/usage-search.component.ts), [src/app/parameter/usage-search/usage-search.component.html](src/app/parameter/usage-search/usage-search.component.html), [src/app/parameter/usage-search/usage-search.component.scss](src/app/parameter/usage-search/usage-search.component.scss), [src/app/parameter/usage-search/usage-search.component.spec.ts](src/app/parameter/usage-search/usage-search.component.spec.ts), [src/app/parameter/usage-detail/usage-detail.component.ts](src/app/parameter/usage-detail/usage-detail.component.ts), [src/app/parameter/usage-detail/usage-detail.component.spec.ts](src/app/parameter/usage-detail/usage-detail.component.spec.ts), [src/app/parameter/usage-detail/usage-detail-criteria/usage-detail-criteria.component.spec.ts](src/app/parameter/usage-detail/usage-detail-criteria/usage-detail-criteria.component.spec.ts)
- Validation: build **PASS** (only pre-existing 2 baseline warnings) | lint **PASS** (0 warnings, matches baseline) | test **PASS** (146 SUCCESS / 1 skipped, 147 total — matches baseline count; coverage 100%/100%/100%/100%, matches baseline after adding the missing-`id` mock case)
- Final outcome: **success**
- Edge cases: after the initial pass, branch coverage regressed to 99.52% (210/211) because the rewritten `parameter-search.component.spec.ts` mock data (`paramRespData`) no longer included a parameter without an `id`, leaving the `p.id ?? ''` fallback branch (introduced by the new `ExtendedParameter.id: string` requirement) uncovered. Fixed by adding an 8th mock entry with no `id` field and a corresponding expected `id: ''` in `parameterData` — full 100%/100%/100%/100% coverage restored and independently re-verified via direct `npm run build`/`npm run lint`/`npm run test:ci` runs (not subagent self-report).

**[A.4]. Replace PageContentComponent with OcxContentComponent/OcxContentContainerComponent**

- [x] complete
- Source page (fetched this invocation, full content): https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/switch-to-ocx-content-or-container.html — "In OneCX v6: Replace `PageContentComponent` with `OcxContentComponent` when it has title and styleClass; replace with `OcxContentContainerComponent` when used for grouping multiple content sections with layout options." Code Changes section: remove `PageContentComponent` from `@onecx/portal-integration-angular`; add `OcxContentComponent`/`OcxContentContainerComponent` from `@onecx/angular-accelerator`; replace `<ocx-page-content>` with `<ocx-content>` (single sections) or `<ocx-content-container>` (grouping); migrate input properties per mapping tables. Properties Mapping: `PageContentComponent.styleClass` → `OcxContentComponent.styleClass` (unchanged) + new optional `title`; for container: new optional `layout` ('vertical'|'horizontal', default vertical) and `breakpoint` ('sm'|'md'|'lg'|'xl', default md).
- Applicability: **must-have**
- Repository evidence: Fresh full-repo grep this invocation for `ocx-page-content|PageContentComponent` (all file types, entire repo) returned exactly 4 matches in 2 files — [src/app/parameter/parameter-search/parameter-search.component.html](src/app/parameter/parameter-search/parameter-search.component.html) (lines 20, 160 — current line numbers after A.3 rewrite, not the stale 20/305 from planning) and [src/app/parameter/usage-search/usage-search.component.html](src/app/parameter/usage-search/usage-search.component.html) (lines 21, 142 — current after A.3 rewrite, not stale 21/245). No other files anywhere in the repo (checked `usage-detail`, `usage-detail-criteria`, all `.ts`/`.html`/`.scss`) reference `ocx-page-content` or `PageContentComponent`. Each file has exactly ONE `<ocx-page-content>` wrapper (not multiple side-by-side sections), and neither usage has a `styleClass` or grouping need — both are single content sections → `OcxContentComponent` (`<ocx-content>`) applies to both, `OcxContentContainerComponent` not needed anywhere. Also verified via `node_modules/@onecx/portal-integration-angular/lib/core/portal-core.module.d.ts` that the CURRENTLY installed v5.47.5 `PortalCoreModule` already declares/exports both `OcxContentComponent` (selector `ocx-content`) and `OcxContentContainerComponent` (selector `ocx-content-container`) alongside the deprecated `PageContentComponent` (selector `ocx-page-content`, marked `@deprecated` in its own `.d.ts` doc comment) — so this migration is executable in Phase A with zero package/module-import changes, since both files' modules ([src/app/shared/shared.module.ts](src/app/shared/shared.module.ts) and [src/app/parameter/parameter.module.ts](src/app/parameter/parameter.module.ts)) already import `PortalCoreModule.forMicroFrontend()`.
- Sub-steps executed:
  1. Remove `PageContentComponent` — not-applicable as a TS import (it was never imported directly in any `.ts` file; only used as an HTML tag made available transitively via `PortalCoreModule.forMicroFrontend()`).
  2. Add `OcxContentComponent` from `@onecx/angular-accelerator` — not-applicable as a new TS/module import (already transitively available via the existing `PortalCoreModule.forMicroFrontend()` import in both `shared.module.ts` and `parameter.module.ts`; confirmed via `.d.ts` inspection, no module wiring changes needed).
  3. Add `OcxContentContainerComponent` — not-applicable (no grouping usage found in either file; only single content sections).
  4. Replace tag `<ocx-page-content>` → `<ocx-content>` (single sections) — done in both files.
  5. Migrate input properties — not-applicable (neither original `<ocx-page-content>` usage had a `styleClass` attribute; no properties to migrate; `title` left unset as it's optional and no equivalent page heading existed to move into it).
- Files changed: [src/app/parameter/parameter-search/parameter-search.component.html](src/app/parameter/parameter-search/parameter-search.component.html) (replaced opening `<ocx-page-content>` at line 20 → `<ocx-content>` and closing `</ocx-page-content>` at line 160 → `</ocx-content>`), [src/app/parameter/usage-search/usage-search.component.html](src/app/parameter/usage-search/usage-search.component.html) (replaced opening `<ocx-page-content>` at line 21 → `<ocx-content>` and closing `</ocx-page-content>` at line 142 → `</ocx-content>`)
- Post-change sweep: re-ran `grep -r "ocx-page-content|PageContentComponent"` across entire `src/` — 0 matches remain, confirming complete migration.
- Validation: build **PASS** (only pre-existing 2 baseline warnings — `app.component.ts`/`app.module.ts` unused-in-tsconfig, unrelated & pre-existing) | lint **PASS** ("All files pass linting", 0 warnings, matches baseline) | test **PASS** (146 SUCCESS / 147 total, 1 skipped — matches current A.3 baseline exactly; coverage 100% statements (578/578), 100% branches (211/211), 100% functions (162/162), 100% lines (519/519) — matches baseline)
- Final outcome: **success**
- Edge cases: planner's originally-recorded line numbers (20/305 and 21/245) were stale from before the A.3 `InteractiveDataViewComponent` rewrite which significantly shortened both templates — re-confirmed actual current line numbers (20/160 and 21/142) via fresh read before editing. No SCSS selectors referenced `ocx-page-content` in either component's stylesheet (confirmed via grep), so no SCSS changes were needed. No spec file referenced `page-content`/`PageContent` (confirmed via grep), so no spec changes were needed.

**[A.5]. Replace SearchCriteriaComponent with SearchHeaderComponent**

- [-] not applicable
- Source page (fetched full content this invocation): https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/switch-to-search-header.html — "In OneCX v6, Replace SearchCriteriaComponent with SearchHeaderComponent." Code Changes: remove `SearchCriteriaComponent` from `@onecx/portal-integration-angular` (selector `<ocx-search-criteria>`); add `SearchHeaderComponent` from `@onecx/angular-accelerator` (selector `<ocx-search-header>`); migrate props per mapping table (`searchId`→`pageName`, `disableAdvancedToggle`→removed/use `viewMode`, `criteriaTemplate`→removed; events `search`→`searched`, `reset`→`resetted`, `advancedViewToggle`→`viewModeChanged`).
- Applicability: **not applicable — CONFIRMED via fresh full-repo grep**
- Fresh full-repo grep commands run this invocation (entire repo, all file types, not limited to `src/app/parameter`):
  - `grep -rEn "ocx-search-criteria|SearchCriteriaComponent|SearchHeaderComponent|ocx-search-header|disableAdvancedToggle|criteriaTemplate|advancedViewToggle"` (full workspace) → only self-referential matches in `MIGRATION_PROGRESS.md` and `.github/instructions/*.md`, plus 2 matches (open/close tag) in [src/app/parameter/parameter-criteria/parameter-criteria.component.html](src/app/parameter/parameter-criteria/parameter-criteria.component.html) for `<ocx-search-header>` — **0 matches for the OLD symbols** (`ocx-search-criteria`, `SearchCriteriaComponent`, `disableAdvancedToggle`, `criteriaTemplate`, `advancedViewToggle`) anywhere in source.
  - Investigated the `<ocx-search-header>` usage found: confirmed via `git show a583a99:src/app/parameter/parameter-criteria/parameter-criteria.component.html` that this tag is part of the ORIGINAL pre-migration codebase (unmodified by any prior Phase A task) — it is NOT a partial/incomplete migration artifact.
  - Verified via `node_modules/@onecx/angular-accelerator/lib/components/search-header/search-header.component.d.ts` (currently installed v5.47.5) that `SearchHeaderComponent` (selector `ocx-search-header`, inputs `header`/`subheader`/`manualBreadcrumbs`/`actions`/`pageName`/`viewMode`, outputs `searched`/`resetted`/`viewModeChanged`) is **already available and already in use** — matches exactly the props (`header`, `subheader`, `searched`, `resetted`, `manualBreadcrumbs`, `actions`) used in parameter-criteria.component.html.
  - Verified via `node_modules/@onecx/portal-integration-angular/lib/core/components/search-criteria/search-criteria.component.d.ts` that the OLD deprecated `SearchCriteriaComponent` (selector `ocx-search-criteria`) IS present in the installed v5.47.5 package but is simply never imported/used anywhere in this repo's source.
- Conclusion: this app was already built directly against the new `SearchHeaderComponent`/`<ocx-search-header>` (available pre-migration in the currently installed `@onecx/angular-accelerator@5.47.5`) — there is no old `<ocx-search-criteria>`/`SearchCriteriaComponent` usage anywhere to migrate. Task genuinely not applicable, confirming the planner's tentative assessment with hard evidence.
- Sub-steps executed: not-applicable (all 4 Code Changes sub-steps and both Properties Mapping tables — no old symbol present to replace)
- Files changed: none
- Validation: skipped (no file changes — task not applicable, per Step 6 runtime check)
- Final outcome: **not applicable (confirmed)**

**[A.6]. Replace ButtonDialogComponent with OcxDialogInlineComponent**

- [-] not applicable
- Source page (fetched full content this invocation): https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/switch-to-ocx-dialog-inline.html — "In OneCX v6, replace `ButtonDialogComponent` with `DialogInlineComponent` for inline dialogs with configurable buttons and dynamic content." Code Changes: remove `ButtonDialogComponent` from `@onecx/portal-integration-angular` (selector `<ocx-button-dialog>`); add `DialogInlineComponent` from `@onecx/angular-accelerator` (selector `<ocx-dialog-inline>`); `config`/`resultEmitter` props unchanged (`ButtonDialogConfig` with `primaryButtonDetails`/`secondaryButtonIncluded`/`secondaryButtonDetails`/`customButtons`/`autoFocusButton`).
- Applicability: **not applicable — CONFIRMED via fresh full-repo grep**
- Fresh full-repo grep commands run this invocation (entire repo, all file types, not limited to `src/app/parameter`):
  - `grep -rEn "ocx-button-dialog|ButtonDialogComponent|ocx-dialog-inline|DialogInlineComponent|ButtonDialogConfig|primaryButtonDetails|secondaryButtonIncluded|autoFocusButton|resultEmitter"` (full workspace) → 0 matches anywhere in source; only self-referential matches in `MIGRATION_PROGRESS.md` (this doc) itself.
  - `grep -rEn "button-dialog|dialog-inline|customButtons|dialogConfig"` (broader substring/tag search, full workspace) → also 0 matches in source, only self-referential `MIGRATION_PROGRESS.md` matches.
  - No dialog-related component in this app (`parameter-delete.component`, etc.) uses either the old `ocx-button-dialog`/`ButtonDialogComponent` or the new `ocx-dialog-inline`/`DialogInlineComponent` pattern — dialogs in this repo use `PortalDialogService`/`p-dialog` patterns instead, which are out of scope for this specific doc page.
- Conclusion: neither the OLD nor the NEW symbol/tag from this migration doc is present anywhere in the codebase — nothing to replace. Task genuinely not applicable, confirming the planner's tentative assessment with hard evidence.
- Sub-steps executed: not-applicable (all 4 Code Changes sub-steps and both Properties Mapping tables — no old symbol present to replace)
- Files changed: none
- Validation: skipped (no file changes — task not applicable, per Step 6 runtime check)
- Final outcome: **not applicable (confirmed)**

**[A.7]. Adjust Packages in Webpack Config**

- [-] not applicable
- Source page (fetched full content this invocation): https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/adjust-packages-in-webpack-config.html — "In OneCX v6, packages in the webpack configuration that depend on a specific Angular version should not have `singleton: true`." Update configuration (only 1 bullet, no further sub-sections): "In `webpack.config.js`, within `withModuleFederationPlugin(...)`, remove the `singleton: true` property from all packages." Example shows before/after diff removing only the `singleton: true` key from each shared entry (e.g. `@angular/core`, `@onecx/angular-auth`, `primeng`, `rxjs`) while keeping `requiredVersion`/`includeSecondaries` untouched.
- Applicability: **not applicable — CONFIRMED via fresh full-repo evidence**
- Fresh evidence gathered this invocation:
  1. Full read of current [webpack.config.js](webpack.config.js) (entire file, all 21 shared entries in the `share({...})` block: `@angular/core`, `@angular/common`, `@angular/common/http`, `@angular/forms`, `@angular/platform-browser`, `@angular/router`, `@ngx-translate/core`, `@ngneat/error-tailor`, `primeng`, `rxjs`, `@onecx/accelerator`, `@onecx/angular-accelerator`, `@onecx/angular-auth`, `@onecx/angular-integration-interface`, `@onecx/angular-remote-components`, `@onecx/angular-testing`, `@onecx/angular-utils`, `@onecx/angular-webcomponents`, `@onecx/integration-interface`, `@onecx/portal-integration-angular`, `@onecx/portal-layout-styles`) — every single entry uses ONLY `requiredVersion: 'auto'` and/or `includeSecondaries`; NONE contain a `singleton` key of any value.
  2. `grep -in "singleton"` across the ENTIRE repository (all directories, all file types) → 3 matches in only 2 files, both non-code: `MIGRATION_PROGRESS.md` (this document's own prior planner notes) and `src/app/shared/generated/README.md` line 128 (an unrelated OpenAPI-generator boilerplate sentence: "This is to ensure that all services are treated as singletons.", referring to generated Angular service classes, not webpack module federation config). Zero matches in any `.js`/`.ts`/`.json` config file.
  3. Confirmed only two webpack config files exist in the repo ([file_search](webpack.config.js) for `**/webpack*.config.js`): [webpack.config.js](webpack.config.js) (the real Module Federation config, read in full above) and [webpack.prod.config.js](webpack.prod.config.js), which is a 1-line re-export (`module.exports = require('./webpack.config')`) with no independent `shared`/`singleton` content of its own.
- Conclusion: the codebase already has zero `singleton: true` properties anywhere in its webpack configuration (likely already cleaned up during the A.1 `@onecx/keycloak-auth` removal edit, or never set this way to begin with). Nothing to remove. Task genuinely not applicable — confirms and finalizes the planner's tentative assessment with full-repo evidence.
- Sub-steps executed: not-applicable (the doc's single "Update configuration" bullet has no matching `singleton: true` occurrence anywhere to remove)
- Files changed: none
- Validation: skipped (no file changes — task not applicable, per Step 6 runtime check)
- Final outcome: **not applicable (confirmed)**

**[A.8]. Remove MenuService**

- [-] not applicable
- Source page (fetched full content this invocation): https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/remove-menuservice.html — single-paragraph page, no H2 sections: "In OneCX v6, `MenuService` has been removed. Please remove all references to `MenuService` and imports from `@onecx/portal-integration-angular`. To create menu items in your app, create an endpoint in the BFF and implement your own function to load the data."
- Applicability: **not applicable — CONFIRMED via fresh full-repo evidence**
- Fresh evidence gathered this invocation: `grep -in "MenuService"` across the ENTIRE repository (all directories, all file types, not limited to `src/`) → 8 matches in only 3 files, all non-source: `.github/agents/migration-executor.agent.md` line 48 (agent mode example text), `.github/instructions/migration-18-19.instructions.md` lines 118-119 (this task's own applicability-rule documentation), and `MIGRATION_PROGRESS.md` (this document's own prior planner notes, lines 36/241/244/245). Zero matches in any `.ts`, `.html`, `.scss`, or `.json` source file anywhere in `src/` or elsewhere in the repository — no `MenuService` import, injection, constructor parameter, or property reference exists in actual application code.
- Conclusion: this app never used `MenuService` — there is nothing to remove. Task genuinely not applicable, confirming the planner's tentative assessment with full-repo evidence (no partial applicability possible since the doc has only one instruction and it has zero matching targets).
- Sub-steps executed: not-applicable (no `MenuService` import/reference exists anywhere in source to remove)
- Files changed: none
- Validation: skipped (no file changes — task not applicable, per Step 6 runtime check)
- Final outcome: **not applicable (confirmed)**

**[A.9]. Update Translation Path Factories**

- [x] complete
- Source page (fetched full content this invocation): https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/update-translations.html — 2 H2 sections: "Update Imports" (bullets: remove `createTranslateLoader`/`createRemoteComponentAndMfeTranslateLoader`/`createRemoteComponentTranslateLoader`/`translationPathFactory`/`remoteComponentTranslationPathFactory`/`TRANSLATION_PATH` from `@onecx/angular-accelerator`; add `provideTranslationPathFromMeta`/`createTranslateLoader`/`TRANSLATION_PATH` from `@onecx/angular-utils`; add `provideTranslateServiceForRoot` from `@onecx/angular-remote-components`; replace `translateServiceInitializer` from `@onecx/portal-integration-angular` with `provideTranslationPathFromMeta`; replace `PortalMissingTranslationHandler` from `@onecx/portal-integration-angular` with `AngularAcceleratorMissingTranslationHandler` from `@onecx/angular-accelerator`) and "Configure Translation Providers for Remote Components" (applies only to `bootstrapRemoteComponent()`-style remote components — translation providers must live in `bootstrap.ts` instead of `component.ts`, using `provideTranslationPathFromMeta` + `provideTranslateServiceForRoot`).
- Applicability: **must-have (partial)** — "Update Imports" applied (2 of 5 bullets required code changes; other 3 already satisfied); "Configure Translation Providers for Remote Components" is **not applicable** to this repo's architecture.
- Repository evidence (fresh full-repo grep this invocation, not trusting stale planner line numbers): re-read [src/app/app.module.ts](src/app/app.module.ts) and [src/app/onecx-parameter-remote.module.ts](src/app/onecx-parameter-remote.module.ts) in full plus `grep -rn` for `TRANSLATION_PATH|translationPathFactory|remoteComponentTranslationPathFactory|createRemoteComponentAndMfeTranslateLoader|createRemoteComponentTranslateLoader|provideTranslateServiceForRoot|bootstrapRemoteComponent|REMOTE_COMPONENT_CONFIG|translateServiceInitializer|PortalMissingTranslationHandler|AngularAcceleratorMissingTranslationHandler` across `src/**`:
  - `translateServiceInitializer` + `PortalMissingTranslationHandler` — found ONLY in [src/app/app.module.ts](src/app/app.module.ts) (import lines 13/15, usage lines 43/50 pre-edit) — old pattern, needed replacement.
  - `createTranslateLoader` — already imported from `@onecx/angular-utils` (correct package) in both [src/app/app.module.ts](src/app/app.module.ts) and [src/app/onecx-parameter-remote.module.ts](src/app/onecx-parameter-remote.module.ts) — no `@onecx/angular-accelerator` import of it exists anywhere (0 matches).
  - `provideTranslationPathFromMeta` — already imported from `@onecx/angular-utils` and already called in the `providers` array of BOTH [src/app/app.module.ts](src/app/app.module.ts) and [src/app/onecx-parameter-remote.module.ts](src/app/onecx-parameter-remote.module.ts) — pre-existing, no change needed.
  - `AngularAcceleratorMissingTranslationHandler` — already imported from `@onecx/angular-accelerator` and already used as `missingTranslationHandler` in [src/app/onecx-parameter-remote.module.ts](src/app/onecx-parameter-remote.module.ts) (lines 18, 55) — pre-existing; [src/app/app.module.ts](src/app/app.module.ts) still used the OLD `PortalMissingTranslationHandler` — needed replacement.
  - `TRANSLATION_PATH`, `translationPathFactory`, `remoteComponentTranslationPathFactory`, `createRemoteComponentAndMfeTranslateLoader`, `createRemoteComponentTranslateLoader` — 0 matches anywhere in `src/**` (old-style per-symbol factories were never used in this repo; it already used the newer `provideTranslationPathFromMeta` pattern for the parts that were migrated).
  - `bootstrapRemoteComponent`, `REMOTE_COMPONENT_CONFIG`, `provideTranslateServiceForRoot` — 0 matches anywhere in `src/**`. Confirmed via full read of [src/bootstrap.ts](src/bootstrap.ts) (uses `bootstrapModule(OneCXParameterModule, 'microfrontend', environment.production)` from `@onecx/angular-webcomponents` — the NgModule micro-frontend pattern, NOT the per-component `bootstrapRemoteComponent()` webcomponent pattern) and [src/app/app-entrypoint.component.ts](src/app/app-entrypoint.component.ts) (plain `@Component`, no translation providers of its own). This app has exactly one micro-frontend entry point (`OneCXParameterModule`), not standalone remote-web-components, so the "Configure Translation Providers for Remote Components" section's `bootstrapRemoteComponent(...)` example pattern does not apply.
- Sub-steps executed:
  1. Remove `createTranslateLoader`/`createRemoteComponentAndMfeTranslateLoader`/`createRemoteComponentTranslateLoader`/`translationPathFactory`/`remoteComponentTranslationPathFactory`/`TRANSLATION_PATH` imports from `@onecx/angular-accelerator` — not-applicable, none were ever imported from that package (already imported from `@onecx/angular-utils`).
  2. Add `provideTranslationPathFromMeta`/`createTranslateLoader`/`TRANSLATION_PATH` from `@onecx/angular-utils` — not-applicable (already present in both files prior to this task).
  3. Add `provideTranslateServiceForRoot` from `@onecx/angular-remote-components` — not-applicable, no `bootstrapRemoteComponent()` usage in this repo (see architecture evidence above).
  4. Replace `translateServiceInitializer` with `provideTranslationPathFromMeta` — **done** in [src/app/app.module.ts](src/app/app.module.ts): removed the `APP_INITIALIZER`/`translateServiceInitializer` provider block (import + usage), since the equivalent `provideTranslationPathFromMeta(import.meta.url, 'assets/i18n/')` provider was already present in the same `providers` array (now the sole translation-path provider). Cascading cleanup: removed now-unused `TranslateService` (from `@ngx-translate/core`) and `UserService` (from `@onecx/angular-integration-interface`) imports and the `APP_INITIALIZER` import from `@angular/core` (no longer referenced anywhere else in the file).
  5. Replace `PortalMissingTranslationHandler` with `AngularAcceleratorMissingTranslationHandler` — **done** in [src/app/app.module.ts](src/app/app.module.ts): removed `PortalMissingTranslationHandler` from the `@onecx/portal-integration-angular` import (only `PortalCoreModule` remains from that package, still needed for `PortalCoreModule.forRoot(...)`, out of scope for this task); added `AngularAcceleratorMissingTranslationHandler` from `@onecx/angular-accelerator`; updated `TranslateModule.forRoot({ missingTranslationHandler: { ... } })` to `useClass: AngularAcceleratorMissingTranslationHandler`.
  6. "Configure Translation Providers for Remote Components" (move translation providers from `component.ts` to `bootstrap.ts`) — not-applicable, confirmed no `bootstrapRemoteComponent()`/per-remote-component translation providers exist anywhere in this repo (see architecture evidence above); [src/app/onecx-parameter-remote.module.ts](src/app/onecx-parameter-remote.module.ts) already correctly defines its translation providers at the `NgModule` level (equivalent placement for this app's architecture), not per-component.
  - `provideTranslationConnectionService()` — **deferred**, per explicit `migration-18-19.instructions.md` "Update Translations" rule: "It's okay if it is not added now ... Add `provideTranslationConnectionService()` from `@onecx/angular-utils` in post migration after packages updated." Confirmed this function is not exported by the currently-installed `@onecx/angular-utils@5.47.5` (checked `node_modules/@onecx/angular-utils/index.d.ts` — no such export exists yet in v5.x); it is a v6-only API. Deferred to **Phase C task C.4 "Update Component Imports Post Migration"** (or a new post-Phase-B follow-up if C.4's doc page doesn't cover it) — must be picked up once `@onecx/angular-utils` is upgraded to v6.x in Phase B/C.
- Files changed: [src/app/app.module.ts](src/app/app.module.ts) — removed `translateServiceInitializer`/`PortalMissingTranslationHandler` imports and the `APP_INITIALIZER` provider block; removed now-unused `TranslateService`/`UserService`/`APP_INITIALIZER` imports; added `AngularAcceleratorMissingTranslationHandler` import from `@onecx/angular-accelerator` and wired it into `TranslateModule.forRoot({ missingTranslationHandler })`.
- Validation: build **PASS** (only pre-existing 2 baseline warnings — `app.component.ts`/`app.module.ts` "part of TypeScript compilation but unused", cosmetic/pre-existing, unrelated to this task) | lint **PASS** ("All files pass linting", 0 warnings, matches baseline) | test **PASS** (146 SUCCESS / 147 total, 1 skipped — matches current baseline exactly; coverage 100% statements (578/578), 100% branches (211/211), 100% functions (162/162), 100% lines (519/519) — matches baseline)
- Final outcome: **success**
- Edge cases: [src/app/onecx-parameter-remote.module.ts](src/app/onecx-parameter-remote.module.ts) required ZERO changes for this task — it was already fully aligned with the doc's "Update Imports" target state (likely from earlier ad-hoc work), which was independently re-verified via fresh grep/read rather than trusted from the stale planner note. `provideTranslationConnectionService()` explicitly NOT added yet — deferred per custom instructions, tracked for Phase C pickup once `@onecx/angular-utils` reaches v6.x (not silently dropped).

**[A.10 — Last Phase A Task]. End-of-Phase-A Build State Record**

- [x] complete
- Source page: N/A — required by migration process
- **STRICT MODE**: Build/lint/test MUST pass. Phase A changes are made with the CURRENT Angular version (18.2.12) — the build should work.
- Phase A task summary: A.1 [x], A.2 [x], A.3 [x], A.4 [x], A.5 [-] not applicable (confirmed), A.6 [-] not applicable (confirmed), A.7 [-] not applicable (confirmed), A.8 [-] not applicable (confirmed), A.9 [x]. All tasks resolved — 0 remaining `[ ]` in Phase A.
- Files changed in Phase A (`git diff --stat`, independently re-run and confirmed): 17 files changed, 461 insertions(+), 875 deletions(-) — `.github/instructions/migration-18-19.instructions.md`, `package.json`/`package-lock.json` (removed `@onecx/keycloak-auth`/`keycloak-angular`), `src/app/app.module.ts`, `src/app/onecx-parameter-remote.module.ts`, `webpack.config.js`, and all `parameter-search`/`usage-search`/`usage-detail`/`usage-detail-criteria` component/template/style/spec files (A.3 InteractiveDataViewComponent migration + A.4 OcxContentComponent tag swap).
- Validation (independently re-run directly by the orchestrator/user, not just trusted from executor self-reports):
  - npm run build: **PASS** — only the 2 pre-existing baseline warnings (`app.component.ts`/`app.module.ts` unused-in-tsconfig, cosmetic, unrelated to migration)
  - npm run lint: **PASS** — "All files pass linting", 0 warnings (0 errors, 0 new warnings vs baseline of 0)
  - npm run test: **PASS** — 146 SUCCESS / 147 total (1 skipped, matches Phase 1 baseline count exactly); coverage 100% statements (578/578), 100% branches (211/211), 100% functions (162/162), 100% lines (519/519) — matches Phase 1 baseline of 100%/100%/100%/100% exactly (a transient branch-coverage dip to 99.52% during A.3 was identified and fixed by adding a missing test-mock case before A.3 was marked complete)
- Final outcome: **success** — Phase A complete, build stable on Angular 18.2.12, ready for Phase B gate.
- Remaining issues: none blocking. One item explicitly deferred (not a defect): `provideTranslationConnectionService()` (from `@onecx/angular-utils`) requires `@onecx/angular-utils` v6.x and is tracked for pickup in Phase C (see A.9 edge cases note).

---

## Phase B: Core Upgrade Gate (Manual Developer Approval Required)

> Triggered after ALL Phase A tasks are [x] complete.

**Orchestrator presents (at gate time):**

- Files changed in Phase A: [git diff --stat — TBD]
- End-of-Phase-A build state: [TBD from A.10]
- Upgrade target versions: `@angular/core` → latest stable 19.2.x (resolve via `npm view @angular/core dist-tags`), `@onecx/*` → latest stable 6.x.y

**Developer approval:**

- [x] Approved to proceed with core package upgrades
- Approval recorded by: developer, via chat confirmation ("yes") on 2026-07-17, after reviewing Phase A completion summary (17 files changed, build/lint/test all PASS, 100% coverage)

**Phase B Tasks (doc-driven — fetched from OneCX/Angular upgrade guide at approval time):**

> Since this is a plain Angular CLI workspace (not Nx), Phase B will follow the official Angular Update Guide (`https://angular.dev/update-guide?v=18.0-19.0&l=3`) rather than the NX-specific upgrade page.

**[B.1] Core Angular 18 → 19 upgrade + @onecx/\* 5.x → 6.x upgrade + build-break remediation**

- [x] completed
- Source pages: `https://angular.dev/update-guide?v=18.0-19.0&l=3`; OneCX migration doc patterns already captured in `migration-18-19.instructions.md` (Adjust Standalone Mode, Update Component Imports, Remove @onecx/portal-layout-styles, Update Translations, Post-Migration Import Corrections sections)
- Applicability: must-have — entire application depends on `@angular/core` and `@onecx/*` packages
- Repository evidence:
  - `grep -rn "portal-integration-angular\|portal-layout-styles\|PortalCoreModule\|InitializeModuleGuard\|addInitializeModuleGuard\|FilterType.EQUAL[^S]" src/` → no matches (all old patterns removed)
  - `grep -E "@angular/core|@angular/cli|@onecx/" package.json` → `@angular/core: ^19.2.25`, `@angular/cli: ~19.2.27`, all `@onecx/*` packages at `^6.27.0`, `@onecx/angular-standalone-shell` newly added at `^6.27.0`; `@onecx/portal-integration-angular` and `@onecx/portal-layout-styles` fully removed from `package.json` (not bumped — removed, per doc-driven replacement pattern)
- Sub-steps executed:
  - Bump `@angular/core`/`@angular/cli` to 19.2.x and `@onecx/*` to 6.27.0 — done
  - Remove `@onecx/portal-integration-angular` / `@onecx/portal-layout-styles` from `package.json`, `angular.json` (assets glob), `webpack.config.js` (module-federation shared + sharedMappings) — done
  - Replace `<ocx-portal-viewport>` → `<ocx-standalone-shell-viewport>` (`@onecx/angular-standalone-shell`) in `app.component.html` — done
  - Replace `PortalCoreModule.forRoot(...)` → `AngularAcceleratorModule` + `StandaloneShellModule` imports in `app.module.ts`; add `provideThemeConfig()`, `provideAngularUtils()`, `provideTokenInterceptor()` providers — done
  - Replace `PortalCoreModule.forMicroFrontend()` + `InitializeModuleGuard`/`addInitializeModuleGuard` → `AngularAcceleratorModule` + plain `RouterModule.forChild(routes)` in `parameter.module.ts` — done
  - Fix `PortalApiConfiguration` constructor arg-count mismatch in `onecx-parameter-remote.module.ts` (2-arg signature: `Configuration`, `environment.apiPrefix`) — done
  - Fix `FilterType.EQUAL` → `FilterType.EQUALS` in `parameter-search.component.ts` and `usage-search.component.ts` — done (cross-referenced with Phase C task C.2, now resolved here; C.2 marked `[-]` below)
  - Replace deprecated `APP_INITIALIZER` provider objects with `provideAppInitializer()` + `inject()` in `onecx-parameter-remote.module.ts` (Angular 19 deprecation, caught via lint) — done
  - Fix test-only TS2722 errors (`actionCallback` now optional in `@onecx/angular-accelerator` v6 `Action` type) via optional chaining (`actionCallback?.()`) in `parameter-search.component.spec.ts` (2 call sites) and `usage-search.component.spec.ts` (1 call site) — done
  - `.eslintrc.json`: added `"@angular-eslint/prefer-standalone": "off"` override (repo intentionally keeps NgModule-based components, not standalone) — done
- Files changed: `package.json`, `package-lock.json`, `angular.json`, `webpack.config.js`, `.eslintrc.json`, `src/styles.scss`, `src/app/app.module.ts`, `src/app/app.component.ts`, `src/app/app.component.html`, `src/app/app-entrypoint.component.ts`, `src/app/onecx-parameter-remote.module.ts`, `src/app/parameter/parameter.module.ts`, `src/app/parameter/parameter-search/parameter-search.component.ts`, `src/app/parameter/parameter-search/parameter-search.component.spec.ts`, `src/app/parameter/usage-search/usage-search.component.ts`, `src/app/parameter/usage-search/usage-search.component.spec.ts`, `src/app/parameter/parameter-criteria/parameter-criteria.component.ts`, `src/app/parameter/parameter-delete/parameter-delete.component.ts`, `src/app/parameter/parameter-detail/parameter-detail.component.ts`, `src/app/parameter/parameter-detail/parameter-detail.component.html`, `src/app/parameter/parameter-detail/parameter-detail.component.spec.ts`, `src/app/parameter/usage-detail/usage-detail.component.ts`, `src/app/parameter/usage-detail/usage-detail-criteria/usage-detail-criteria.component.ts`, `src/app/parameter/usage-detail/usage-detail-list/usage-detail-list.component.ts`, `src/app/parameter/usage-detail/usage-detail-list/usage-detail-list.component.html`, `src/app/shared/shared.module.ts`
- Validation:
  - npm run build: **PASS** — exit 0, no errors (baseline cosmetic warnings unchanged: `app.component.ts`/`app.module.ts` unused-in-tsconfig; new sass deprecation warnings from dart-sass upgrade are non-blocking build-tool warnings, not lint/code issues)
  - npm run lint: **PASS** — "All files pass linting", 0 errors, 0 warnings (initially surfaced 2 new `APP_INITIALIZER` deprecation warnings, fixed via `provideAppInitializer()` migration, re-verified clean)
  - npm run test: **PASS** — 146 SUCCESS / 147 total (1 skipped), exactly matching Phase A baseline; coverage 100% statements (578/578), 100% branches (211/211), 100% functions (162/162), 100% lines (519/519) — matches Phase A baseline exactly (initially failed with 3 TS2722 compile errors in spec files due to `actionCallback` becoming optional in the new `@onecx/angular-accelerator` v6 types; fixed via optional chaining, re-verified clean)
- Final outcome: **success** — Angular 19.2.25 / @onecx 6.27.0 baseline stable, build/lint/test all PASS matching Phase A baseline exactly.
- Edge cases:
  - Two migration-executor subagent invocations for this task returned empty final messages despite performing real file edits (verified independently via `git status --short` after each); all downstream verification (build/lint/test, diff review, package version checks) was performed directly rather than trusting subagent self-report, per session operational protocol.
  - `@onecx/portal-integration-angular` / `@onecx/portal-layout-styles` were REMOVED entirely (not version-bumped) — confirmed no v6.x equivalents exist and all their exports are now provided by `@onecx/angular-accelerator`, `@onecx/angular-standalone-shell`, `@onecx/angular-utils`.
  - `provideTranslationConnectionService()` from `@onecx/angular-utils` — still not added; remains deferred to Phase C per A.9 edge-case note (package is now at v6.27.0 so it's technically available; to be picked up in a Phase C task per "Post-Migration Import Corrections" doc guidance).

---

## Phase C: Post-Migration Cleanup

> Execute after Phase B is confirmed stable (developer sign-off).
> Validation order: build → lint → test. Transitional build/test failures allowed per task if fully documented.

**Developer sign-off (Phase B → C gate):**

- [x] Phase B confirmed stable — build/lint/test all PASS matching Phase A baseline (146/147 tests, 100% coverage), committed as `7af02f4`
- Approval recorded by: developer, via chat confirmation ("continue execution") on 2026-07-17, after reviewing Phase B completion summary

### Phase C Tasks (discovered by planner)

**[C.1]. Required Package Updates**

- [x] completed
- Source page (fetched full content this invocation): https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/update-packages.html — 1 H2 section "Installation Commands" with a version table: `@onecx/*` → `^6.x.y`, `@ngrx/*` → `^19.x.y`, `primeng` → `^19.0.0`, `primeicons` → `^7.0.0`, `primeflex` → `^4.0.0`, `@ngx-translate/core` → `^16.0.0`, `@ngx-translate/http-loader` → `^8.0.0`, `ngrx-store-localstorage` → `^19.0.0`, `ngx-build-plus` → `^19.0.0`. Note: "Do not add keycloak-js to your package.json dependencies."
- Applicability: **must-have (partial — most already satisfied by Phase B)**
- Repository evidence: Fresh read of [package.json](package.json) plus `npm ls` this invocation showed `@ngx-translate/core@16.0.4` (already ✓ target `^16.0.0`), `@ngx-translate/http-loader@8.0.0` (already ✓), `primeng@19.1.4` (already ✓ target `^19.0.0`), `primeicons@7.0.0` (already ✓), `ngx-build-plus@19.0.0` (already ✓ target `^19.0.0`), all `@onecx/*` packages at `^6.27.0` (already ✓, done in Phase B/B.1) — these were all resolved as transitive/direct dependency bumps during the Phase B core upgrade (`7af02f4`), not by this task. Only `primeflex` remained outdated: `^3.3.1` in [package.json](package.json), needed `^4.0.0`. `ngrx-store-localstorage` — not present in `package.json` (not used by this app, not applicable). `@ngrx/*` (`@ngrx/effects`, `@ngrx/router-store`) already at `^19.2.1` (already ✓). `keycloak-js` present at `^25.0.6` as a direct dependency — doc says "do not add keycloak-js to your package.json dependencies" but it was already present pre-existing in this repo before this migration leg (not added by this task); left untouched per no-defer/no-unrelated-change rule (removing it is out of scope for C.1 and would require separate verification of why/where it's used — not part of this doc page's actionable instructions beyond the note).
- Sub-steps executed:
  1. Update `@onecx/*` to `^6.x.y` — not-applicable this invocation, already done in Phase B (confirmed `^6.27.0` via `npm ls`).
  2. Update `@ngrx/*` to `^19.x.y` — not-applicable, already at `^19.2.1`.
  3. Update `primeng` to `^19.0.0` — not-applicable, already at `^19.1.4` (Phase B).
  4. Update `primeicons` to `^7.0.0` — not-applicable, already current.
  5. Update `primeflex` to `^4.0.0` — **done**: verified `npm view primeflex@4.0.0 peerDependencies` returns empty (no peer deps, pure CSS/SCSS utility package, compatible with any Angular version); verified `primeflex.scss`/`primeflex.css` still ship at package root in v4.0.0 (via `npm pack --dry-run`), so the existing `@import 'node_modules/primeflex/primeflex.scss';` in [src/styles.scss](src/styles.scss) remains valid with no path change needed; ran `npm install primeflex@^4.0.0`.
  6. Update `@ngx-translate/core` to `^16.0.0` — not-applicable, already at `^16.0.4`.
  7. Update `@ngx-translate/http-loader` to `^8.0.0` — not-applicable, already current.
  8. Update `ngrx-store-localstorage` to `^19.0.0` — not-applicable, package not used anywhere in this repo (confirmed absent from `package.json` and `grep -r "ngrx-store-localstorage"` returned 0 matches).
  9. Update `ngx-build-plus` to `^19.0.0` — not-applicable, already at `^19.0.0`.
  10. `keycloak-js` "do not add to dependencies" note — not-applicable to this task (pre-existing direct dependency from before this migration leg started; not added by C.1; flagged as an edge case, not touched here to stay within task scope).
- Files changed: [package.json](package.json) (`primeflex`: `^3.3.1` → `^4.0.0`), `package-lock.json` (regenerated lock entries for `primeflex`).
- Post-change sweep: re-ran `npm ls primeng primeflex @ngx-translate/core @ngx-translate/http-loader ngx-build-plus primeicons` — all packages confirmed at target versions, `primeflex@4.0.0` resolved with no dependency-tree conflicts.
- Validation: build **PASS** (`npm run build` via VS Code task `npm:build` — bundle generated successfully, only pre-existing baseline warnings: Sass `@import` deprecation warnings in 5 component `.scss` files from the dart-sass upgrade in Phase B, and `app.component.ts`/`app.module.ts` "unused in tsconfig" cosmetic warnings — both pre-existing, unrelated to this task, no new warnings) | lint **PASS** (`npm run lint` via VS Code task `npm:lint` — "All files pass linting", 0 errors, 0 warnings, matches baseline) | test **PASS** (`npm run test:ci` — 146 SUCCESS / 147 total, 1 skipped, exactly matching the Phase A/B baseline; coverage 100% statements (578/578), 100% branches (211/211), 100% functions (162/162), 100% lines (519/519) — matches baseline exactly, no regression)
- Final outcome: **success**
- Edge cases: This task's doc page overlaps heavily with Phase B's `B.1` core upgrade, which already bumped `@onecx/*`, `@ngrx/*`, `primeng`, `primeicons`, `@ngx-translate/core`, `@ngx-translate/http-loader`, and `ngx-build-plus` to their v19-compatible targets as a side effect of resolving peer-dependency requirements during the Angular 19 upgrade — only `primeflex` (a standalone CSS utility library with no peer dependency on Angular/PrimeNG) had been left behind since nothing in the dependency tree forced its bump. No PrimeNG-specific v18→v19 API breaking changes were triggered by this task since `primeng` itself was not touched here (already upgraded in Phase B, where any resulting component API changes would have already surfaced as build/lint errors — none did in this invocation). `primeflex` v3→v4 utility class renames (if any) are a runtime CSS/visual concern, not a build-time TypeScript/lint concern — no build errors were produced by the SCSS import, and grep confirmed `primeflex` is only referenced via the single global `@import` in [src/styles.scss](src/styles.scss) (no direct utility class usage found requiring inspection in `.html`/`.ts` template bindings). `keycloak-js` pre-existing-dependency note left as a flagged edge case, not remediated (out of scope for C.1).

**[C.2]. Update FilterType Value**

- [x] completed (resolved during Phase B, see B.1 edge cases)
- Source page: https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/update-filtertype-value.html
- Applicability: must-have — confirmed via `grep -rn "FilterType\." src/` after Phase B package upgrade: `FilterType.EQUALS` used in `parameter-search.component.ts:104` and `usage-search.component.ts:108`; no `FilterType.TRUTHY` usages found anywhere in the codebase
- Repository evidence: pre-upgrade grep (Phase 1) returned 0 matches since the enum only became a compile error after the `@onecx/angular-accelerator` v6 bump; post-upgrade build surfaced `TS2551: Property 'EQUAL' does not exist, did you mean 'EQUALS'?` in both files, which was fixed as part of B.1's build-break remediation
- Sub-steps executed: rename `FilterType.EQUAL` → `FilterType.EQUALS` in both call sites — done; `FilterType.TRUTHY` → `FilterType.IS_NOT_EMPTY` — not-applicable (no usages found)
- Files changed: `src/app/parameter/parameter-search/parameter-search.component.ts`, `src/app/parameter/usage-search/usage-search.component.ts` (already listed in B.1's files-changed list)
- Validation: build **PASS** | lint **PASS** | test **PASS** (see B.1 validation evidence — same invocation)
- Final outcome: **success** — folded into and validated as part of Phase B (B.1) since the error only manifested after the core package upgrade; no separate Phase C action needed.

**[C.3]. Update ConfigurationService Usage**

- [ ] not started
- Source page: https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/update-configuration-service-usage.html
- Applicability: must-have
- Repository evidence: `ConfigurationService` imported and used synchronously in [src/app/onecx-parameter-remote.module.ts](src/app/onecx-parameter-remote.module.ts) (`apiConfigProvider` function, line 25; also `this.appConfigService.getProperty(...)` call at line 87) — these calls will need `await`/Promise handling once v6 makes these methods async.
- Sub-steps executed: [TBD]
- Files changed: [TBD]
- Validation: build [TBD] | lint [TBD] | test [TBD]
- Final outcome: [TBD]

**[C.4]. Update Component Imports Post Migration**

- [ ] not started
- Source page: https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/update-component-import-post-migration.html
- Applicability: TBD by executor — must re-grep after Phase B upgrade for: `DialogMessageContentComponent`, `DialogInlineComponent`, `GlobalErrorComponent`, `LoadingIndicatorComponent`, `BasicDirective`, `RelativeDatePipe`, `ExportDataService`, `PortalDialogService`, `BreadcrumbService`, `DataTableColumn`, `ColumnType`, `Action`, `UserService`, `PortalMessageService`, etc.
- Repository evidence: `PortalDialogService` already found imported from `@onecx/portal-integration-angular` in [src/app/shared/shared.module.ts](src/app/shared/shared.module.ts) (line 29) — this is explicitly listed in this doc's "Components Moved to Different Libraries" section (target: `@onecx/angular-accelerator`). `Action` also found in multiple component files, also listed in this doc's target list.
- Sub-steps executed: [TBD]
- Files changed: [TBD]
- Validation: build [TBD] | lint [TBD] | test [TBD]
- Final outcome: [TBD]

**[C.5]. Update Portal API Configuration object parameters**

- [ ] not started
- Source page: https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/update-portal-api-configuration.html
- Applicability: must-have
- Repository evidence: `new PortalApiConfiguration(...)` constructed with 4 args (`Configuration, environment.apiPrefix, configService, appStateService`) in [src/app/onecx-parameter-remote.module.ts](src/app/onecx-parameter-remote.module.ts) (`apiConfigProvider` function, line ~26) — v6 constructor only takes 2 args (class + prefix), the 2 service params must be removed from the call.
- Sub-steps executed: [TBD]
- Files changed: [TBD]
- Validation: build [TBD] | lint [TBD] | test [TBD]
- Final outcome: [TBD]

**[C.6]. Remove @onecx/portal-layout-styles**

- [ ] not started
- Source page: https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/remove-portal-layout-styles.html
- Applicability: must-have
- Repository evidence: `@onecx/portal-layout-styles` in [package.json](package.json) (line 66) and imported twice in [src/styles.scss](src/styles.scss) (lines 9–10: `shell/shell.scss`, `primeng/theme-light.scss`); also referenced in [webpack.config.js](webpack.config.js) shared config (line 32). This is an Angular CLI app (not Nx) — the "For Angular CLI Application Styles" `postbuild` script variant applies, not the NX/project.json variant.
- Sub-steps executed: [TBD]
- Files changed: [TBD]
- Validation: build [TBD] | lint [TBD] | test [TBD]
- Final outcome: [TBD]

**[C.7]. Remove addInitializeModuleGuard()**

- [ ] not started
- Source page: https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/remove-add-initialize-module-guard.html
- Applicability: must-have
- Repository evidence: `addInitializeModuleGuard` imported and used in [src/app/onecx-parameter-remote.module.ts](src/app/onecx-parameter-remote.module.ts) (lines 13, 49: `RouterModule.forRoot(addInitializeModuleGuard(routes))`) and in [src/app/parameter/parameter.module.ts](src/app/parameter/parameter.module.ts) (lines 5, 53: `RouterModule.forChild(addInitializeModuleGuard(routes))`).
- Sub-steps executed: [TBD]
- Files changed: [TBD]
- Validation: build [TBD] | lint [TBD] | test [TBD]
- Final outcome: [TBD]

**[C.8]. Remove PortalCoreModule**

- [ ] not started
- Source page: https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/remove-portal-core-module.html
- Applicability: must-have
- Repository evidence: `PortalCoreModule` imported in [src/app/onecx-parameter-remote.module.ts](src/app/onecx-parameter-remote.module.ts) (line 19), [src/app/parameter/parameter.module.ts](src/app/parameter/parameter.module.ts) (line 6), [src/app/shared/shared.module.ts](src/app/shared/shared.module.ts) (line 29); `PortalCoreModule.forRoot('onecx-parameter-ui')` also used in [src/app/app.module.ts](src/app/app.module.ts) (line 33). This is a **prerequisite gate task**: doc explicitly states verify all `@onecx/portal-integration-angular` imports are migrated (i.e. A.2, C.4 done) before running `npm uninstall @onecx/portal-integration-angular`.
- Sub-steps executed: [TBD]
- Files changed: [TBD]
- Validation: build [TBD] | lint [TBD] | test [TBD]
- Final outcome: [TBD]

**[C.9]. Adjust Standalone Mode**

- [ ] not started
- Source page: https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/adjust-standalone-mode.html
- Applicability: **must-have** — per custom rule in `migration-18-19.instructions.md`, applies whenever `<ocx-portal-viewport>` is found, regardless of whether `@onecx/standalone-shell` is in package.json.
- Repository evidence: `<ocx-portal-viewport>` found in [src/app/app.component.html](src/app/app.component.html) (line 1). `@onecx/standalone-shell` is NOT currently in package.json (new install required).
- Sub-steps executed: [TBD]
- Files changed: [TBD]
- Validation: build [TBD] | lint [TBD] | test [TBD]
- Final outcome: [TBD]

**[C.10]. Replace BASE_URL injection token**

- [ ] not started
- Source page: https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/update-base-url.html
- Applicability: TBD by executor
- Repository evidence: 0 matches for `BASE_URL`/`REMOTE_COMPONENT_CONFIG` found in `src/**/*.ts` at Phase 1 time — this app currently has only ONE remote entrypoint ([src/app/onecx-parameter-remote.module.ts](src/app/onecx-parameter-remote.module.ts)/`bootstrap.ts` pattern); executor must re-grep specifically for `bootstrapRemoteComponent(` calls and any `BASE_URL` provider before marking not-applicable.
- Sub-steps executed: [TBD]
- Files changed: [TBD]
- Validation: build [TBD] | lint [TBD] | test [TBD]
- Final outcome: [TBD]

**[C.11]. Update Theme Service usage**

- [ ] not started
- Source page: https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/update-theme-service.html
- Applicability: TBD by executor
- Repository evidence: 0 direct matches for `ThemeService`/`baseUrlV1`/`getThemeRef`/`loadAndApplyTheme`/`.apply(` in `src/` at Phase 1 time (only mentioned in `.github/instructions/migration-18-19.instructions.md`). Executor must re-confirm with fresh grep before marking `[-]`.
- Sub-steps executed: [TBD]
- Files changed: [TBD]
- Validation: build [TBD] | lint [TBD] | test [TBD]
- Final outcome: [TBD]

**[C.12]. Add Webpack Plugin for PrimeNG**

- [ ] not started
- Source page: https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/add-required-plugin-to-primeng.html (direct URL fetch failed twice with "Failed to extract meaningful content" — content instead retrieved via OneCX MCP tool `about_onecx`, which is an approved fallback source per rules)
- Applicability: **must-have** — repo uses `primeng` (confirmed in package.json), doc states "these changes are required for apps using PrimeNG only".
- Repository evidence: `primeng@^17.18.11` in [package.json](package.json); will become `^19.0.0` after C.1. Plugin adds a `document.createElement` patch + `Theme.setLoadedStyleName` no-op patch scoped to `primeng` module resources, via `modify-source-webpack-plugin@^4`.
- Sub-steps executed: [TBD]
- Files changed: [TBD]
- Validation: build [TBD] | lint [TBD] | test [TBD]
- Final outcome: [TBD]

**[C.13]. Add Webpack Plugin for Angular Material**

- [ ] not started
- Source page: https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/add-angular-material-plugin.html
- Applicability: **likely not applicable, needs confirmation at execution time** — `@angular/cdk` IS present in [package.json](package.json) (line 41 area) but grep for direct `from '@angular/cdk'` imports in `src/` returned 0 matches (cdk appears to be only a transitive dependency, likely pulled in by `primeng`/`@angular/material`-adjacent tooling, not used directly). `@angular/material` itself is NOT a dependency at all. Doc's webpack `test` function matches on `module.resource.includes('@angular/cdk')` at the bundling level, which could still trigger even without a direct source import — executor MUST verify by checking the actual webpack module graph / build output, not just source-level greps, before marking `[-]`.
- Repository evidence: `@angular/cdk: ^18.2.12` in [package.json](package.json); no `@angular/material` dependency; no direct `@angular/cdk` imports found in `src/**/*.ts`.
- Sub-steps executed: [TBD]
- Files changed: [TBD]
- Validation: build [TBD] | lint [TBD] | test [TBD]
- Final outcome: [TBD]

**[C.14]. Provide ThemeConfig**

- [ ] not started
- Source page: https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/provide-theme-config.html
- Applicability: **must-have** — repo uses primeng (doc: "required for apps using PrimeNG only"). Per custom rule in `migration-18-19.instructions.md`: apply to all `@NgModule` files AND all `bootstrapRemoteComponent` files.
- Repository evidence: primeng confirmed as dependency; [src/app/app.module.ts](src/app/app.module.ts) and [src/app/onecx-parameter-remote.module.ts](src/app/onecx-parameter-remote.module.ts) are the two `@NgModule`-based entrypoints that will need `provideThemeConfig()` from `@onecx/angular-utils` added to their `providers` arrays.
- Sub-steps executed: [TBD]
- Files changed: [TBD]
- Validation: build [TBD] | lint [TBD] | test [TBD]
- Final outcome: [TBD]

**[C.15]. Update Webpack Config to Use Dynamic Shared Entries**

- [ ] not started
- Source page: https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/update-webpack-config.html
- Applicability: must-have
- Repository evidence: current [webpack.config.js](webpack.config.js) uses a fully hardcoded `share({...})` object listing ~19 individual packages (lines 10–32) — doc requires replacing this with a loop using `getOneCXSharedRecommendations` from `@onecx/accelerator` over `Object.keys(dependencies)` from `package.json`.
- Sub-steps executed: [TBD]
- Files changed: [TBD]
- Validation: build [TBD] | lint [TBD] | test [TBD]
- Final outcome: [TBD]

---

### Phase C: Error Recovery Loop (After All Phase C Tasks Complete)

- [ ] Rerun: npm run build (should now pass)
- [ ] Rerun: npm run lint (must pass — 0 errors, vs baseline 0 warnings)
- [ ] Rerun: npm run test (should pass, coverage at or above 100% baseline)
- [ ] For each error recorded during Phase C: check if NOW fixed → update entry
- [ ] Remaining unfixed errors: document for manual fix, add to blockers

---

## Current Session Context

<!-- Updated continuously — helps resume across chat sessions -->

- Last executed step: Phase 1 planning complete — baseline checks passed, documentation discovered, task tree built for Angular 18→19 leg.
- Next planned step: Await developer review of Phase A task list, then begin executing A.1 (Remove @onecx/keycloak-auth) on "Continue execution" command.
- Open issues/blockers: None. Two tentative "not applicable" calls (A.5, A.6, A.7, A.8) need re-confirmation by executor with fresh grep at execution time before marking `[-]` per rules (not skipped outright by planner).
- Recent discoveries: `add-required-plugin-to-primeng.html` does not render via direct fetch (returns "Failed to extract meaningful content" both attempts) — content was successfully retrieved via the OneCX MCP `about_onecx` tool instead; this MCP fallback should be preferred for that specific page going forward.

---

## Error Log Repository

| Timestamp  | Phase | Error (last 20 lines) | Root Cause | Fix Applied | Result |
| ---------- | ----- | --------------------- | ---------- | ----------- | ------ |
| (none yet) | —     | —                     | —          | —           | —      |

---

## Decision Log

| Decision                                                        | Rationale                                                                                                                                                                                                                                                      | Alternatives Considered                                                                                                                                                                                                                                                                                        | Date       |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Task granularity = 1 task per linked doc page (not per raw H2)  | Matches convention already established in `.github/instructions/migration-18-19.instructions.md`'s "Task-Specific Applicability Rules" section, itself derived from verified real-world reference migrations (ct-management-page, supplier-rules-regular-page) | Splitting every H2 into its own task (generic planner default) — rejected as it would fragment tightly-coupled sub-steps (e.g. splitting "Update Component Imports"'s 4 sections into 4 separate tasks) inconsistent with how the custom instructions file already documents applicability per whole-page task | 2026-07-16 |
| Used OneCX MCP fallback for add-required-plugin-to-primeng.html | Direct URL fetch failed twice ("Failed to extract meaningful content")                                                                                                                                                                                         | Retried the same URL fetch a 2nd time first (still failed) before falling back to MCP, per 2-attempt-before-alternative rule                                                                                                                                                                                   | 2026-07-16 |
| Follow official Angular Update Guide (not NX guide) for Phase B | Confirmed no `nx.json`/`workspace.json` in repo — plain Angular CLI workspace                                                                                                                                                                                  | N/A                                                                                                                                                                                                                                                                                                            | 2026-07-16 |

---

## Summary

**Start date:** 2026-07-16
**End date:** [pending]
**Total tasks:** 25 (Phase A: 9 tasks + 1 build-state-record, Phase C: 15)
**Completed:** 0
**Skipped:** 0

**Test coverage baseline:** 100% → **Final coverage:** [pending]
**Lint warning baseline:** 0 → **Final lint warnings:** [pending]

**Critical blockers:** none

**Sign-off:** [pending]
