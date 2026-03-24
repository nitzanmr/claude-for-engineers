# PRD-09: Agents: Severity Emoji Standardization + DRY Session Bundle Audit

Created: 2026-03-24 09:00 UTC
Status: COMPLETED
Depends on: None
Complexity: Low

## Objective

Standardize the severity emoji scale across all 6 specialist agents (target: 🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low/Notes) and verify that all orchestrating skills reference the session-memory schema rather than inlining assembly steps.

## Context

The `team-review` skill maps each agent's severity labels to a common scale for its severity aggregate. If agents use different scales (some missing 🟠 High, some using "Blockers" instead of "Critical"), the mapping table in `team-review` becomes fragile and the dashboard shows inconsistent data.

Four agents are missing 🟠 High or use non-standard labels. `security-expert` already uses the target scale.

The DRY session bundle check: `execute`, `team-review`, `team-research`, and `pm-review` already reference `.claude/rules/session-memory-schema.md`. The remaining specialist skills (`qa-review`, `security-review`, `devops-review`, `dba-review`, `pentest`) need to be audited — if any still inline assembly steps rather than reference the schema, fix them.

Changes apply to both `templates/.claude/agents/` and `.claude/agents/`, and to both copies of any skill files that need updating.

## Tasks

### Task 1: Standardize severity emoji scale in agents that deviate from the target

**Status:** PENDING
**Complexity:** Low

Target scale for all agent report format sections:
- 🔴 Critical — must fix before merge
- 🟠 High — should fix soon, blocks recommended merge
- 🟡 Medium — fix in follow-up
- 🟢 Low / Notes — informational

#### File Changes

##### MODIFY: templates/.claude/agents/qa-automation.md AND .claude/agents/qa-automation.md

In the **Report Format** section, replace the findings severity headers:

Replace:
```
#### 🔴 Critical gaps (logic exists, no test)
- <location> — <what's untested> — <risk if not tested>

#### 🟡 Weak coverage (tests exist but insufficient)
```

With:
```
#### 🔴 Critical — logic exists with no test at all
- <location> — <what's untested> — <risk if not tested>

#### 🟠 High — security-relevant or core-path logic with weak tests
- <location> — <what's weak> — <suggested improvement>

#### 🟡 Medium — coverage exists but insufficient assertions or missing edge cases
- <location> — <what's weak> — <suggested improvement>

#### 🟢 Notes
```

Also update the severity mapping reference in the **Step 2 Coverage Span Analysis** section to mention the four-level scale.

##### MODIFY: templates/.claude/agents/devops-engineer.md AND .claude/agents/devops-engineer.md

In the **Report Format** section, replace the Deployment Safety severity headers:

Replace:
```
### Deployment Safety
#### 🔴 Blockers (must fix before deploy)
- <issue>

#### 🟡 Risks (should fix, has workaround)
- <issue>

#### 🟢 Cleared
- <item confirmed safe>
```

With:
```
### Deployment Safety
#### 🔴 Critical — blocks deploy, no workaround
- <issue>

#### 🟠 High — should fix before production, workaround exists
- <issue>

#### 🟡 Medium — fix in follow-up sprint
- <issue>

#### 🟢 Notes / Cleared
- <item confirmed safe or informational observation>
```

##### MODIFY: templates/.claude/agents/dba-expert.md AND .claude/agents/dba-expert.md

In the **Report Format** section, replace the Findings severity headers:

Replace:
```
### Findings
#### 🔴 Critical
- <issue> — <file/query/location>

#### 🟡 Warnings
- <issue> — <file/query/location>

#### 🟢 Notes
- <observation>
```

With:
```
### Findings
#### 🔴 Critical — data loss, corruption, or severe performance risk
- <issue> — <file/query/location>

#### 🟠 High — production performance risk or unsafe migration
- <issue> — <file/query/location>

#### 🟡 Medium — correctness concern or suboptimal pattern
- <issue> — <file/query/location>

#### 🟢 Notes
- <observation>
```

##### MODIFY: templates/.claude/agents/penetration-agent.md AND .claude/agents/penetration-agent.md

In the **Report Format** section, replace the Attack Vectors severity headers:

Replace:
```
### Attack Vectors Found
#### 🔴 Exploitable Now
- **Vector:** <type>
- **Location:** <file, function, endpoint>
- **Attack path:** <step-by-step how to exploit>
- **Impact:** <what an attacker gains>
- **Remediation:** <what needs to change>

#### 🟡 Potential Vector (needs confirmation)
- **Vector:** <type>
- **Why suspicious:** <what looks exploitable>
- **Next step to confirm:** <what to test>
```

With:
```
### Attack Vectors Found
#### 🔴 Critical — exploitable now, high impact
- **Vector:** <type>
- **Location:** <file, function, endpoint>
- **Attack path:** <step-by-step how to exploit>
- **Impact:** <what an attacker gains>
- **Remediation:** <what needs to change>

#### 🟠 High — confirmed vulnerability, exploitation requires specific conditions
- **Vector:** <type>
- **Location:** <file, function, endpoint>
- **Attack path:** <step-by-step how to exploit>
- **Remediation:** <what needs to change>

#### 🟡 Medium — potential vector, needs confirmation
- **Vector:** <type>
- **Why suspicious:** <what looks exploitable>
- **Next step to confirm:** <what to test>

#### 🟢 Notes — informational, low-risk observations
- <observation>
```

**Also update `team-review/SKILL.md`** severity mapping table in Step 5 ("Present Review Dashboard") to reflect the standardized scale. Replace the per-agent mappings block:

Replace:
```
- security-expert: 🔴 Critical → Critical, 🟠 High → High, 🟡 Medium → Medium
- code-quality agent: HIGH → High, MEDIUM → Medium, LOW → Low
- dba-expert: 🔴 Critical → Critical, 🟡 Warning → Medium
- devops-engineer: 🔴 Blocker → Critical, 🟡 Risk → Medium
- qa-automation: 🔴 Critical gap → High, 🟡 Weak coverage → Medium
```

With:
```
All specialist agents now use the standard four-level scale:
- 🔴 Critical → Critical
- 🟠 High → High
- 🟡 Medium → Medium
- 🟢 Low / Notes → Low (informational only, not counted in totals)
- code-quality agent: HIGH → High, MEDIUM → Medium, LOW → Low (unchanged)
- spec-compliance agent: MAJOR_DEVIATION → High, MINOR_DEVIATION → Low (unchanged)
```

Update both `templates/.claude/skills/team-review/SKILL.md` and `.claude/skills/team-review/SKILL.md`.

#### Acceptance Criteria

- [ ] `qa-automation` report format contains 🔴/🟠/🟡/🟢 sections
- [ ] `devops-engineer` report format replaces "Blockers"/"Risks" with 🔴/🟠/🟡/🟢
- [ ] `dba-expert` report format adds 🟠 High section
- [ ] `penetration-agent` report format adds 🟠 High and 🟢 Notes sections
- [ ] `security-expert` is unchanged (already uses the standard scale)
- [ ] `team-review` severity mapping table is updated to the simplified standard scale

---

### Task 2: Audit and fix DRY session bundle in specialist review skills

**Status:** PENDING
**Complexity:** Low

#### File Changes

Read the full content of each of these skills to check whether Step 2 (or equivalent) references `.claude/rules/session-memory-schema.md` or inlines assembly steps:

- `templates/.claude/skills/qa-review/SKILL.md`
- `templates/.claude/skills/security-review/SKILL.md`
- `templates/.claude/skills/devops-review/SKILL.md`
- `templates/.claude/skills/dba-review/SKILL.md`
- `templates/.claude/skills/pentest/SKILL.md`

For each skill that **inlines** session bundle assembly steps (e.g., has text like "1. Read current-topic.md", "2. Derive the PRD directory", "3. Save bundle to..."), **replace the inline steps** with:

```markdown
### Step 2: Build Session Memory Bundle

Follow the assembly steps in `.claude/rules/session-memory-schema.md`. Set `Triggered by: /<skill-name>` and `Phase: REVIEW`. Save to `.claude/context/run-log/<run-id>.md`. Pass the full bundle inline in the agent prompt under `## Session Memory`.
```

Apply the same change to both `templates/.claude/skills/<name>/SKILL.md` and `.claude/skills/<name>/SKILL.md` for each affected skill.

If a skill already references the schema correctly, no change needed — note it in the execution log.

#### Acceptance Criteria

- [ ] All 5 specialist review skills are checked
- [ ] Any skill with inline assembly steps is updated to reference the schema
- [ ] Skills that already reference the schema are confirmed and noted
- [ ] Execution log records which skills were changed vs already DRY

---

## Execution Log

### Task 1: Standardize severity emoji scale in agents
- **Agent:** orchestrator (direct)
- **Mode:** task
- **Started:** 2026-03-24 11:30 UTC
- **Completed:** 2026-03-24 11:45 UTC
- **Status:** COMPLETED
- **Files modified:**
  - .claude/agents/qa-automation.md, templates/.claude/agents/qa-automation.md (added 🟠 High and 🟢 Notes sections; renamed 🔴/🟡)
  - .claude/agents/devops-engineer.md, templates/.claude/agents/devops-engineer.md (renamed Blockers→🔴 Critical, Risks→🟠 High; added 🟡 Medium; renamed Cleared→🟢 Notes/Cleared)
  - .claude/agents/dba-expert.md, templates/.claude/agents/dba-expert.md (added 🟠 High section; renamed Critical/Warnings/Notes)
  - .claude/agents/penetration-agent.md, templates/.claude/agents/penetration-agent.md (added 🟠 High and 🟢 Notes sections; renamed 🔴/🟡)
  - .claude/skills/team-review/SKILL.md, templates/.claude/skills/team-review/SKILL.md (replaced per-agent severity mapping table with unified four-level scale)
- **Acceptance criteria:**
  - [x] qa-automation report format contains 🔴/🟠/🟡/🟢 sections
  - [x] devops-engineer replaces "Blockers"/"Risks" with standard scale
  - [x] dba-expert adds 🟠 High section
  - [x] penetration-agent adds 🟠 High and 🟢 Notes sections
  - [x] security-expert NOT modified
  - [x] team-review severity mapping updated

### Task 2: Audit and fix DRY session bundle in specialist review skills
- **Agent:** orchestrator (via PRD-09 agent report)
- **Mode:** task
- **Started:** 2026-03-24 11:45 UTC
- **Completed:** 2026-03-24 11:46 UTC
- **Status:** COMPLETED
- **Files modified:** (none — all 5 skills already reference schema correctly)
- **Issues encountered:** (none)
- **Acceptance criteria:**
  - [x] All 5 specialist review skills checked (qa-review, security-review, devops-review, dba-review, pentest)
  - [x] All already reference `.claude/rules/session-memory-schema.md` — no changes needed
