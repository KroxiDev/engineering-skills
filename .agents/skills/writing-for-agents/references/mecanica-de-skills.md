# Mecánica de skills

La branch específica de skills de [`writing-for-agents`](../SKILL.md): qué cambia cuando el documento es un skill — frontmatter, la elección de invocación y los router skills. Todo lo demás sobre cómo escribirlo es la referencia universal de `SKILL.md`.

## Invocación

Dos opciones, que intercambian las dos cargas:

- Un skill **invocado por el modelo** conserva una `description`, de modo que el agente puede dispararlo de forma autónoma — y otros skills pueden alcanzarlo. Aún puedes escribir su nombre: la invocación por el modelo siempre _incluye_ el alcance del usuario; una description solo añade descubrimiento por el agente, nunca quita el del humano. La description es el puntero de contexto de nivel superior del skill, obligado a permanecer cargado en todo momento — carga de contexto permanente a cambio de descubribilidad. Un skill invocado por el modelo cuyo contenido es todo referencia es también un hogar para referencia compartida: otro skill puede invocarlo, así que la referencia que necesitan varios skills vive en un solo lugar. Mecánica: en Codex, dejar `agents/openai.yaml` sin `policy.allow_implicit_invocation`; en Claude Code, omitir `disable-model-invocation` del wrapper. Y escribir una description orientada al agente que cargue las branches de disparo (las reglas de redacción de punteros de `SKILL.md` aplican por completo).
- Un skill **invocado por el usuario** retira la description del alcance del agente: solo el humano escribiendo su nombre puede invocarlo, y ningún otro skill puede. Cero carga de contexto, pero gasta carga cognitiva — tú eres el índice que debe recordar que existe. Mecánica: en Codex, añadir `policy.allow_implicit_invocation: false` a `agents/openai.yaml`; en Claude Code, añadir `disable-model-invocation: true` solo al wrapper de `skills/<nombre>/SKILL.md` — no poner campos exclusivos de Claude en el skill canónico de `.agents/skills`. La `description` pasa a ser para el humano: un resumen de una línea, sin listas de disparadores.

Elegir invocación por el modelo solo cuando el agente deba alcanzar el skill por su cuenta, u otro skill deba hacerlo. Si solo se dispara a mano, hacerlo invocado por el usuario y no pagar carga de contexto.

La referencia compartida que necesitan dos skills invocados por el usuario no puede vivir en ninguno de los dos — sin descriptions, ninguno puede disparar al otro. Empujarla a un archivo plano fuera del sistema de skills: referencia externa a la que cualquier skill puede apuntar.

## Dividir por invocación

El corte por invocación (el corte por secuencia vive en `SKILL.md`): separar un skill invocado por el modelo cuando tengas una leading word distinta que deba dispararlo por sí sola — una palabra disparadora que realmente uses en tus prompts — o cuando otro skill deba alcanzarlo. Pagas carga de contexto por la nueva description siempre cargada, así que ese alcance independiente tiene que valerlo.

## Router skills

Cuando los skills invocados por el usuario se multiplican más allá de lo que puedes recordar, esa carga cognitiva apilada se cura con un **router skill**: un skill invocado por el usuario que nombra a los demás y cuándo recurrir a cada uno, para que el humano tenga un skill que recordar en vez de muchos. Solo puede insinuar, nunca dispararlos: los skills invocados por el usuario no tienen description, así que nada salvo el humano puede alcanzarlos.
