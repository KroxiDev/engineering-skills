# Engineering Skills

Colección de **33 skills por plataforma** de ingeniería en español neutro para [OpenAI Codex](https://developers.openai.com/codex/) y [Claude Code](https://code.claude.com/docs). La revisión independiente se llama `gpt-review` en Codex y `claude-review` en Claude Code.

Cubre el ciclo completo: diseño de codebase, modelado de dominio, TDD, revisión de código, diagnóstico de bugs, planificación de trabajo grande, triage, traspasos entre sesiones y construcción de skills.

`.agents/skills` es la fuente canónica para Codex. Cada skill añade `agents/openai.yaml` con sus metadatos de invocación; Claude Code consume wrappers mínimos generados en `skills/`, que conservan sus campos específicos sin contaminar el frontmatter que valida Codex. `claude-review` se genera como una adaptación completa y autocontenida del mismo flujo de revisión, con Opus 5 Max.

## Instalación

### Codex

**Para un repositorio.** Copia `.agents/skills` a la raíz del proyecto:

```text
<tu-proyecto>/
└── .agents/
    └── skills/
        └── <nombre-del-skill>/
```

Codex busca skills desde el directorio de trabajo hasta la raíz del repositorio, así que también valen en un subdirectorio si solo aplican a una parte del proyecto.

**Para todos tus proyectos.** Copia los directorios de skills a `~/.agents/skills/`. Si un skill recién instalado no aparece, reinicia Codex.

### Claude Code

Dos pasos, no uno — añadir el marketplace registra el catálogo, pero hasta instalar el plugin no tienes ningún skill activo:

```text
/plugin marketplace add KroxiDev/engineering-skills
/plugin install engineering-skills@kroxidev
```

El repositorio es público y el marketplace se registra por HTTPS: el clone es anónimo, no hace falta cuenta de GitHub. Una vez instalado, los skills están disponibles en todos tus proyectos.

Ejecuta `/reload-plugins` si ya tenías una sesión de Claude Code abierta.

La instalación queda en el disco de esa máquina (`~/.claude/settings.json` y `~/.claude/plugins/`), no viaja con tu cuenta. Para actualizar:

```text
/plugin marketplace update kroxidev
```

> El plugin no fija `version` en su manifiesto, así que Claude Code usa el SHA del commit: cada push a `main` cuenta como versión nueva.

**En [claude.ai/code](https://claude.ai/code)**, añade el marketplace al `.claude/settings.json` del repo en el que trabajes:

```json
{
  "extraKnownMarketplaces": {
    "kroxidev": {
      "source": { "source": "github", "repo": "KroxiDev/engineering-skills" }
    }
  },
  "enabledPlugins": { "engineering-skills@kroxidev": true }
}
```

## Skills incluidos

Los marcados `auto` se activan solos cuando la descripción encaja con la tarea. El resto solo se disparan si los invocas: `$nombre` en Codex, `/engineering-skills:nombre` en Claude Code.

| Skill                           | Invocación | Descripción                                                                           |
| :------------------------------ | :--------- | :------------------------------------------------------------------------------------ |
| `batch-grill-me`                | usuario    | Pregunta todo el frontier de decisiones por rondas.                                   |
| `caveman`                       | usuario    | Respuestas ultracomprimidas sin perder exactitud técnica. Niveles lite, full y ultra. |
| `code-review`                   | auto       | Revisa un diff en dos ejes: estándares del repo y especificación de origen.           |
| `codebase-design`               | auto       | Vocabulario y criterios para diseñar módulos profundos.                               |
| `continue-task`                 | usuario    | Traspasa la tarea actual a otra sesión del mismo workspace.                           |
| `diagnosing-bugs`               | auto       | Aísla bugs difíciles y regresiones de rendimiento con un bucle reproducible.          |
| `domain-modeling`               | auto       | Construye y afila el modelo de dominio: glosario, contexto y ADRs.                    |
| `git-guardrails-claude-code`    | ver nota   | Instala hooks `PreToolUse` de Claude Code que bloquean git peligroso.                 |
| `git-guardrails-codex`          | auto       | Protege Git en sesiones de Codex vía política en `AGENTS.md` y un verificador manual. |
| `gpt-review` / `claude-review`  | usuario    | Revisión independiente: GPT-6 Astra Max en Codex; Opus 5 Max en Claude Code.          |
| `grill-me`                      | usuario    | Entrevista rigurosa por rondas para afilar un plan o diseño.                          |
| `grill-with-docs`               | usuario    | Como `grill-me`, creando ADRs y glosario sobre la marcha.                             |
| `grilling`                      | auto       | Interroga un plan, decisión o idea hasta el entendimiento compartido.                 |
| `implement`                     | usuario    | Implementa una spec o un set de tickets con TDD y revisión.                           |
| `improve-codebase-architecture` | usuario    | Escanea el codebase buscando oportunidades de profundización y las reporta en HTML.   |
| `loop-me`                       | usuario    | Entrevista sobre las specs de los workflows recurrentes que quieres construir.        |
| `migrate-to-shoehorn`           | auto       | Migra tests de type assertions `as` a `@total-typescript/shoehorn`.                   |
| `prototype`                     | auto       | Construye un prototipo descartable para responder una pregunta de diseño.             |
| `research`                      | auto       | Investiga contra fuentes primarias y captura los hallazgos como Markdown.             |
| `request-refactor-plan`         | usuario    | Planifica un refactor en commits pequeños y publica el plan como issue.               |
| `resolving-merge-conflicts`     | auto       | Resuelve un conflicto de merge o rebase en progreso.                                  |
| `setup-pre-commit`              | auto       | Configura Husky con lint-staged, typecheck y tests.                                   |
| `setup-ts-deep-modules`         | usuario    | Conecta dependency-cruiser para ocultar internals detrás de entry points.             |
| `tdd`                           | auto       | Desarrollo guiado por tests, en ciclos red-green-refactor.                            |
| `teach`                         | usuario    | Enseña un skill o concepto nuevo dentro de este workspace.                            |
| `to-spec`                       | usuario    | Convierte la conversación en una spec y la publica en el issue tracker.               |
| `to-tickets`                    | usuario    | Divide un plan en tickets tracer-bullet con sus aristas de bloqueo.                   |
| `triage`                        | usuario    | Mueve issues y PRs externas por una máquina de estados de triage.                     |
| `wait-what`                     | usuario    | Vuelve a explicar el último mensaje, más simple y con el contexto que falta.          |
| `wayfinder`                     | usuario    | Planifica trabajo mayor que una sesión como un mapa de tickets de decisión.           |
| `wizard`                        | auto       | Genera un wizard Bash interactivo para procedimientos manuales.                       |
| `writing-great-skills`          | usuario    | Referencia para escribir y editar skills concisos y predecibles.                      |
| `writing-for-agents`            | auto       | Referencia para escribir cualquier documento que consuma un agente.                   |

### Los dos skills de guardrails

`git-guardrails-claude-code` y `git-guardrails-codex` no son traducciones uno del otro: usan mecanismos distintos porque los agentes ofrecen cosas distintas.

- El de **Claude Code** escribe un hook `PreToolUse` que bloquea el comando antes de ejecutarlo. Es cumplimiento real, y no existe fuera de Claude Code — por eso está marcado como explícito en Codex, para que nunca se auto-invoque allí.
- El de **Codex** escribe una política en `AGENTS.md` más un verificador manual. Es más débil (instrucción, no bloqueo), pero el bloque de `AGENTS.md` también lo lee Claude.

### Nota de procedencia

La mayoría de los skills adaptan [mattpocock/skills](https://github.com/mattpocock/skills) al español neutro. Gracias a **Matt Pocock** por el original.

`caveman` es una adaptación del skill [caveman](https://github.com/JuliusBrussee/caveman) de **Julius Brussee** (MIT). Se mantienen el nombre y los nombres de los niveles, se restringe la invocación al usuario, y se retiran los tres modos `wenyan` (compresión en chino clásico), que no aportan nada a un set en español.

`gpt-review` y su variante `claude-review` adaptan el [skill original](https://github.com/davidondrej/skills/blob/main/skills/agent-orchestration/gpt-review/SKILL.md) de **David Ondrej** al español, con invocación explícita y sin dependencias de otros skills. Usan GPT-6 Astra Max en Codex y Opus 5 Max en Claude Code; requieren una herramienta que pueda lanzar el modelo correspondiente con esfuerzo máximo. Conservan su [licencia MIT](.agents/skills/gpt-review/LICENSE).

## Estructura

```text
engineering-skills/
├── .agents/skills/<nombre>/
│   ├── SKILL.md             # frontmatter + instrucciones
│   ├── agents/openai.yaml   # metadatos e invocación en Codex
│   ├── references/          # material de apoyo bajo demanda
│   ├── scripts/             # scripts ejecutables
│   └── assets/              # plantillas y configuración
├── skills/<nombre>/
│   └── SKILL.md             # wrapper o variante completa para Claude Code
├── .claude-plugin/
│   ├── plugin.json          # manifiesto del plugin
│   └── marketplace.json     # catálogo, para instalar por marketplace
├── scripts/generate-claude-skills.mjs
├── scripts/validate-skills.mjs
└── tests/validate-skills.test.mjs
```

Cada skill requiere `SKILL.md` y `agents/openai.yaml`. Los demás directorios son opcionales y solo aparecen cuando el workflow los necesita.

`.agents/skills/` contiene la lógica y los recursos compartidos. Los wrappers de `skills/` añaden el frontmatter exclusivo de Claude Code y cargan el skill canónico mediante `${CLAUDE_PLUGIN_ROOT}`. La excepción es `skills/claude-review/SKILL.md`: el generador conserva el flujo completo de `gpt-review` y adapta nombre, modelo y configuración del revisor. Edita la fuente canónica o esa adaptación en el generador; `npm run validate:skills` comprueba la sincronización de ambos tipos de salida.

## Desarrollo

1. `npm install` — instala dependencias y activa el hook pre-commit.
2. `npm run build:claude` — regenera los wrappers de Claude Code desde los skills canónicos.
3. `npm run validate:skills` — valida UTF-8, LF, frontmatter, metadatos, enlaces y sincronización.
4. `npm test` — comprueba el validador y las regresiones conocidas.
5. `claude plugin validate .` — valida los manifiestos y wrappers del plugin de Claude Code.

## Licencia

MIT
