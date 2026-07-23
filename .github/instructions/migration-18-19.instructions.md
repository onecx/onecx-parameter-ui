---
name: Angular 18 to 19 Migration Data
description: Version-specific migration URLs, version mappings, known issues, and special rules for Angular 18 to 19
---

# Angular 18 → 19 Migration Data

<!--
  This file contains ALL version-specific data for Angular 18 → 19.
  It is NOT auto-injected (no applyTo). Agents read it on-demand.
  To support a new migration: copy this file, rename, fill in new data.
-->

## Documentation Sources

- Onecx Mcp -> about_onecx
  Fallback OneCX migration index: https://onecx.github.io/docs/documentation/current/onecx-portal-ui-libs/migrations/angular-19/index.html
- Primeng Mcp -> mcp_primeng_migrate_v19_to_v20
  Fallback PrimeNG migration guide: https://primeng.org/migration/v19
- Nx mcp -> nx-mcp
  Fallback Nx migration guide: https://nx.dev/docs/technologies/angular/migrations

## Target Versions

<!-- Fill in with exact versions from documentation -->
- @angular/core: ^19.x.x
- primeng: ^19.x.x
- nx: ^20.x.x (if applicable)
- typescript: ~5.x.x
- Node.js minimum: 20.x

## PrimeNG Intermediate Guides

<!-- 
  IMPORTANT: Use PrimeNG MCP tools FIRST for migration data:
  - mcp_primeng_migrate_v18_to_v19 (for v18→v19 migration steps)
  - mcp_primeng_get_migration_guide (general migration info)
  Only fall back to URLs if MCP is unavailable or returns no data.
  Note: https://primeng.org/migration/v18 returns 404 — use subdomain URL instead.
-->
- v18 guide: https://v18.primeng.org/guides/migration (PrimeNG v18 migration page — subdomain URL)
- v18 guide (MCP alternative): use MCP tool `mcp_primeng_migrate_v18_to_v19`
- v19 guide: https://primeng.org/migration/v19

## Known Breaking Changes

<!-- List version-specific breaking changes discovered during planning -->
- [Add entries here during Phase 1 documentation discovery]

## Version-Specific Workarounds

<!-- Known issues and their fixes for this migration path -->
- [Add entries here as discovered during execution]

## @onecx Package Version Map

| Package | Documented Version | Notes |
|---------|-------------------|-------|
| [package] | [version] | [source page] |

## Verified Reference Repo: ct-management-page (Angular 18→19, JIRA DIGIHUB-341488)

Local path: `/home/suhail/projects/titans/ct-management-page` (git history intact).
Main migration commit: `b63b3368d9fd54e7b27cb6dca3d071b3ee209099` ("Feat DIGIHUB-341488 Angular and onecx version upgrade").
Follow-up fix commits (all tagged `DIGIHUB-341488`, mostly CSS/theme touch-ups after the main commit): `7851355d`, `4e40166d`, `119eaf0d`, `3335bfc7`, `c19ccf96`, `6b79eca4`, `8e5387df`/`1b5fbda2`/`2b3ceb6a` (3 identical "Angular version observation" commits on parallel branches — same diff), `b4874ae1`/`5a67fc75`/`a355b8f7` (comment CSS fix, 3x same diff), `331395a9`/`a9356766`/`169ae83d` (waiting-reason CSS fix, 3x same diff), `4b1f5325`, `160b04cf` (a revert, later re-applied), `1358b05c`, `e1c21405`, `e03938d9`/`eaf0b2fe`/`573aceb8`/`cb6d7842`/`4b04e07c` ("part2" — eslint/sonar/misc fixes).
Consolidated squashed diff available: parent commit `7063a6e9c81dd26f7ffd71ca6840f733756d4cbb` → final commit `4b04e07c` gives the true end-state delta (use `git diff 7063a6e9 4b04e07c -- <file>` in that repo to re-pull if needed).

### Verified dependency version bumps (from real working package.json diff)
- `@angular/*` (animations, cdk, common, compiler, core, elements, forms, material, platform-browser, platform-browser-dynamic, router): `^18.1.2` → `^19.2.14`
- `@angular-devkit/build-angular`, `@angular-eslint/*`, `@angular/cli`, `@angular/compiler-cli`: → `^19.2.14`/`~19.2.14`
- `@ngrx/component`, `@ngrx/effects`, `@ngrx/router-store`, `@ngrx/store`, `@ngrx/store-devtools`: `^18.0.1` → `^19.2.1`
- `@ngx-translate/core`: `^15.0.0` → `^16.0.4`
- `@onecx/*` (accelerator, angular-accelerator, angular-auth, angular-integration-interface, angular-remote-components, angular-testing, angular-utils, angular-webcomponents, integration-interface, ngrx-accelerator): `^5.50.0` → `^6.11.0` — **NOTE: our repo is currently on `^5.47.5`, so resolve to latest stable 6.x via `npm view <pkg> dist-tags` rather than hardcoding 6.11.0**
- `@onecx/keycloak-auth`, `@onecx/portal-integration-angular`, `@onecx/portal-layout-styles` — NOT present in ct-management-page's package.json at all (before or after), so this reference repo doesn't prove what happens to these three for onecx-parameter-ui, which DOES depend on all three currently. Must rely on official docs for their v6 replacement/removal (see Post-Migration Import Corrections section above — these map to `@onecx/angular-accelerator`/`@onecx/angular-utils` functional providers).
- NEW added: `@onecx/nx-plugin: ^1.13.1`, `@primeng/themes: ^19.0.0`, `modify-source-webpack-plugin: ^4.1.0`
- `keycloak-angular`: `^16.0.1` → `^19.0.2` (keycloak-js stayed `^25.0.2`)
- `primeflex`: `^3.3.1` → `^4.0.0`; `primeng`: `^17.18.7` → `^19.1.3`
- `rxjs`: `~7.8.1` → `~7.8.2`; `zone.js`: `~0.14.10` → `~0.15.1`
- `ngx-build-plus`: `^18.0.0` → `^19.0.0`; NEW devDependency `webpack: 5.94.0` (pinned exact)
- `build` script simplified: removed a manual `cp dist/.../styles.*.css dist/.../styles.css` step — became just `"ng build"`

### Verified code pattern changes (from consolidated diff, applicable structurally to onecx-parameter-ui's app.module.ts / onecx-parameter-remote.module.ts)
- `PortalCoreModule.forRoot(...)` / `PortalCoreModule.forMicroFrontend()` from `@onecx/portal-integration-angular` — REMOVED. Replaced by importing `AngularAcceleratorModule` from `@onecx/angular-accelerator` plus explicit functional providers: `provideThemeConfig()`, `provideAngularUtils()` (both from `@onecx/angular-utils`), `provideTokenInterceptor()` (from `@onecx/angular-auth`), `providePortalDialogService()` (from `@onecx/angular-accelerator`), `provideTranslationConnectionService()` (from `@onecx/angular-utils`).
- `KeycloakAuthModule` import from `@onecx/keycloak-auth` — REMOVED entirely; replaced by `provideTokenInterceptor()` from `@onecx/angular-auth`.
- `addInitializeModuleGuard(routes)` — REMOVED; just use `RouterModule.forRoot(routes)` directly.
- `translateServiceInitializer` (old `APP_INITIALIZER` factory from portal-integration-angular) — REMOVED; the router `APP_INITIALIZER` now solely uses `initializeRouter` from `@onecx/angular-webcomponents` with `deps: [Router, AppStateService]`.
- `StoreModule.forRoot(reducers, {metaReducers})` / `StoreDevtoolsModule.instrument({...})` (NgModule style) — replaced with functional `provideStore(reducers, {metaReducers})` / `provideStoreDevtools({...})` from `@ngrx/store` / `@ngrx/store-devtools` (same options object).
- Constructor injection replaced with `inject()` function calls in several components (e.g. `AppEntrypointComponent`) — `PrimeNGConfig` from `primeng/api` renamed to `PrimeNG` from `primeng/config`.
- Components using `@NgModule` declarations (not standalone) need explicit `standalone: false` in the `@Component` decorator (Angular 19 schematics default new components to standalone).
- `.eslintrc.json`: if any legacy NgModule-based files remain, add an override block disabling `@angular-eslint/prefer-standalone` scoped to those files/folders (new lint rule enabled by `@angular-eslint` v19 schematics flags standalone-preference by default).
- `angular.json`: `assets` array glob entries pointing at `@onecx/portal-integration-angular/assets/` removed (package no longer used this way); `styles` array changed from bare string paths to object form `{ "input": "src/styles.scss", "bundleName": "styles", "inject": true }`; `outputHashing` changed from `"all"` to `"none"` in production config in this specific repo (verify against our own current angular.json before blindly copying — this may be app-specific, not a hard requirement).
- `webpack.config.js`: already contains `module: { parser: { javascript: { importMeta: false } } }` in OUR onecx-parameter-ui repo (confirmed via read) — this is the SAME fix ct-management-page added during their 18→19 migration to suppress webpack's `import.meta` parsing errors. Since we already have it, do NOT re-add — but note it does NOT eliminate the separate `AutoPublicPathRuntimeModule`-injected `import.meta.url` issue in `styles.js` for direct/standalone access (see repo memory `onecx-dev-local-setup.md` for the fully diagnosed, already-resolved-by-avoidance root cause of that separate issue).
- ct-management-page's webpack.config.js ALSO added a `ModifySourcePlugin` patching PrimeNG's compiled `document.createElement(...)` calls and `Theme.setLoadedStyleName` to work around a PrimeNG-in-module-federation style-loading issue. This is app-specific (uses Leaflet + custom elements) — do NOT copy blindly into onecx-parameter-ui; only apply if the same specific symptom (PrimeNG theme/style double-injection error) is observed during our own Phase B/C validation.

## Special Migration Rules (Angular 18 → 19 Specific)

These rules apply specifically to the Angular 18 → 19 migration path:

- **Styles handling**: Apply styles.scss changes exactly as documented. If conflict between Nx styles array and Sass @import → STOP and ask which pattern to use
- **Standalone components**: If error "Component is standalone, and cannot be declared in an NgModule" → add `standalone: false` and document why
- **Angular version caret**: MUST keep caret (`^`) in package.json for `@angular/*` packages — module federation requires compatible version ranges for sharing
- **package-lock.json**: Delete and regenerate with `npm install` at major transition points (after Phase A packages, after Phase C packages) — prevents stale lock file conflicts

## Task-Specific Applicability Rules

These rules MUST be followed when determining whether a task applies. The docs describe WHAT to do — these rules tell you HOW to check applicability. For EVERY task, independently search the ENTIRE codebase for ALL patterns listed below.

### Adjust Standalone Mode
- Replacement for `<ocx-portal-viewport>` from `@onecx/portal-integration-angular` `<ocx-standalone-shell-viewport>` IS from `@onecx/angular-standalone-shell`.
- **Applicability**: Search ALL `.html` files for `<ocx-portal-viewport>`. If found → task applies regardless of whether `@onecx/standalone-shell` is in `package.json`.
- Do NOT skip this task just because `@onecx/standalone-shell` is absent from `package.json`.

### Update Component Imports
- For EACH section in the doc, search `.ts` files for imports of the listed component/service/directive names from the OLD package.
- If ANY import from a section is found → apply that entire section.
- Check each section independently — one section being N/A does NOT mean others are.

### Remove MenuService
- Search `.ts` files for `MenuService` imports from `@onecx/portal-integration-angular` and constructor/property references.

### Provide ThemeConfig
- Applies ONLY if `primeng` is a dependency in `package.json`.
- If primeng is present, apply to all `@NgModule` files AND all `bootstrapRemoteComponent` files make sure you add provideThemeConfig() from '@onecx/angular-utils' as a provider.

### Replace BASE_URL
- Search `.ts` files for `BASE_URL` from `@onecx/angular-remote-components` or `bootstrapRemoteComponent()` calls.

### Remove @onecx/portal-layout-styles
- For the "Expose styles.css" section: check for `nx.json` or `workspace.json` in project root → NX; otherwise → Angular CLI. Apply the matching config approach.

### Update Theme Service
- The doc says "Remove `apply()` function calls" then provides a custom `apply()` implementation. This is NOT contradictory — remove the ThemeService.apply() calls, and IF the app needs temporary theme previews, implement the provided custom function as a replacement.

### Update Translations
- Check the Official onecx docs for changes and replacements
- Check for each example patterns from documentation and analyze and then do the replacements
- Remove following code ie `translateServiceInitializer` from providers and replace with provideTranslationPathFromMeta(import.meta.url, 'assets/i18n/'), from `@onecx/angular-utils` in providers arrays (IMPORTANT)
```
    {
      provide: APP_INITIALIZER,
      useFactory: translateServiceInitializer,
      multi: true,
      deps: [UserService, TranslateService]
    },
```
- Only for `provideTranslationConnectionService()` from `@onecx/angular-utils` It's okay if it is not added now you can mark this `Update Translation Path Factories — Update Imports` as Complete with other changes/subtask Done. Add `provideTranslationConnectionService()` from `@onecx/angular-utils` in post migration after packages updated.


### Replace BASE_URL / REMOTE_COMPONENT_CONFIG
- If `REMOTE_COMPONENT_CONFIG` provider exists in both `bootstrap.ts` and `component.ts`, keep it ONLY in `bootstrap.ts`. Remove from `component.ts` to avoid duplication.


## PrimeNG-Specific Migration Notes (v18 → v19)
- Use PrimeNG MCP tools (e.g. `mcp_primeng_migrate_v18_to_v19`) to check for component-specific API changes
- Make sure you add providePrimeNG() in remote-modules and app-module
- Any erros related to primeng make sure to query primeng mcp server also trace through node_modules for possible imports changes or inputs/outputs eventbinding changes if needed.
These are known PrimeNG breaking changes. Use PrimeNG MCP tools to get the full list, but watch for these common ones:
Examples: 
- `InputTextareaModule` was renamed to `TextareaModule` — update all imports
- `p-checkbox` `[label]` property was removed — use a separate `<label>` element instead
- Check if modules like `CheckboxModule`, `ButtonModule`, `MessageModule`, `BadgeModule`, `SelectModule`, `FloatLabelModule` need to be added to shared module imports/exports (varies per app)


## Post-Migration Import Corrections
- In providers add `provideAnimations()` from `@angular/platform-browser/animations` in module providers arrays  (IMPORTANT)
- In providers add `provideAngularUtils()` from `@onecx/angular-utils`  (IMPORTANT)
- In providers add `provideTranslationConnectionService()` from `@onecx/angular-utils`  (IMPORTANT)
- The imports components, services and directives need to be changed from `@onecx/portal-integration-angular` and `@onecx/onecx/portal-layout-styles`
- Check the Official onecx docs for changes and replacements
- If any erros occurs due to imports from `@onecx/portal-integration-angular` and `@onecx/onecx/portal-layout-styles` make sure you search in `node_modules/@onecx` for their replacement or where they are moved.


## Common Real-World Patterns (From workspace-ui, shell-ui)

These patterns were observed in real OneCX Angular 18 → 19 migrations:

```
Pattern 1: Component with DataView
  Old: <p-table> + external dataviewcontrols or <p-dataview> + dataviewcontrols
  New: <ocx-interactive-data-view> with [actionColumnPosition]="'left'"

Pattern 2: CSS imports
  Old: @import '~@onecx/...';
  New: @import '@onecx/.../styles.scss';
  Example: shell-ui/src/assets/styles.scss

Pattern 3: Permission mapping
  Common mistake: Everything mapped to #DELETE or #EDIT
  Correct: Use #SEARCH, #IMPORT, #EXPORT, #EDIT per action
  Example: workspace-ui/src/app/permissions.ts

Pattern 4: Form error handling
  Old: Standard error messages
  New: Add [controlErrorsIgnore]="true" for NG 0203 errors
  Example: announcement-ui/src/app/forms/
```

If task relates to above patterns:
1. Search workspace for existing example
2. Copy pattern structure
3. Verify imports and paths match
4. Update MIGRATION_PROGRESS.md with reference

## Determine Stable Release (^5 vs ^6 Handling)

When docs specify a version range, resolve to latest STABLE:

| Docs Says | Meaning | Resolution | Command |
|-----------|---------|------------|---------|
| `^19` | Latest 19.x | e.g., 19.2.1 | `npm view @angular/core dist-tags` |
| `^19.2` | Latest 19.2.x | e.g., 19.2.1 | Use latest patch in range |
| `~19.2.1` | Latest 19.2.x | e.g., 19.2.1 | Patch updates only |
| `19.2.1` | Exact version | 19.2.1 | Pin exactly |
| `>=19` | At least 19.0.0 | Latest 19.x | Use latest stable |
| `^6` (single digit) | Latest 6.x | Look up via npm | `npm view <pkg> dist-tags` |
| (silent) | Unknown | ASK USER | "Docs don't specify version" |

- NEVER use `@latest` tag (might get beta/RC)
- NEVER use bare caret in install command (resolve first)
- If version/release NOT found → SKIP that package (keep current, don't break build)
