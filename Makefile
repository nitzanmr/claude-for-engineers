.PHONY: validate validate-settings validate-skills validate-invariants validate-deps validate-statuses

# Run all validation checks
validate: validate-settings validate-skills validate-invariants validate-deps validate-statuses
	@echo ""
	@echo "All validation checks passed."

# Validate .claude/settings.json structure and MEMORY_FILE_PATH
validate-settings:
	@echo "-> Validating settings.json..."
	@node validate/settings-json.js

# Validate YAML frontmatter in all .claude/skills/*/SKILL.md files
validate-skills:
	@echo "-> Validating skill frontmatter..."
	@node validate/skill-frontmatter.js

# Check structural invariants (no rogue search_nodes, correct run ID format, etc.)
validate-invariants:
	@echo "-> Checking structural invariants..."
	@bash validate/invariants.sh

# Check PRD dependency graphs for cycles
validate-deps:
	@echo "-> Checking PRD dependency graphs..."
	@node validate/dependency-graph.js

# Check all Status: values in prds/ are from the defined set
validate-statuses:
	@echo "-> Checking PRD status values..."
	@bash validate/prd-status-values.sh
