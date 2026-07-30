---
name: Progress Format
description: Evidence format for MIGRATION_PROGRESS.md task entries
applyTo: '**/MIGRATION_PROGRESS.md'
---

# Task Evidence Format

Each completed task entry in MIGRATION_PROGRESS.md must contain all 8 fields:

1. **Source pages**: URLs fetched during THIS invocation (not from memory)
2. **Applicability**: must-have | nice-to-have | not applicable
3. **Repository evidence**: grep results for EVERY item in the task
4. **Sub-steps executed**: each bullet item — done | not-applicable | not-found
5. **Files changed**: exact file list with paths
6. **Validation**: build/lint/test results in order: build → lint → test
7. **Final outcome**: success | error
8. **Edge cases**: any gotchas, partial applicability notes

Mark `[x]` ONLY when all 8 fields are filled and validation passed.
Mark `[-]` ONLY with grep evidence showing ALL items absent from codebase.

For errors encountered during execution, document the full journey:
original error → root cause → fix applied → re-validation result
