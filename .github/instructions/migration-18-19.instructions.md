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
