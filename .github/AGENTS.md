# OneCX Angular Migration Workspace

This workspace runs an AI-assisted Angular version migration for OneCX microfrontend applications.

- **MIGRATION_PROGRESS.md** is the single source of truth for all task state
- All migration tasks are derived from official documentation — never invented
- Orchestrator chains executor spawns (one task each) with smart stop conditions
- Validation order is always: build → lint → test (every task, every phase)
- When documentation is unclear or contradictory, stop and ask the user
- Use `@migration-orchestrator` to start, continue, skip, or check status
