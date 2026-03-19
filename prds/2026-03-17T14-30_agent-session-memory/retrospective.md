# Retrospective: Agent Session Memory, PM Backlog, and Review Dashboard

Date: 2026-03-18 00:30 UTC
PRD Directory: prds/2026-03-17T14-30_agent-session-memory/

## Summary

- Total PRDs: 3
- Completed: 3
- Failed: 0
- Total tasks: 12
- Completed: 12
- Failed: 0
- Execution mode: Task mode (swarm mode attempted, fell back)
- Files created: 2 (`.claude/context/run-log/.gitkeep`, `.claude/skills/pm-backlog/SKILL.md`)
- Files modified: 10 (3 skill files, 6 agent files, 1 workflow rules file)

---

## What Went Well

- **Planning was clean.** The 3-PRD dependency chain (PRD-01 + PRD-02 independent → PRD-03 dependent) was correctly modeled. No ambiguity at execution time.
- **File conflict detection worked.** `team-review/SKILL.md` was touched by 4 tasks across 3 PRDs and `product-manager.md` by 2 tasks across 2 PRDs. Identifying these before execution and sequencing them prevented corruption.
- **Direct orchestrator execution was reliable.** Once subagent permissions failed, the orchestrator executing all edits directly produced clean, verified results with zero rework.
- **Architecture held under pressure.** The session memory bundle concept — assemble once, deliver inline — remained consistent across all 3 orchestrating skills and all 6 agent files. The schema is uniform.
- **Backlog output chain is complete.** PM produces `BACKLOG_OUTPUT:` → `/team-review` Step 4b writes `backlog.md` → `/pm-backlog` skill reads and updates it. The chain from MCP memory to human-readable file to queryable skill is fully specified.

---

## What Didn't Work

- **Swarm mode tools were unavailable.** `TeamCreate`, `TaskCreate`, `TaskUpdate`, `TaskList` were not found when searched. This blocked the selected execution mode and required fallback to task mode. The engineer selected swarm mode based on a feature description that implied availability — if tools aren't available, the skill should surface this before asking.
- **Subagent Write/Edit permissions were blocked.** All 4 background agents launched in early task mode attempts were denied file write access. This was silently non-obvious until tool calls failed. The orchestrator had to redo all edits directly, duplicating effort.
- **Late background agent completions created noise.** Agents for Tasks 4 and 5 completed after the orchestrator had already applied those changes. Their output had to be inspected and discarded, adding cognitive overhead.

---

## PRD Quality Issues

- **Task 2 spec was underspecified for a multi-edit file.** The PRD specified what to add to `team-review/SKILL.md` in Task 2, but 3 more tasks (PRD-02 Task 2, PRD-03 Tasks 1 and 2) also modified the same file. None of those tasks referenced each other's changes or warned about ordering. A note like "this task runs after PRD-01 Task 2; the existing Step 4 at that point will already include the Session Memory reference line" would have removed ambiguity.
- **No validation step was specified.** The PRDs had acceptance criteria per task but no instruction to verify the overall file was coherent after all sequential edits. A final "read and verify the full file" step would catch drift.
- **Agent line numbers in PRD specs were wrong.** Several tasks referenced specific line numbers (e.g., "lines 12-16") that had shifted by the time the task ran. Anchors were also provided and worked correctly — the line number hints should be removed from future PRDs entirely to avoid confusion.

---

## Patterns to Keep

- **Orchestrator-direct execution for workflow-level tasks.** For tasks that edit `.claude/` infrastructure files (skills, agents, rules), the orchestrator doing edits directly is more reliable than launching subagents that may not have the right permissions. Subagents are better for isolated code changes in `src/`.
- **File manifest upfront.** Building the complete list of which tasks touch which files before any execution begins — and sequencing conflicts before launch — is essential for multi-PRD features that share files.
- **PRD dependency graph drives execution sequencing.** The 3-wave execution (PRD-01+02 in parallel, then PRD-03) was clean because the dependency graph was explicit in the master plan. This should remain a hard requirement.
- **Bundle-then-deliver pattern for context.** The session memory bundle is a good pattern for any multi-agent orchestration. Assemble once, pass inline, no per-agent fetching. The same pattern could apply to other shared context (e.g., lint rules, coding standards).

---

## Suggestions for Next Time

1. **Pre-check swarm tool availability before asking the engineer.** The `/execute` skill should verify `TeamCreate` is callable before presenting swarm mode as an option. If unavailable, show only task mode.
2. **Add explicit subagent permission requirements to skill docs.** Skills that launch subagents with Write access should document that the user's permission mode must allow file writes, or the skill must use orchestrator-direct execution as the default for `.claude/` files.
3. **Remove line number hints from PRD specs.** They create confusion and get stale. Context anchors are sufficient and more robust. Update `prd-format.md` to remove the "lines X-Y" convention.
4. **Add a "conflict check" section to PRDs for files touched by multiple tasks.** When a file is touched by more than one task, add a brief note: "This task runs after Task N; the file at that point will already contain X." This removes ambiguity for sequential execution.
5. **Final coherence check step in multi-edit PRDs.** After all sequential edits to a shared file, add a task or orchestrator step: "Read the full file and verify sections are logically ordered and no edit artifacts remain."

---

## Documentation Updates

No changes to CLAUDE.md or `prd-format.md` are needed immediately, but the following are worth considering:

- **`prd-format.md`:** Add a rule that line number hints should NOT be used — context anchors only. This prevents the stale-line-number problem documented above.
- **`execute/SKILL.md`:** Add a Step 0 pre-check: verify swarm mode tools are available before presenting mode options.

Engineer approval needed before applying either change.
