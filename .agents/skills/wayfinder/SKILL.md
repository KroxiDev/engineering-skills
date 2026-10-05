---
name: wayfinder
description: Planifica un trozo de trabajo enorme — más de lo que cabe en una sesión de agente — como un mapa compartido de tickets de decisión en tu issue tracker, y resuélvelos de uno en uno hasta que el camino al destino esté despejado.
---

Ha llegado una idea suelta — demasiado grande para una sesión de agente, y envuelta en niebla: el camino desde aquí hasta el **destino** aún no es visible. Wayfinding va de encontrar ese camino, no de embestir hacia el destino. Este skill traza el camino como un **mapa compartido** en el issue tracker del repo, y luego trabaja sus **tickets de decisión** — preguntas cuya resolución es una decisión, no slices de una construcción a ejecutar — de uno en uno hasta que la ruta esté clara.

El destino varía según el esfuerzo, y nombrarlo es el primer acto del trazado — da forma a cada ticket. Puede ser una spec que entregar e iterar, una decisión que fijar antes de que empiece la planificación, o un cambio hecho en el sitio, como una migración de estructura de datos. El mapa es agnóstico del dominio — trabajo de ingeniería, contenido de un curso, lo que encaje con la forma.

## Planificar, no hacer

Wayfinder es **planificación** por defecto: cada ticket resuelve una decisión, y el mapa está terminado cuando el camino está despejado — no queda nada por decidir antes de que alguien vaya y haga la cosa. El tirón de simplemente hacer el trabajo suele ser la señal de que has llegado al borde del mapa y toca traspasar. Un esfuerzo puede sobreescribir esto en sus **Notas** — llevando la ejecución al propio mapa — pero en ausencia de eso, produce decisiones, no entregables.

## Referir por nombre

Cada mapa y ticket es un issue, así que tiene un **nombre** — su título. En todo lo que lea el humano — la narración, las Decisiones-hasta-ahora del mapa — referirse a él por ese nombre, nunca por un id, número o slug a secas. Un muro de `#42, #43, #44` es ilegible; los nombres se leen de un vistazo. El id y la URL no desaparecen — un nombre envuelve su enlace — pero viajan _dentro_ del nombre, nunca lo sustituyen.

## El Mapa

El mapa es un único issue en el issue tracker de este repo, etiquetado `wayfinder:map` — el artefacto canónico. Sus tickets son issues hijos del mapa.

El mapa es un **índice**, no un almacén. Lista las decisiones tomadas y apunta a los tickets que guardan su detalle; una decisión vive en exactamente un lugar — su ticket — así que el mapa nunca la reformula, solo la resume y enlaza.

**Dónde viven físicamente el mapa, sus tickets hijos, los bloqueos y las consultas de frontier es específico de cada tracker.** La configuración del issue tracker debería estar ya proporcionada — si no, preguntar al usuario. Consultar la sección "Wayfinding operations" del doc del tracker para saber cómo los expresa _este_ repo. Si no hay tracker configurado, usar por defecto el tracker de Markdown local.

### El cuerpo del mapa

El mapa completo a baja resolución, cargado una vez por sesión. Los tickets abiertos **no** se listan — son issues hijos abiertos, encontrados por consulta.

```markdown
## Destino

<cómo se ve llegar al final de este mapa — la spec, decisión o cambio hacia el que este esfuerzo está encontrando su camino. Una o dos líneas; cada sesión se orienta con esto antes de elegir un ticket.>

## Notas

<dominio; skills que cada sesión debe consultar; preferencias permanentes de este esfuerzo>

## Decisiones hasta ahora

<!-- el índice — una línea por ticket cerrado: suficiente para juzgar relevancia, y luego hacer zoom al enlace para el detalle que guarda el ticket -->

- [<título del ticket cerrado>](enlace) — <resumen de una línea de la respuesta>

## Aún no especificado

<!-- ver "Niebla de guerra": niebla en alcance que aún no puede convertirse en ticket; se gradúa a medida que avanza el frontier -->

## Fuera de alcance

<!-- ver "Fuera de alcance": trabajo declarado más allá del destino; cerrado, nunca se gradúa -->
```

### Tickets

Cada ticket es un **issue hijo** del mapa; el id de issue del tracker es su identidad. Su cuerpo es la pregunta, dimensionada para una sesión de agente de 100K tokens:

```markdown
## Pregunta

<la decisión o investigación que este ticket resuelve>
```

Cada ticket lleva una label `wayfinder:<tipo>` — uno de `research`, `prototype`, `grilling`, `task` (ver [Tipos de tickets](#tipos-de-tickets)).

Una sesión **reclama** un ticket asignándolo al dev que conduce el mapa, **primero**, antes de cualquier trabajo, para que las sesiones concurrentes lo salten. Ese asignado _es_ el reclamo: un ticket abierto y sin asignar está sin reclamar.

El bloqueo usa la relación de dependencia **nativa** del tracker — esencial porque renderiza el frontier _visualmente_ en la propia UI del tracker, de modo que el humano ve qué es tomable sin abrir el mapa. Solo un tracker sin bloqueo nativo recurre a una convención en el cuerpo. Un ticket está **desbloqueado** cuando todos los tickets que lo bloquean están cerrados; el **frontier** son los hijos abiertos, desbloqueados y sin reclamar — el borde de lo conocido.

La respuesta no forma parte del cuerpo — se registra en la resolución (ver [Recorrer el mapa](#recorrer-el-mapa)). Los assets creados al resolver un ticket se enlazan desde el issue, no se pegan dentro.

## Tipos de tickets

Cada ticket es o bien **HITL** — human in the loop, trabajado _con_ un humano que habla por sí mismo — o **AFK**, conducido por el agente solo. Un ticket HITL solo se resuelve mediante ese intercambio en vivo; el agente nunca suplanta el lado humano (un agente de grilling que responde sus propias preguntas ha roto esto).

- **Research** (AFK): Leer documentación, APIs de terceros o recursos locales como bases de conocimiento para sacar a la superficie un hecho del que depende una decisión. Se resuelve con un **subagente** de `research`. Usar cuando se requiera conocimiento fuera del directorio de trabajo actual.
- **Prototype** (HITL): Subir la fidelidad de la discusión haciendo un artefacto barato, tosco y concreto ante el que reaccionar — un esquema, un borrador, un stub, o código de UI/lógica vía el skill `prototype`. Enlaza el prototipo como asset. Usar cuando "cómo debería verse" o "cómo debería comportarse" sea la pregunta clave.
- **Grilling** (HITL): Conversación vía los skills `grilling` y `domain-modeling`, una pregunta por vez. El caso por defecto.
- **Task** (HITL o AFK): Trabajo manual que debe ocurrir antes de que pueda tomarse una _decisión_ — nada que decidir, prototipar o investigar, pero la discusión está bloqueada hasta que se haga. Registrarse en un servicio para poder juzgar su API, aprovisionar accesos, mover datos para poder ver su forma. Es el único tipo que _hace_ en vez de decidir — y se gana su lugar desbloqueando una decisión, no entregando el destino. El agente lo conduce solo donde puede (AFK); si no, entrega al humano una checklist precisa (HITL). Se resuelve cuando el trabajo está hecho; la respuesta registra qué se hizo y cualquier hecho resultante (ubicación de credenciales, URLs nuevas, conteos de filas) del que dependan tickets posteriores.

## Niebla de guerra

El mapa es _deliberadamente_ incompleto: no trazar lo que aún no puedes ver. Más allá de los tickets vivos está la **niebla de guerra** — la vista borrosa de decisiones e investigaciones que se ve venir pero que aún no pueden fijarse, porque cuelgan de preguntas todavía abiertas. Resolver un ticket despeja la niebla que tiene delante, graduando lo que ya sea especificable en tickets frescos — de uno en uno, hasta que el camino al destino esté despejado y no queden tickets.

La sección **Aún no especificado** del mapa es donde se escribe esa vista borrosa: la pregunta sospechada, el área a revisitar más tarde. Es el frontier sin descubrir _hacia_ el destino — todo lo que hay aquí está en alcance, solo que no lo bastante nítido para ser ticket. Escribir tan suelto o tan completo como permita la vista; sirve también de señal para los colaboradores que leen hacia dónde va el esfuerzo.

**¿Niebla o ticket?** La prueba es si puedes enunciar la pregunta con precisión ahora — _no_ si puedes responderla ahora.

- **Ticket cuando** la pregunta ya está afilada — aunque esté bloqueada y no puedas actuar sobre ella todavía.
- **Aún no especificado cuando** todavía no puedes formularla con esa nitidez. No pre-cortar la niebla en trozos de tamaño ticket: es más gruesa que un ticket, y un parche puede graduarse en varios tickets, o en ninguno, cuando el frontier lo alcance.

**Aún no especificado** excluye lo ya decidido (Decisiones hasta ahora), lo que ya es un ticket vivo, y lo que está fuera de alcance (la sección siguiente).

## Fuera de alcance

La niebla solo se acumula _hacia_ el destino. El destino fija el alcance, así que el trabajo más allá de él está **fuera de alcance** — no es niebla, y no pertenece a **Aún no especificado**. Tiene su propia sección **Fuera de alcance** en el mapa: trabajo que has descartado conscientemente de _este_ esfuerzo. Lo que lo trae aquí es el alcance, no la nitidez.

El trabajo fuera de alcance nunca se gradúa — el frontier se detiene en el destino — así que solo vuelve si el destino se redibuja, y entonces como un esfuerzo nuevo, no como una reanudación.

Declarar algo fuera de alcance es un acto de alcance, no un paso de la ruta. Cuando un ticket ya existente resulta quedar más allá del destino — mal incluido al trazar, o expuesto por una resolución — **cerrarlo** (un ticket cerrado está inequívocamente fuera del frontier) y dejar una línea en la sección **Fuera de alcance**: el resumen más el porqué está fuera de alcance, enlazando el ticket cerrado. Queda fuera de **Decisiones hasta ahora**, que registra la ruta realmente andada — un límite de alcance no es un paso de ella.

## Invocación

Dos modos. En cualquiera de los dos, **nunca resolver más de un ticket por sesión** — con la excepción de los tickets de research.

### Trazar el mapa

El usuario invoca con una idea suelta.

1. **Nombrar el destino.** Ejecutar una sesión de `grilling` y `domain-modeling` para fijar hacia qué está encontrando su camino este mapa — la spec, decisión o cambio. El destino fija el alcance, así que se acuerda primero.
2. **Mapear el frontier.** Entrevistar de nuevo, esta vez **en amplitud**: abrirse en abanico por todo el espacio en vez de profundizar en un solo hilo, sacando a la superficie las decisiones abiertas y los primeros pasos tomables ahora. **Si esto no revela niebla** — el camino al destino ya está claro, el viaje entero cabe en una sesión — no necesitas un mapa. Detente y pregunta al usuario cómo quiere proceder.
3. **Crear el mapa** (label `wayfinder:map`): Destino y Notas rellenos, Decisiones-hasta-ahora vacía, la niebla esbozada en **Aún no especificado**.
4. **Crear los tickets que ya se puedan especificar** como issues hijos del mapa — y luego cablear las aristas de bloqueo en una **segunda pasada** (los issues necesitan ids antes de poder referenciarse entre sí). El cableado los ordena en frontier y bloqueados; todo lo que aún no se pueda especificar se queda en la niebla — la sección **Aún no especificado**.
5. **Disparar los subagentes de research.** Para cada ticket `research` recién creado, lanzar un subagente de `research` que lo resuelva en paralelo, capturando sus hallazgos en una branch descartable `research/<nombre>` con un puntero de contexto desde el ticket.
6. Parar — trazar es el trabajo de una sesión; no resuelve nada a mano.

### Recorrer el mapa

El usuario invoca con un mapa (URL o número). Un ticket es **opcional** — sin él, eliges tú la próxima decisión, no el usuario.

1. Cargar el **mapa** — la vista a baja resolución, no el cuerpo de cada ticket.
2. Elegir el ticket. Si el usuario nombró uno, usarlo. Si no, tomar el primer ticket del frontier en orden. **Reclamarlo**: asignártelo antes de cualquier trabajo.
3. Resolverlo — **haciendo zoom según haga falta**: traer el cuerpo completo de cualquier ticket relacionado o cerrado bajo demanda; invocar los skills que nombre el bloque `## Notas`. En caso de duda, usar `grilling` y `domain-modeling`.
4. Registrar la resolución: publicar la respuesta como **comentario de resolución**, **cerrar** el issue, y **añadir un puntero de contexto** a las Decisiones-hasta-ahora del mapa.
5. Añadir los tickets recién surgidos (crear-y-luego-cablear); graduar la niebla que la respuesta haya vuelto especificable, limpiando cada parche graduado de **Aún no especificado** para que viva solo como su ticket nuevo. Si la respuesta revela que un ticket — este u otro — queda más allá del destino, **declararlo fuera de alcance** en vez de resolverlo por la ruta. Si la decisión invalida otras partes del mapa, actualizar o borrar esos tickets.

El usuario puede ejecutar tickets desbloqueados en paralelo, así que hay que esperar que otras sesiones estén editando el tracker concurrentemente.
