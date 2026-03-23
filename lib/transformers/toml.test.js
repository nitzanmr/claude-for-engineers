'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert');

const { parseSkillMd, skillToToml } = require('./toml');

const SAMPLE_SKILL = `---
name: plan
description: "Collaborative planning conversation to produce a Master Plan"
argument-hint: <feature idea>
tags: [planning]
---

# Plan Skill

Start a collaborative planning session.
`;

describe('parseSkillMd', () => {
  test('extracts name and description from frontmatter', () => {
    const result = parseSkillMd(SAMPLE_SKILL);
    assert.strictEqual(result.name, 'plan');
    assert.strictEqual(result.description, 'Collaborative planning conversation to produce a Master Plan');
  });

  test('returns the body without frontmatter', () => {
    const result = parseSkillMd(SAMPLE_SKILL);
    assert.ok(result.body.includes('# Plan Skill'));
    assert.ok(!result.body.includes('---'));
  });

  test('returns null for content without frontmatter', () => {
    assert.strictEqual(parseSkillMd('no frontmatter here'), null);
  });
});

describe('skillToToml', () => {
  test('produces valid TOML with description and prompt fields', () => {
    const toml = skillToToml(SAMPLE_SKILL);
    assert.ok(toml.includes('description = "Collaborative planning'));
    assert.ok(toml.includes('prompt = """'));
    assert.ok(toml.includes('# Plan Skill'));
  });

  test('escapes triple double-quotes in body', () => {
    const content = `---\nname: x\ndescription: "test"\n---\nsome """quoted""" text`;
    const toml = skillToToml(content);
    assert.ok(!toml.includes('"""quoted"""'));
    assert.ok(toml.includes("'''quoted'''"));
  });

  test('returns null for unparseable input', () => {
    assert.strictEqual(skillToToml('no frontmatter'), null);
  });
});
