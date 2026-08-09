---
name: code-review
description: Revisa los cambios desde un punto fijo (commit, branch, tag o merge-base) en dos ejes — Estándares (¿el código sigue los estándares de código documentados de este repo?) y Especificación (¿el código coincide con lo que pedía el issue/PRD de origen?). Ejecuta ambas revisiones en subagentes paralelos y las reporta lado a lado. Usar cuando el usuario quiera revisar una branch, una PR, cambios en progreso, o pida "revisar desde X".
---

Revisión en dos ejes del diff entre `HEAD` y un punto fijo que indica el usuario:

- **Estándares** — ¿el código cumple los estándares de código documentados de este repo?
- **Especificación** — ¿el código implementa fielmente el issue / PRD / spec de origen?

Ambos ejes se ejecutan como **subagentes paralelos** para que no contaminen el contexto del otro; después este skill agrega sus hallazgos.

La configuración del issue tracker debería estar documentada en `docs/agents/issue-tracker.md` — si falta, preguntar al usuario qué issue tracker usa y cómo consultarlo.

## Proceso

### 1. Fijar el punto de comparación

El punto fijo es lo que haya dicho el usuario — un SHA de commit, nombre de branch, tag, `main`, `HEAD~5`, etc. Si no especificó ninguno, pedírselo.

Capturar el comando del diff una sola vez: `git diff <punto-fijo>...HEAD` (tres puntos, para que la comparación sea contra el merge-base). Anotar también la lista de commits vía `git log <punto-fijo>..HEAD --oneline`.

Antes de continuar, confirmar que el punto fijo resuelve (`git rev-parse <punto-fijo>`) y que el diff no está vacío. Una ref inválida o un diff vacío deben fallar aquí — no dentro de dos subagentes paralelos.

### 2. Identificar la fuente de la especificación

Buscar la especificación de origen, en este orden:

1. Referencias a issues en los mensajes de commit (`#123`, `Closes #45`, `!67` de GitLab, etc.) — obtenerlas mediante el flujo descrito en `docs/agents/issue-tracker.md`.
2. Una ruta que el usuario haya pasado como argumento.
3. Un archivo de PRD/spec bajo `docs/`, `specs/` o `.scratch/` que coincida con el nombre de la branch o la feature.
4. Si no se encuentra nada, preguntar al usuario dónde está la especificación. Si dice que no existe, el subagente de **Especificación** se omite y se reporta "sin especificación disponible".

### 3. Identificar las fuentes de estándares

Cualquier cosa en el repo que documente cómo debe escribirse el código, como `CODING_STANDARDS.md` o `CONTRIBUTING.md`.

Además de lo que documente el repo, el eje de Estándares siempre lleva consigo la **línea base de smells** siguiente — un conjunto fijo de code smells de Fowler (_Refactoring_, cap. 3) que aplica incluso cuando el repo no documenta nada. Dos reglas la rigen:

- **El repo prevalece.** Un estándar documentado del repo siempre gana; donde avale algo que la línea base marcaría, suprimir el smell.
- **Siempre es un juicio.** Cada smell es una heurística etiquetada ("posible Feature Envy"), nunca una violación dura — y, como cualquier estándar aquí, omitir lo que el tooling ya haga cumplir.

Cada smell se lee _qué es_ → _cómo corregirlo_; contrastarlo contra el diff:

- **Mysterious Name** — una función, variable o tipo cuyo nombre no revela qué hace o qué contiene. → renombrarlo; si no surge un nombre honesto, el diseño está turbio.
- **Duplicated Code** — la misma forma de lógica aparece en más de un hunk o archivo del cambio. → extraer la forma compartida y llamarla desde ambos sitios.
- **Feature Envy** — un método que accede a los datos de otro objeto más que a los propios. → mover el método a los datos que envidia.
- **Data Clumps** — los mismos pocos campos o parámetros viajan siempre juntos (un tipo queriendo nacer). → agruparlos en un tipo y pasar ese tipo.
- **Primitive Obsession** — un primitivo o string que sustituye a un concepto de dominio que merece su propio tipo. → darle al concepto su propio tipo pequeño.
- **Repeated Switches** — la misma cascada de `switch`/`if` sobre el mismo tipo se repite a lo largo del cambio. → reemplazar con polimorfismo, o un mapa compartido por ambos sitios.
- **Shotgun Surgery** — un cambio lógico obliga a ediciones dispersas en muchos archivos del diff. → reunir lo que cambia junto en un solo módulo.
- **Divergent Change** — un archivo o módulo se edita por varias razones no relacionadas. → dividirlo para que cada módulo cambie por una sola razón.
- **Speculative Generality** — abstracción, parámetros o hooks añadidos para necesidades que la spec no tiene. → eliminarlo; inlinear de vuelta hasta que aparezca una necesidad real.
- **Message Chains** — navegación larga `a.b().c().d()` de la que el caller no debería depender. → ocultar el recorrido tras un método del primer objeto.
- **Middle Man** — una clase o función que sobre todo delega hacia adelante. → recortarla y llamar directo al destino real.
- **Refused Bequest** — una subclase o implementador que ignora o sobreescribe la mayor parte de lo que hereda. → abandonar la herencia y usar composición.

### 4. Lanzar ambos subagentes en paralelo

**Prompt del subagente de Estándares** — incluir:

- El comando completo del diff y la lista de commits.
- La lista de archivos fuente de estándares encontrados en el paso 3, **más la línea base de smells del paso 3 pegada completa** — el subagente no tiene otro acceso a ella.
- La consigna: "Reporta — por archivo/hunk donde sea relevante — (a) cada lugar donde el diff viola un estándar documentado: cita el estándar (archivo + regla); y (b) cualquier smell de la línea base que detectes: nómbralo y cita el hunk. Distingue violaciones duras de juicios — los incumplimientos de estándares documentados pueden ser duros, pero los smells de la línea base son siempre juicios, y un estándar documentado del repo prevalece sobre la línea base. Omite lo que el tooling haga cumplir. Menos de 400 palabras."

**Prompt del subagente de Especificación** — incluir:

- El comando del diff y la lista de commits.
- La ruta o el contenido ya obtenido de la especificación.
- La consigna: "Reporta: (a) requisitos que la spec pedía y están ausentes o parciales; (b) comportamiento en el diff que no fue pedido (scope creep); (c) requisitos que parecen implementados pero cuya implementación parece incorrecta. Cita la línea de la spec para cada hallazgo. Menos de 400 palabras."

Si la especificación no existe, omitir el subagente de Especificación y anotarlo en el reporte final.

### 5. Agregar

Presentar los dos reportes bajo los encabezados `## Estándares` y `## Especificación`, textuales o con limpieza ligera. **No** fusionar ni rerankear hallazgos — los dos ejes están separados deliberadamente (ver _Por qué dos ejes_).

Cerrar con un resumen de una línea: total de hallazgos por eje y el problema más grave _dentro de cada eje_ (si lo hay). No elegir un único ganador entre ejes — ese es justo el rerankeo que la separación existe para evitar.

## Por qué dos ejes

Un cambio puede pasar un eje y fallar el otro:

- Código que sigue todos los estándares pero implementa lo incorrecto → **Estándares pasa, Especificación falla.**
- Código que hace exactamente lo que pedía el issue pero rompe las convenciones del proyecto → **Especificación pasa, Estándares falla.**

Reportarlos por separado evita que un eje enmascare al otro.
