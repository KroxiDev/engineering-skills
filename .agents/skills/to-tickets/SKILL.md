---
name: to-tickets
description: Divide un plan, una spec o la conversación actual en un conjunto de tickets tracer-bullet, cada uno declarando sus aristas de bloqueo, publicados en el tracker configurado — aristas como texto en un archivo por ticket en local, o enlaces de bloqueo nativos en un tracker real.
---

# A tickets

Dividir un plan, spec o conversación en un conjunto de **tickets** — slices verticales de bala trazadora, cada uno declarando los tickets que lo **bloquean**.

El issue tracker y el vocabulario de etiquetas de triage deberían estar ya configurados (p. ej. en `docs/agents/issue-tracker.md`) — si no, preguntar al usuario qué tracker usa.

## Proceso

### 1. Reunir contexto

Trabajar con lo que ya esté en el contexto de la conversación. Si el usuario pasa una referencia (una ruta de spec, un número de issue o URL) como argumento, obtenerla y leer su cuerpo y comentarios completos.

### 2. Explorar el codebase (opcional)

Si aún no se ha explorado el codebase, hacerlo para entender el estado actual del código. Los títulos y descripciones de los tickets deben usar el vocabulario del glosario de dominio del proyecto, y respetar los ADRs del área que se está tocando.

Buscar oportunidades de prefactorizar el código para facilitar la implementación. "Haz el cambio fácil, y luego haz el cambio fácil de hacer."

### 3. Redactar los slices verticales

Dividir el trabajo ejecutable por un agente en tickets de **bala trazadora**.

<vertical-slice-rules>

- Cada slice corta un camino estrecho pero COMPLETO a través de todas las capas (schema, API, UI, tests) — vertical, NO un corte horizontal de una sola capa
- Un slice terminado es demostrable o verificable por sí solo
- Cada slice está dimensionado para caber en una sola ventana de contexto fresca
- Cualquier prefactorización debe hacerse primero

</vertical-slice-rules>

Dar a cada ticket sus **aristas de bloqueo** — los otros tickets que deben completarse antes de que pueda empezar. Un ticket sin bloqueadores puede empezar de inmediato.

**Los refactors amplios son la excepción al slicing vertical.** Un **refactor amplio** es un cambio mecánico — renombrar una columna, retipar un símbolo compartido — cuyo **radio de explosión** se abre en abanico por todo el codebase, de modo que una sola edición rompe miles de call sites a la vez y ningún slice vertical puede aterrizar en green. No forzarlo dentro de una bala trazadora; secuenciarlo como **expand–contract**. Primero expandir: añadir la forma nueva junto a la vieja para que nada se rompa. Luego migrar los call sites por lotes dimensionados por radio de explosión (por package, por directorio), cada lote su propio ticket bloqueado por el expand, manteniendo el CI en green de lote a lote porque la forma vieja sigue existiendo. Finalmente contraer: borrar la forma vieja cuando no quede ningún caller, en un ticket bloqueado por todos los lotes de migración. Cuando ni siquiera los lotes puedan mantenerse en green por sí solos, conservar la secuencia pero dejar que compartan una branch de integración que bloquee a un ticket final de integrar-y-verificar — el green se promete solo ahí.

#### Clasificación y formato

Priorizar `ready-for-agent` siempre que el agente pueda completar y validar la tarea. Reservar `Manual` para intervenciones imprescindibles del usuario o pruebas extensas cuya ejecución por el usuario sea necesaria, indicando brevemente el motivo. Las etiquetas `Manual` y `ready-for-agent` son excluyentes.

Redactar los tickets `Manual` con un objetivo breve, sus bloqueadores y pocos pasos numerados y detallados. Incluir preferentemente un comando listo para copiar y pegar, con el directorio y los requisitos indispensables para ejecutarlo. Indicar el resultado esperado para cerrar la tarea y, solo cuando sea necesario para el cierre, qué resultados debe reportar el usuario después de ejecutarla.

### 4. Interrogar al usuario

Presentar la división propuesta como lista numerada. Para cada ticket, mostrar:

- **Título**: nombre corto y descriptivo
- **Etiqueta**: `Manual` o `ready-for-agent`, según la clasificación anterior
- **Bloqueado por**: qué otros tickets (si los hay) deben completarse primero
- **Qué entrega**: el comportamiento end-to-end que este ticket hace funcionar

Preguntar al usuario:

- ¿La granularidad se siente bien? (¿demasiado gruesa / demasiado fina?)
- ¿Las aristas de bloqueo son correctas — cada ticket depende solo de tickets que genuinamente lo condicionan?
- ¿Debería fusionarse o dividirse más algún ticket?

Iterar hasta que el usuario apruebe la división.

### 5. Publicar los tickets en el tracker configurado

Publicar los tickets aprobados con la etiqueta definida en el paso 3. **Cómo** depende del tracker configurado — los tickets son los mismos en ambos casos, solo cambia la forma de las aristas de bloqueo:

- **Archivos locales** → escribir un archivo por ticket bajo `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numerados desde `01` en orden de dependencia (bloqueadores primero). El "Bloqueado por" de cada archivo lista los números/títulos de los que depende. Usar el formato correspondiente definido abajo — un ticket por archivo, nunca un único archivo combinado.
- **Un issue tracker real (GitHub, Linear, …)** → publicar un issue por ticket en orden de dependencia (bloqueadores primero) para que las aristas de bloqueo de cada ticket puedan referenciar identificadores reales. Usar la relación nativa de bloqueo / sub-issue de la plataforma donde exista; si no, poner en el "Bloqueado por" de cada ticket los issues que lo bloquean.

Trabajar el **frontier**: cualquier ticket cuyos bloqueadores estén todos terminados. Para una cadena puramente lineal eso significa de arriba a abajo.

NO cerrar ni modificar ningún issue padre.

Para los tickets `Manual`, usar el formato breve del paso 3, conservar la referencia al padre si corresponde y los bloqueadores, y escribir **Estado: Manual** en los archivos locales. Para los tickets ejecutables por un agente, usar las siguientes plantillas.

<local-ticket-template>

# <NN> — <Título del ticket>

**Qué construir:** el comportamiento end-to-end que este ticket hace funcionar, desde la perspectiva del usuario — no una lista de implementación capa por capa.

**Bloqueado por:** los números/títulos de los tickets que condicionan a este, o "Ninguno — puede empezar de inmediato".

**Estado:** ready-for-agent

- [ ] Criterio de aceptación 1
- [ ] Criterio de aceptación 2

</local-ticket-template>

<issue-template>

## Padre

Una referencia al issue padre en el tracker (si el origen fue un issue existente; si no, omitir esta sección).

## Qué construir

El comportamiento end-to-end que este ticket hace funcionar, desde la perspectiva del usuario — no implementación capa por capa.

## Criterios de aceptación

- [ ] Criterio 1
- [ ] Criterio 2

## Bloqueado por

- Una referencia a cada ticket bloqueador, o "Ninguno — puede empezar de inmediato".

</issue-template>

En los tickets ejecutables por un agente, evitar rutas de archivos específicas o snippets de código — se quedan obsoletos rápido. Excepción: si un prototipo produjo un snippet que codifica una decisión con más precisión que la prosa (máquina de estados, reducer, schema, forma de un tipo), inlinearlo y anotar brevemente que vino de un prototipo. Recortar a las partes ricas en decisión — no una demo funcional, solo lo importante.

Trabajar los tickets `ready-for-agent` del frontier un ticket por vez con `implement`, limpiando el contexto entre tickets. Los tickets `Manual` los ejecuta el usuario.
