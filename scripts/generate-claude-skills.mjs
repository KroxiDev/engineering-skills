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
  "grill-me": { disableModelInvocation: true },
  "grill-with-docs": { disableModelInvocation: true },
  implement: { disableModelInvocation: true },
  "improve-codebase-architecture": { disableModelInvocation: true },
  "loop-me": {
    argumentHint: "Un workflow a diseñar, o nada para salir a buscar uno",
    disableModelInvocation: true,
  },
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
};

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const canonicalRoot = join(repositoryRoot, ".agents", "skills");
const claudeRoot = join(repositoryRoot, "skills");
const checkOnly = process.argv.includes("--check");

function canonicalFrontmatter(skillName) {
  const path = join(canonicalRoot, skillName, "SKILL.md");
  const skill = readFileSync(path, "utf8");
  const frontmatter = skill.match(/^---\n([\s\S]*?)\n---(?:\n|$)/u)?.[1];
  if (!frontmatter) throw new Error(`${path}: frontmatter inválido`);
  return frontmatter;
}

function quoteYaml(value) {
  return JSON.stringify(value);
}

function wrapper(skillName) {
  const override = CLAUDE_OVERRIDES[skillName] ?? {};
  const extraFrontmatter = [];
  if (override.argumentHint) {
    extraFrontmatter.push(`argument-hint: ${quoteYaml(override.argumentHint)}`);
  }
  if (override.disableModelInvocation) {
    extraFrontmatter.push("disable-model-invocation: true");
  }

  const metadata = [canonicalFrontmatter(skillName), ...extraFrontmatter].join(
    "\n"
  );
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
const expected = new Map(skillNames.map((name) => [name, wrapper(name)]));

if (checkOnly) {
  const errors = [];
  const actualNames = existsSync(claudeRoot)
    ? readdirSync(claudeRoot, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort()
    : [];

  for (const name of skillNames) {
    const path = join(claudeRoot, name, "SKILL.md");
    if (!existsSync(path)) {
      errors.push(`skills/${name}/SKILL.md: wrapper ausente`);
    } else if (readFileSync(path, "utf8") !== expected.get(name)) {
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
