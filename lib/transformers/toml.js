'use strict';

/**
 * Parse YAML frontmatter from a SKILL.md file content string.
 * Returns { name, description, body } or null if parsing fails.
 */
function parseSkillMd(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return null;

  const frontmatter = match[1];
  const body        = match[2].trim();

  const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
  const descMatch = frontmatter.match(/^description:\s*(.+)$/m);

  return {
    name        : nameMatch ? nameMatch[1].trim() : null,
    description : descMatch ? descMatch[1].trim().replace(/^["']|["']$/g, '') : null,
    body,
  };
}

/**
 * Convert SKILL.md content string to a Gemini CLI TOML command file.
 * Returns the TOML string, or null if the input cannot be parsed.
 *
 * Output format:
 *   description = "..."
 *   prompt = """
 *   <skill body>
 *   """
 */
function skillToToml(content) {
  const parsed = parseSkillMd(content);
  if (!parsed || !parsed.body) return null;

  // Escape any triple-double-quote sequences in the body to avoid breaking TOML multiline strings
  const safeBody = parsed.body.replace(/"""/g, "'''");

  const desc = (parsed.description || '').replace(/"/g, '\\"');
  return `description = "${desc}"\nprompt = """\n${safeBody}\n"""\n`;
}

module.exports = { parseSkillMd, skillToToml };
