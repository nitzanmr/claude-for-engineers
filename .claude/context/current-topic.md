# Current Topic

Updated: 2026-03-23 10:00 UTC
Active PRD: none
Feature: Distributable NPX Package & MCP Server for claude-for-engineers
Phase: RESEARCH

## What We're Building
Making the claude-for-engineers workflow system distributable — users run `npx claude-for-engineers@latest` (or similar) and the workflow gets installed into their project's `.claude/` directory (Claude Code), `.gemini/` (Gemini CLI), or other AI runtimes. Also exploring MCP server as an alternative/complementary distribution mechanism.

## Key Decisions So Far
- None yet — research phase
- Inspired by: https://github.com/gsd-build/get-shit-done (get-shit-done-cc npx package)
- Target runtimes: Claude Code (.claude/), Gemini CLI (.gemini/), Antigravity (.gemini/antigravity/)

## Open Questions
- What exact files need to be copied per runtime (Claude, Gemini, Antigravity)?
- How does Gemini CLI / Antigravity discover and load skills/agents?
- Should the MCP server approach replace or complement the file-copy approach?
- What content transformations are needed per runtime (like GSD does with convertClaudeToCopilotContent)?
- What's the package structure for the npx binary (bin/install.js pattern)?
- How do we handle settings.local.json (machine-specific paths) during install?

## Team Notes
- Previous feature: Token Efficiency Improvements
- GSD uses: readline for prompts, no deps, Node 20+, bin/install.js entry point
- GSD installs to: Claude=.claude/, Gemini=.gemini/, Antigravity=.gemini/antigravity/, Codex=.codex/, Cursor=.cursor/
