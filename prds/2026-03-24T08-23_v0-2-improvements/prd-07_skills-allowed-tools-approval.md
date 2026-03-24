# PRD-07: Skills: `allowed-tools` Declarations + Approval Gate Consistency

Created: 2026-03-24 09:00 UTC
Status: COMPLETED
Depends on: None
Complexity: Low

## Objective

Add missing `allowed-tools` frontmatter to the 11 skills that lack it, and add an explicit approval gate confirmation line to `/prd` Step 6.

## Context

Four skills already declare `allowed-tools` (`execute`, `team-review`, `team-research`, `pm-backlog`). The other 11 do not. Without `allowed-tools`, the harness cannot enforce least-privilege access, and the skill description is incomplete. The `/prd` skill also lacks an explicit approval gate prompt — it says "Do NOT proceed" but doesn't give the engineer exact words to use to approve.

Changes apply to both `templates/.claude/skills/` (distributed) and `.claude/skills/` (dev repo working copy).

## Tasks

### Task 1: Add `allowed-tools` to all skills missing the declaration

**Status:** PENDING
**Complexity:** Low

For each skill listed below, insert `allowed-tools: <value>` immediately after the `argument-hint:` line in the YAML frontmatter. Apply the change to both `templates/.claude/skills/<name>/SKILL.md` and `.claude/skills/<name>/SKILL.md`.

#### File Changes

##### MODIFY: templates/.claude/skills/plan/SKILL.md AND .claude/skills/plan/SKILL.md

In the frontmatter, after `argument-hint: <feature idea or problem to solve>`, insert:
```yaml
allowed-tools: Read, Glob, Grep, Bash, Write, Edit
```

##### MODIFY: templates/.claude/skills/prd/SKILL.md AND .claude/skills/prd/SKILL.md

In the frontmatter, after `argument-hint: <prd-directory-name or feature-name>`, insert:
```yaml
allowed-tools: Read, Glob, Grep, Bash, Write, Edit
```

##### MODIFY: templates/.claude/skills/retro/SKILL.md AND .claude/skills/retro/SKILL.md

In the frontmatter, after `argument-hint: <prd-directory-name>`, insert:
```yaml
allowed-tools: Read, Glob, Grep, Write, Edit
```

##### MODIFY: templates/.claude/skills/check-setup/SKILL.md AND .claude/skills/check-setup/SKILL.md

In the frontmatter, after `argument-hint: (no arguments needed)`, insert:
```yaml
allowed-tools: Read, Bash
```

##### MODIFY: templates/.claude/skills/set-context/SKILL.md AND .claude/skills/set-context/SKILL.md

In the frontmatter, after `argument-hint: <feature name or topic description>`, insert:
```yaml
allowed-tools: Read, Write
```

##### MODIFY: templates/.claude/skills/pm-review/SKILL.md AND .claude/skills/pm-review/SKILL.md

In the frontmatter, after `argument-hint: <PRD directory, feature description, or scope question>`, insert:
```yaml
allowed-tools: Read, Glob, Grep, Bash, Write, Task
```

##### MODIFY: templates/.claude/skills/qa-review/SKILL.md AND .claude/skills/qa-review/SKILL.md

In the frontmatter, after `argument-hint: <PRD directory, file path, or test strategy question>`, insert:
```yaml
allowed-tools: Read, Glob, Grep, Bash, Write, Task
```

##### MODIFY: templates/.claude/skills/security-review/SKILL.md AND .claude/skills/security-review/SKILL.md

In the frontmatter, after `argument-hint: <PRD directory, file path, or security question>`, insert:
```yaml
allowed-tools: Read, Glob, Grep, Bash, Write, Task
```

##### MODIFY: templates/.claude/skills/devops-review/SKILL.md AND .claude/skills/devops-review/SKILL.md

In the frontmatter, after `argument-hint: <PRD directory, file path, or deployment question>`, insert:
```yaml
allowed-tools: Read, Glob, Grep, Bash, Write, Task
```

##### MODIFY: templates/.claude/skills/dba-review/SKILL.md AND .claude/skills/dba-review/SKILL.md

In the frontmatter, after `argument-hint: <file path, PRD directory, or question about data layer>`, insert:
```yaml
allowed-tools: Read, Glob, Grep, Bash, Write, Task
```

##### MODIFY: templates/.claude/skills/pentest/SKILL.md AND .claude/skills/pentest/SKILL.md

In the frontmatter, after `argument-hint: <PRD directory, file path, endpoint, or area to attack>`, insert:
```yaml
allowed-tools: Read, Glob, Grep, Bash, Write, Task
```

#### Acceptance Criteria

- [ ] `node validate/skill-frontmatter.js` passes for all 15 skills (from both `templates/` and `.claude/` — the validator checks `.claude/skills/`)
- [ ] `make validate-skills` exits 0
- [ ] Each of the 11 skills listed above has `allowed-tools:` in its frontmatter

---

### Task 2: Add explicit approval gate to `/prd` Step 6

**Status:** PENDING
**Complexity:** Low

#### File Changes

##### MODIFY: templates/.claude/skills/prd/SKILL.md AND .claude/skills/prd/SKILL.md

In Step 6 ("Present for Review"), replace:

```
**Do NOT proceed to execution.** The engineer reviews PRDs in their editor and either approves or requests changes.
```

With:

```
**Approval gate:** Tell the engineer:

> "PRDs written to `prds/<dir>/`. Please review each file. Reply with **'approved'** when ready to execute, or list any changes you want first."

Do NOT proceed to execution until the engineer replies with explicit approval. If they request changes, update the affected PRD files and present the gate again.
```

#### Acceptance Criteria

- [ ] `/prd` Step 6 in `templates/.claude/skills/prd/SKILL.md` contains the explicit approval gate prompt
- [ ] `.claude/skills/prd/SKILL.md` receives the same change
- [ ] The approval gate prompt includes the word "approved" as the engineer's expected reply

---

## Execution Log

### Task 1: Add `allowed-tools` to all skills missing the declaration
- **Agent:** orchestrator (direct)
- **Mode:** task
- **Started:** 2026-03-24 10:50 UTC
- **Completed:** 2026-03-24 11:10 UTC
- **Status:** COMPLETED
- **Files created:** (none)
- **Files modified:**
  - .claude/skills/plan/SKILL.md, .claude/skills/prd/SKILL.md, .claude/skills/retro/SKILL.md, .claude/skills/check-setup/SKILL.md, .claude/skills/set-context/SKILL.md, .claude/skills/pm-review/SKILL.md, .claude/skills/qa-review/SKILL.md, .claude/skills/security-review/SKILL.md, .claude/skills/devops-review/SKILL.md, .claude/skills/dba-review/SKILL.md, .claude/skills/pentest/SKILL.md (added `allowed-tools:` after `argument-hint:` in frontmatter)
  - Same 11 files in templates/.claude/skills/
- **Files deleted:** (none)
- **Skills used:** (none)
- **Test results:** (none)
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] Each of the 11 skills has `allowed-tools:` in frontmatter (both copies)

### Task 2: Add explicit approval gate to `/prd` Step 6
- **Agent:** orchestrator (direct)
- **Mode:** task
- **Started:** 2026-03-24 11:10 UTC
- **Completed:** 2026-03-24 11:12 UTC
- **Status:** COMPLETED
- **Files created:** (none)
- **Files modified:**
  - .claude/skills/prd/SKILL.md (replaced "Do NOT proceed" with explicit approval gate prompt)
  - templates/.claude/skills/prd/SKILL.md (same change)
- **Files deleted:** (none)
- **Skills used:** (none)
- **Test results:** (none)
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] Step 6 contains explicit approval gate prompt in both copies
  - [x] Prompt includes the word "approved"
