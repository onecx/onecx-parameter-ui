# OneCX Angular Migration Agent — v5

AI-assisted Angular version migration for OneCX microfrontend applications.

---

## Architecture

```
.github/
├── AGENTS.md                                          — always-on project identity
├── agents/
│   ├── migration-orchestrator.agent.md                — coordinator (user-facing)
│   ├── migration-planner.agent.md                     — discovery & planning (subagent)
│   ├── migration-executor.agent.md                    — task execution (subagent)
│   └── migration-validator.agent.md                   — independent verification (subagent)
├── instructions/
│   ├── migration-rules.instructions.md                — core rules (auto-injected into ALL agents)
│   ├── migration-progress-format.instructions.md      — evidence format (auto-injected on progress file)
│   ├── migration-custom-user.instructions.md          — YOUR project rules (fill in yourself)
│   └── migration-18-19.instructions.md                — version-specific data (fill in yourself)
├── prompts/
│   └── migrate.prompt.md                              — /migrate quick-start command
└── templates/
    ├── MIGRATION_PROGRESS.template.md                 — progress file template
    ├── README.md                                      — this file
    └── tasks.json                                     — VS Code tasks for build/lint/test
```

## How It Works

### Auto-Injection (No Manual File Reading)

Core rules in `migration-rules.instructions.md` have `applyTo: '**'` — VS Code automatically injects them into every agent invocation, including subagents. No "MANDATORY STARTUP PROTOCOL" needed.

**Per-invocation context loaded automatically:**
1. `AGENTS.md` → project identity (~10 lines)
2. `migration-rules.instructions.md` → all hard rules (~65 lines)
3. `migration-custom-user.instructions.md` → your project rules
4. Agent body → role-specific instructions (~80-110 lines)

**Total: ~170-220 lines** (vs ~2,000-2,500 lines manually loaded in v4)

### Agent Roles

| Agent | Role | Visible to User? | Tools |
|-------|------|-------------------|-------|
| **Orchestrator** | Route commands, manage state, enforce phase gates | Yes | read, search, edit, agent, web |
| **Planner** | Discover docs, create MIGRATION_PROGRESS.md (runs ONCE) | No (subagent) | read, search, web, execute |
| **Executor** | Execute ONE task per invocation with full evidence | No (subagent) | read, search, edit, execute, web |
| **Validator** | Verify task completeness, run build/lint/test checks | No (subagent) | read, search, execute |

### Workflow

```
User: /migrate  OR  @migration-orchestrator "Start Phase 1"
  │
  ├─ Orchestrator checks branch, routes to Planner
  │   └─ Planner: audits, discovers docs, creates task tree
  │
  ├─ User: "Continue execution"
  │   └─ Orchestrator routes to Executor (ONE task)
  │       └─ Executor: fetch docs → check repo → execute → validate → update progress
  │
  ├─ User: "Validate"
  │   └─ Orchestrator routes to Validator (independent check)
  │
  ├─ User: "Skip~3"
  │   └─ Orchestrator: marks 3 tasks [-], jumps to next
  │
  └─ Phase gates enforced by Orchestrator at A→B and B→C transitions
```

### Handoffs

After each action, the Orchestrator shows clickable buttons:
- **Continue Execution** — execute next task
- **Skip Tasks** — mark tasks not applicable
- **Show Status** — current progress summary
- **Validate** — independent verification

---

## Quick Start

### 1. Copy to your repo

```bash
cp -r .github/* /path/to/your/repo/.github/
```

### 2. Customize (optional but recommended)

Edit these files for your project:
- `.github/instructions/migration-custom-user.instructions.md` — your project patterns
- `.github/instructions/migration-18-19.instructions.md` — version-specific URLs/data

### 3. Start migration

```
@migration-orchestrator "Start Phase 1"
```

Or use the slash command:
```
/migrate
```

### 4. Execute tasks

```
@migration-orchestrator "Continue execution"
```

Repeat until Phase A is complete. Then approve Phase B upgrade, then continue through Phase C.

---

## Commands

| Command | What It Does |
|---------|--------------|
| `"Start Phase 1"` | Initialize planning, discover docs, create task tree |
| `"Continue execution"` | Execute next task (Phase A, B, or C) |
| `"Skip~N"` | Mark next N tasks not applicable, jump to N+1 |
| `"Status"` | Show current progress from MIGRATION_PROGRESS.md |
| `"Validate"` | Run independent verification (task or phase gate) |
| `"Help"` | Show available commands |

---

## Phases

| Phase | What Happens | Validation |
|-------|-------------|------------|
| **Phase 1** | Audit repo, discover docs, create task tree | Baseline npm install/build/lint/test must all pass |
| **Phase A** | Pre-upgrade code changes (imports, templates, configs) | npm build/lint/test after each task |
| **Phase B** | Core package upgrades (Angular, Nx, PrimeNG) | Requires explicit developer approval gate |
| **Phase C** | Post-upgrade cleanup and fixes | npm build/lint/test after each task |

---

## Key Design Decisions

### Why AGENTS.md instead of copilot-instructions.md?
Users may already have their own `copilot-instructions.md` with project coding standards. Using `AGENTS.md` provides always-on migration context without overwriting developer rules.

### Why `.instructions.md` instead of plain `.md`?
VS Code only auto-detects and injects files ending in `.instructions.md`. Plain `.md` files in the instructions folder are NOT auto-loaded — agents would have to manually read them with file tools, which smaller models often skip.

### Why 4 agents?
- **Orchestrator**: routing logic (needs `agent` tool for subagent calls)
- **Planner**: read-only discovery (separated from execution)
- **Executor**: code changes (full tool access)
- **Validator**: independent verification (can't edit code, only read and run commands)

### Why model fallback lists?
The `model` property in each agent is a prioritized list. VS Code tries each model in order until one is available. This makes the setup work across different subscription tiers.

---

## Troubleshooting

### "npm install fails"
Planner stops at Phase 1. Fix dependency issues locally, then restart Phase 1.

### "Agent doesn't follow the rules"
Check that `migration-rules.instructions.md` has `applyTo: '**'` — this ensures auto-injection.

### "A task seems inapplicable but I'm not sure"
Run it anyway. The executor checks repo evidence and marks it appropriately. Only use `Skip~N` when you're certain.

### "Build passes but tests are pending"
Executor waits. Fix flaky or pending tests, then continue.

### "Model doesn't use subagents correctly"
Verify the orchestrator has `agents: ['migration-planner', 'migration-executor', 'migration-validator']` in its frontmatter.
