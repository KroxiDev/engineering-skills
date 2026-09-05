import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";

const repositoryRoot = process.cwd();

function createRepository(t) {
  const temporaryRoot = realpathSync(tmpdir());
  const root = mkdtempSync(join(temporaryRoot, "claude-skills-"));
  t.after(() => {
    assert.equal(dirname(root), temporaryRoot);
    rmSync(root, { recursive: true, force: true });
  });

  for (const path of [
    "scripts/generate-claude-skills.mjs",
    ".agents/skills/gpt-review/SKILL.md",
  ]) {
    const destination = join(root, path);
    mkdirSync(dirname(destination), { recursive: true });
    writeFileSync(destination, readFileSync(join(repositoryRoot, path)));
  }
  mkdirSync(join(root, ".agents/skills/demo"), { recursive: true });
  writeFileSync(
    join(root, ".agents/skills/demo/SKILL.md"),
    "---\nname: demo\ndescription: Skill de ejemplo.\n---\n\n# Demo\n"
  );
  return root;
}

function generate(root, ...args) {
  return spawnSync(
    process.execPath,
    [join(root, "scripts/generate-claude-skills.mjs"), ...args],
    { cwd: root, encoding: "utf8" }
  );
}

test("genera claude-review con Opus 5 Max y conserva gpt-review en Codex", (t) => {
  const root = createRepository(t);
  const canonicalPath = join(root, ".agents/skills/gpt-review/SKILL.md");
  const original = readFileSync(canonicalPath, "utf8");
  mkdirSync(join(root, "skills/gpt-review"), { recursive: true });
  writeFileSync(
    join(root, "skills/gpt-review/SKILL.md"),
    "Wrapper anterior.\n"
  );

  const result = generate(root);
  assert.equal(result.status, 0, result.stderr);
  assert.ok(existsSync(join(root, "skills/claude-review/SKILL.md")));
  const review = readFileSync(
    join(root, "skills/claude-review/SKILL.md"),
    "utf8"
  );
  assert.match(review, /^name: claude-review$/mu);
  assert.match(review, /^disable-model-invocation: true$/mu);
  assert.match(review, /Opus 5 Max/u);
  assert.match(review, /model: "claude-opus-5"/u);
  assert.match(review, /effort: "max"/u);
  assert.doesNotMatch(
    review,
    /gpt-review|gpt-6-astra|GPT|collaboration|CLAUDE_PLUGIN_ROOT/u
  );
  assert.equal(existsSync(join(root, "skills/gpt-review")), false);
  assert.equal(readFileSync(canonicalPath, "utf8"), original);
  assert.match(
    readFileSync(join(root, "skills/demo/SKILL.md"), "utf8"),
    /\$\{CLAUDE_PLUGIN_ROOT\}\/\.agents\/skills\/demo\/SKILL\.md/u
  );
  assert.equal(generate(root, "--check").status, 0);
});

test("la comprobación detecta cambios en claude-review sin sobrescribirlos", (t) => {
  const root = createRepository(t);
  assert.equal(generate(root).status, 0);
  const reviewPath = join(root, "skills/claude-review/SKILL.md");
  assert.ok(existsSync(reviewPath));
  const edited = readFileSync(reviewPath, "utf8").replaceAll(
    "Opus 5 Max",
    "Otro modelo"
  );
  writeFileSync(reviewPath, edited);

  const result = generate(root, "--check");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /skills\/claude-review\/SKILL\.md/u);
  assert.equal(readFileSync(reviewPath, "utf8"), edited);
});

test("la comprobación rechaza el antiguo gpt-review en el catálogo de Claude", (t) => {
  const root = createRepository(t);
  assert.equal(generate(root).status, 0);
  mkdirSync(join(root, "skills/gpt-review"), { recursive: true });
  writeFileSync(
    join(root, "skills/gpt-review/SKILL.md"),
    "Wrapper anterior.\n"
  );

  const result = generate(root, "--check");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /skills\/gpt-review: wrapper obsoleto/u);
  assert.ok(existsSync(join(root, "skills/gpt-review/SKILL.md")));
});
