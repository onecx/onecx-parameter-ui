---
name: Angular 19 to 20 Migration Data
description: Version-specific migration URLs, version mappings, known issues, and special rules for Angular 19 to 20
---

# Angular 19 → 20 Migration Data

<!--
  This file contains ALL version-specific data for Angular 19 → 20.
  It is NOT auto-injected (no applyTo). Agents read it on-demand.
-->

## Documentation Sources

- OneCX MCP -> about_onecx
  OneCX migration index: https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-20/index.html
  Verified sub-pages (from a real completed migration's MIGRATION_PROGRESS.md — see Verified Reference Repo below):
  - .../angular-20/remove-keycloak-js.html (2 H2 → 2 tasks)
  - .../angular-20/remove-shell-core.html (0 H2 → 1 task, whole page)
  - .../angular-20/update-v7-packages.html (1 H2 → 1 task)
  - .../angular-20/adjust-ngrx-accelerator.html (0 H2 → 1 task, whole page)
  - .../angular-20/update-primeng-package.html (2 H2 → 2 tasks)
  - .../angular-20/update-style-package.html (2 H2 → 2 tasks)
  - .../angular-20/migrate-to-onecx-translate-loader.html (3 H2 → 3 tasks)
  - .../angular-20/use-new-object-detail-item-interface.html (0 H2 → 1 task, whole page)
  - .../angular-20/portal-dialog-service-signature-changes.html (2 H2 → 2 tasks)
  - .../angular-20/updated-guards-usage.html (0 H2 → 1 task, whole page)
- PrimeNG MCP -> mcp_primeng_migrate_v19_to_v20 (single hop, v19→v20 — no intermediate guide needed)
  Fallback PrimeNG migration guide: https://primeng.org/migration/v20
- Nx mcp -> nx-mcp (only relevant if nx.json present; our repo is NOT an Nx workspace — confirm before use)

## Target Versions (verified via real working package.json diff — see below)

- @angular/core (and all @angular/* animations/cdk/common/compiler/elements/forms/material/platform-browser/platform-browser-dynamic/router): ^20.3.25
- @angular-architects/module-federation: ^20.0.0
- @angular-devkit/architect: ^0.2003.28
- @angular-devkit/build-angular / @angular-eslint/* / @angular/cli / @angular/compiler-cli: ^20.3.28 / ^20.0.0 / ^20.3.25 (exact patch varies — resolve via `npm view <pkg> dist-tags` at execution time)
- @onecx/* (angular-accelerator, angular-auth, angular-integration-interface, angular-utils, angular-webcomponents, ngrx-accelerator, accelerator): ^7.10.0 (our repo starts at 5.x, so this migration REQUIRES the intermediate 18→19 hop to 6.x first — confirm 6.x → 7.x jump is the documented path, not a direct 5.x→7.x jump)
- @ngx-translate/core: ^17.0.0; @ngx-translate/http-loader: ^17.0.0 (jumped from 8.x to match core's major — NOT a typo)
- primeng: ^20.3.0 (was ^19.0.0 in the 19-leg source)
- ngx-build-plus: ^20.0.0
- typescript: ~5.9.3 (was ~5.8.3)
- webpack: stays 5.94.0 (unchanged)
- Node.js minimum: check @angular/cli ^20 engines field

## Verified Reference Repo: supplier-rules-regular-page (Angular 19→20, JIRA DIGIHUB-370710)

Local path: `/home/suhail/projects/gandalf/supplier-rules-regular-page` (git history intact, NOT ours to modify).
Main migration commit: `c5177555965cf61cb78f499713f3541a927fcd7c` ("feat: DIGIHUB-370710 Angular 19→20 migration") on branch `develop`, tag `1.38.0-rc.6`.
Follow-up fix commit: `8e449b5cb3362e90f6930a18acdfba2fbd902e36` ("fix : DIGIHUB-375087 SRR-after-Angular-upgrade-fix") — separate ticket (DIGIHUB-375087) but directly addresses bugs surfaced by the Angular 20 upgrade (PrimeNG API + float-label CSS regressions).
**This repo has its own complete `MIGRATION_PROGRESS.md` at its root — read it in full as a structural template for task granularity/phase format before/while planning our own.** It documents the exact doc pages fetched, H2 counts, dependency table, and Phase 1 baseline records for this exact migration leg.

### Verified dependency version bumps (from real working package.json diff, commit c517755)
- All `@angular/*`: `^19.1.8` → `^20.3.25` (cdk/material at `^19.1.5` → `^20.2.14`)
- `@angular-architects/module-federation`: `^19.0.3` → `^20.0.0`
- `@angular-devkit/architect`: `^0.1901.9` → `^0.2003.28`
- `@ngx-translate/core`: `^16.0.0` → `^17.0.0`; `@ngx-translate/http-loader`: `^8.0.0` → `^17.0.0`
- `@onecx/angular-accelerator`, `angular-auth`, `angular-integration-interface`, `angular-utils`, `angular-webcomponents`, `ngrx-accelerator`: `^6.20.0` → `^7.10.0`; NEW added `@onecx/accelerator: ^7.10.0`
- `primeng`: `^19.0.0` → `^20.3.0`
- `@angular-devkit/build-angular`, `@angular-eslint/*`, `@angular/cli`, `@angular/compiler-cli`: → `^20.3.28`/`^20.0.0`/`^20.3.25`
- `ngx-build-plus`: `^19.0.0` → `^20.0.0`
- `typescript`: `~5.8.3` → `~5.9.3`
- `webpack`: unchanged at `5.94.0`

### Verified code pattern changes (from real diff, commit c517755 — applicable to onecx-parameter-ui's app.module.ts / onecx-parameter-remote.module.ts)
- **DOCUMENT token**: `import { DOCUMENT } from '@angular/common'` → moved to `import { DOCUMENT } from '@angular/core'` (breaking change in Angular 20). Search and update every `DOCUMENT` import.
- **@ngx-translate/core v17 API overhaul** (major breaking change — module-based config fully removed):
  - Old: `TranslateModule.forRoot({ loader: { provide: TranslateLoader, useFactory: combinedTranslateLoader, deps: [HttpClient] } })`
  - New: import `TranslateModule` (bare, no `.forRoot()`) into `imports`, then in `providers` add:
    ```ts
    provideTranslateService({
      defaultLanguage: 'en',
      loader: provideTranslateLoader(OnecxTranslateLoader),
      missingTranslationHandler: provideMissingTranslationHandler(MultiLanguageMissingTranslationHandler)
    })
    ```
  - `OnecxTranslateLoader` and `MultiLanguageMissingTranslationHandler` are now exported from `@onecx/angular-utils` (NOT from ngx-translate or angular-accelerator).
  - For remote/microfrontend module: same pattern but add `extend: true` to the `provideTranslateService({...})` options object (matches the old `TranslateModule.forRoot({ extend: true, isolate: false, ... })` semantics — `isolate` option appears to be dropped/no longer needed).
- **provideThemeConfig subpath change**: `import { provideThemeConfig } from '@onecx/angular-utils'` → `import { provideThemeConfig } from '@onecx/angular-utils/theme/primeng'` (moved to a dedicated subpath). Do NOT still import it from the bare `@onecx/angular-utils` root.
- **providePrimeNG() REMOVED**: no longer called explicitly in app.module.ts/remote.module.ts providers — theme config now fully handled via `provideThemeConfig()`. Remove any leftover `providePrimeNG()` call after this leg (it WAS required in the 18→19 leg — see migration-18-19.instructions.md's "Post-Migration Import Corrections" — but is REMOVED again here in 19→20).
- **PrimeNG `CalendarModule`**: fully removed (already deprecated since 18/19) — confirm all usages migrated to `DatePickerModule` (`primeng/datepicker`) if not already done in the 18→19 leg.
- **AngularAcceleratorModule**: added to remote.module.ts `imports` array alongside `AngularAuthModule`, `PortalPageComponent`, etc. (from `@onecx/angular-accelerator`).
- **Angular Material CSS custom property renames** (if using Angular Material — onecx-parameter-ui may not, verify first): `--mdc-plain-tooltip-*` → `--mat-tooltip-*`; `--mdc-icon-button-icon-size` → `--mat-icon-button-icon-size`. Search all `.scss` files for `--mdc-` prefixed custom properties if Angular Material is used.
- **angular.json**: add a top-level `"schematics"` block configuring `typeSeparator: "."` for `guard`/`interceptor`/`module`/`pipe`/`resolver` schematics, and `"type"` for `component`/`directive`/`service` (Angular 20 CLI schematic naming convention default change — cosmetic, only affects future `ng generate` output, not existing files. Low priority, apply if docs confirm).
- **webpack.config.js — shared config simplification (IMPORTANT, potentially very relevant to onecx-parameter-ui)**: the manual hardcoded `shared: share({ '@angular/core': {...}, ... })` map was REPLACED with a dynamically generated one using a new OneCX helper:
  ```js
  const { getOneCXSharedRecommendations } = require('@onecx/accelerator')
  const { dependencies } = require('./package.json')
  const sharedEntries = {}
  for (const libName of Object.keys(dependencies)) {
    const result = getOneCXSharedRecommendations(libName, { requiredVersion: 'auto', includeSecondaries: true })
    if (result !== false) {
      sharedEntries[libName] = result
    }
  }
  // ...
  shared: share(sharedEntries),
  ```
  This requires `@onecx/accelerator` to export `getOneCXSharedRecommendations` — verify this exists in the ^7.x version before adopting (check `node_modules/@onecx/accelerator/package.json` exports / `public_api.ts` per the hard rules' 4-step unresolvable-import check). This is the documented v7 idiomatic pattern — prefer it over manually maintaining the shared map if docs confirm it during Phase C.

### Post-migration regressions fixed in follow-up commit 8e449b5 (PrimeNG 20 pitfalls to watch for)
- `p-autoComplete`: `field` input renamed to `optionLabel` in PrimeNG 20. Search all `.html` files for `<p-autoComplete ... field="...">` and rename to `optionLabel="..."`.
- PrimeNG float-label CSS: class name changed/dual-support needed — both `.p-float-label-active` (old) and `.p-floatlabel-active` (new) selectors may need to coexist in custom SCSS overriding float-label positioning. `transform: translateX(-50%)` syntax needed updating to `transform: translate(-50%, 0)` for the new PrimeNG float-label DOM structure. If custom SCSS overrides float-label positioning (search for `.p-float-label` / `.p-floatlabel` in `.scss` files), expect to need both class variants and the new transform syntax.

## Known Breaking Changes

<!-- Populate further during Phase 1 documentation discovery via official OneCX/PrimeNG docs -->
- See "Verified code pattern changes" above — all confirmed via a real completed migration, but MUST still be cross-checked against official docs per hard rules (docs are the source of truth for task creation; this reference repo is for verification/comparison only).

## Version-Specific Workarounds

- [Add entries here as discovered during execution]

## @onecx Package Version Map

| Package | Documented Version | Notes |
|---------|-------------------|-------|
| @onecx/angular-accelerator | ^7.10.0 (verified real) | resolve to latest stable 7.x via npm dist-tags at execution time |
| @onecx/angular-auth | ^7.10.0 (verified real) | " |
| @onecx/angular-integration-interface | ^7.10.0 (verified real) | " |
| @onecx/angular-utils | ^7.10.0 (verified real) | " |
| @onecx/angular-webcomponents | ^7.10.0 (verified real) | " |
| @onecx/ngrx-accelerator | ^7.10.0 (verified real) | " |
| @onecx/accelerator | ^7.10.0 (verified real, NEW dep) | required for getOneCXSharedRecommendations webpack helper |

## Task-Specific Applicability Rules

- Same general applicability-checking discipline as migration-18-19.instructions.md applies: search the ENTIRE repo for every pattern (not just src/), check package.json AND source usage independently, never skip a task just because one sub-condition is absent.
- Before assuming `getOneCXSharedRecommendations` webpack pattern applies: confirm `@onecx/accelerator` v7.x actually exports it (check node_modules or npm registry) — do not blindly adopt from the reference repo without doc/package confirmation.
- Before assuming Angular Material CSS variable renames apply: confirm onecx-parameter-ui actually uses `@angular/material` (check package.json — NOT currently listed as of the 18.2.12 baseline, so this task will likely be `[-]` not applicable unless added during the 18→19 leg).

## PrimeNG-Specific Migration Notes (v19 → v20)
- Use PrimeNG MCP tool `mcp_primeng_migrate_v19_to_v20` first for the authoritative, current list of breaking changes.
- Confirmed from real-world fix commit: `p-autoComplete` `field` → `optionLabel` rename; float-label class/transform changes (see above).
