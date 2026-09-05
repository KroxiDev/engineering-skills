#!/usr/bin/env node

import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const CLAUDE_OVERRIDES = {
  "batch-grill-me": { disableModelInvocation: true },
  caveman: {
    argumentHint: "lite | full | ultra (por defecto: full)",
    disableModelInvocation: true,
  },
  "continue-task": {
    argumentHint: "¿En qué debería centrarse la próxima sesión?",
    disableModelInvocation: true,
  },
  "gpt-review": { name: "claude-review", disableModelInvocation: true },
  "grill-me": { disableModelInvocation: true },
  "grill-with-docs": { disableModelInvocation: true },
  implement: { disableModelInvocation: true },
  "improve-codebase-architecture": { disableModelInvocation: true },
  "loop-me": {
    argumentHint: "Un workflow a diseñar, o nada para salir a buscar uno",
    disableModelInvocation: true,
  },
  "request-refactor-plan": { disableModelInvocation: true },
  "setup-ts-deep-modules": { disableModelInvocation: true },
  teach: {
    argumentHint: "¿Sobre qué te gustaría aprender?",
    disableModelInvocation: true,
  },
  "to-spec": { disableModelInvocation: true },
  "to-tickets": { disableModelInvocation: true },
  triage: { disableModelInvocation: true },
  "wait-what": { disableModelInvocation: true },
  wayfinder: { disableModelInvocation: true },
  "writing-great-skills": { disableModelInvocation: true },
};

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const canonicalRoot = join(repositoryRoot, ".agents", "skills");
const claudeRoot = join(repositoryRoot, "skills");
const checkOnly = process.argv.includes("--check");

function canonicalSkill(skillName) {
  const path = join(canonicalRoot, skillName, "SKILL.md");
  const skill = readFileSync(path, "utf8");
  const match = skill.match(/^---\n([\s\S]*?)\n---(?:\n|$)/u);
  if (!match) throw new Error(`${path}: frontmatter inválido`);
  return { frontmatter: match[1], body: skill.slice(match[0].length) };
}

function quoteYaml(value) {
  return JSON.stringify(value);
}

function claudeReview(metadata, body) {
  const codexSettings =
    'En Codex, con `collaboration.spawn_agent`, configura `model: "gpt-6-astra"`, `reasoning_effort: "max"` y `fork_turns: "none"`.';
  if (!body.includes(codexSettings)) {
    throw new Error(
      "gpt-review: cambió la configuración del revisor; actualiza la adaptación de Claude antes de generar."
    );
  }
  const claudeSettings =
    'En Claude Code, configura el revisor con `model: "claude-opus-5"` y `effort: "max"` (por CLI, `--model claude-opus-5 --effort max`) y verifica la selección efectiva.';
  return [
    "---",
    metadata
      .replace(/^name: gpt-review$/mu, "name: claude-review")
      .replaceAll("GPT-6 Astra Max", "Opus 5 Max"),
    "---",
    body
      .replace("# Revisión con GPT", "# Revisión con Claude")
      .replaceAll("GPT-6 Astra Max", "Opus 5 Max")
      .replace(codexSettings, claudeSettings),
  ].join("\n");
}

function wrapper(skillName) {
  const override = CLAUDE_OVERRIDES[skillName] ?? {};
  const { frontmatter, body } = canonicalSkill(skillName);
  const extraFrontmatter = [];
  if (override.argumentHint) {
    extraFrontmatter.push(`argument-hint: ${quoteYaml(override.argumentHint)}`);
  }
  if (override.disableModelInvocation) {
    extraFrontmatter.push("disable-model-invocation: true");
  }

  const metadata = [frontmatter, ...extraFrontmatter].join("\n");
  if (skillName === "gpt-review") return claudeReview(metadata, body);
  return [
    "---",
    metadata,
    "---",
    "",
    `Lee por completo \`\${CLAUDE_PLUGIN_ROOT}/.agents/skills/${skillName}/SKILL.md\` y sigue sus instrucciones.`,
    "",
    `Resuelve desde \`\${CLAUDE_PLUGIN_ROOT}/.agents/skills/${skillName}/\` cualquier ruta relativa a \`references/\`, \`scripts/\` o \`assets/\`.`,
    "",
  ].join("\n");
}

const skillNames = readdirSync(canonicalRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
const expected = new Map(
  skillNames.map((name) => [
    CLAUDE_OVERRIDES[name]?.name ?? name,
    wrapper(name),
  ])
);

if (checkOnly) {
  const errors = [];
  const actualNames = existsSync(claudeRoot)
    ? readdirSync(claudeRoot, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort()
    : [];

  for (const [name, contents] of expected) {
    const path = join(claudeRoot, name, "SKILL.md");
    if (!existsSync(path)) {
      errors.push(`skills/${name}/SKILL.md: wrapper ausente`);
    } else if (readFileSync(path, "utf8") !== contents) {
      errors.push(`skills/${name}/SKILL.md: wrapper desactualizado`);
    }
  }
  for (const name of actualNames) {
    if (!expected.has(name)) errors.push(`skills/${name}: wrapper obsoleto`);
  }

  if (errors.length > 0) {
    console.error("Wrappers de Claude desactualizados:\n");
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
  } else {
    console.log("Wrappers de Claude sincronizados con los skills canónicos.");
  }
} else {
  mkdirSync(claudeRoot, { recursive: true });
  for (const entry of readdirSync(claudeRoot, { withFileTypes: true })) {
    if (!entry.isDirectory() || !expected.has(entry.name)) {
      rmSync(join(claudeRoot, entry.name), { force: true, recursive: true });
    }
  }
  for (const [name, contents] of expected) {
    const directory = join(claudeRoot, name);
    mkdirSync(directory, { recursive: true });
    writeFileSync(join(directory, "SKILL.md"), contents, "utf8");
  }
  console.log(`Wrappers de Claude generados: ${expected.size}.`);
}
