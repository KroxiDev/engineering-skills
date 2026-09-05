---
name: writing-great-skills
description: Referencia para escribir y editar bien los skills — el vocabulario y los principios que hacen a un skill predecible.
---

Un skill existe para arrancarle determinismo a un sistema estocástico. La **predictibilidad** — que el agente siga el mismo _proceso_ en cada ejecución, no que produzca la misma salida — es la virtud raíz; cada palanca de abajo la sirve.

Los **términos en negrita** están definidos en [`glosario.md`](references/glosario.md); buscarlos ahí para el significado completo.

## Invocación

Dos opciones, que intercambian costes distintos:

- Un skill **invocado por el modelo** conserva una **description** orientada al agente, con fraseo de disparo rico ("Usar cuando el usuario quiera…, mencione…"). Deja habilitada la invocación implícita en los metadatos de cada plataforma.
- Un skill **invocado por el usuario** usa una `description` breve, porque la persona actúa como índice. En Codex, añadir `policy.allow_implicit_invocation: false` a `agents/openai.yaml`. En Claude Code, añadir `disable-model-invocation: true` solo al wrapper de `skills/<nombre>/SKILL.md`; no poner campos exclusivos de Claude en el skill canónico de `.agents/skills`.

Elegir invocación por el modelo solo cuando el agente deba alcanzar el skill por su cuenta, u otro skill deba hacerlo. Si solo se dispara a mano, hacerlo invocado por el usuario y no pagar carga de contexto.

Cuando los skills invocados por el usuario se multiplican más allá de lo que puedes recordar, esa carga cognitiva apilada se cura con un **router skill**: un skill invocado por el usuario que nombra a los demás y cuándo recurrir a cada uno.

## Escribir la description

Una **description** invocada por el modelo hace dos trabajos — decir qué es el skill y listar las **branches** que deben dispararlo. Cada palabra aumenta la **carga de contexto**, así que una description se gana una poda aún más dura que el cuerpo:

- **Poner por delante la leading word del skill** — la description es donde hace su trabajo de invocación.
- **Un disparador por branch.** Los sinónimos que renombran una misma branch son **duplicación** — "construir features con TDD … pide desarrollo test-first" es una branch escrita dos veces. Colapsarlos; conservar solo las branches genuinamente distintas.
- **Recortar la identidad que ya está en el cuerpo.** Limitar la description a los disparadores, más cualquier cláusula de alcance de "cuando otro skill necesite…".

## Jerarquía de información

Un skill se construye con dos tipos de contenido — **pasos** y **referencia** — que se mezclan libremente: un skill puede ser todo pasos, todo referencia, o ambos. La decisión central es cuál usar y dónde se sitúa cada pieza en la **jerarquía de información**, una escalera ordenada por cuán inmediatamente necesita el agente el material:

1. **Paso en el skill** — una acción ordenada en `SKILL.md`, el nivel primario: qué hace el agente, en orden. Cada paso termina en un **criterio de finalización**, la condición que le dice al agente que el trabajo está hecho. Hacerlo _comprobable_ (¿puede el agente distinguir hecho de no-hecho?) y, donde importe, _exhaustivo_ ("cada modelo modificado contabilizado", no "producir una lista de cambios") — un criterio vago invita a la **finalización prematura**.
2. **Referencia en el skill** — una definición, regla o hecho en `SKILL.md`, consultado bajo demanda. A menudo un conjunto de pares legítimamente plano (todas las reglas de una revisión en un mismo peldaño) — un arreglo válido, no un smell. _Este skill es todo referencia._
3. **Referencia externa** — referencia empujada fuera de `SKILL.md` a un archivo aparte, alcanzada por un **puntero de contexto**, cargada solo cuando el puntero se dispara. (Abarca desde la referencia _revelada_ — un archivo hermano como `glosario.md`, aún parte del skill — hasta la **referencia externa** plena que vive fuera del sistema de skills y a la que cualquier skill puede apuntar.)

Un criterio de finalización exigente impulsa un **legwork** minucioso — la excavación que hace el agente dentro del trabajo — tenga el skill pasos o no, porque "cada regla aplicada" ata la referencia plana igual que "cada paso hecho" ata una secuencia.

Empuja demasiado poco hacia abajo y la cima se hincha; empuja demasiado y escondes material que el agente realmente necesita. Esa tensión es toda la decisión.

La **progressive disclosure** es el movimiento escalera abajo — fuera de `SKILL.md` hacia un archivo enlazado — para que la cima siga siendo legible. Mecánica: un archivo `.md` enlazado en la carpeta del skill, nombrado por lo que contiene (este skill revela sus definiciones completas en `glosario.md`). Algunos skills se usan de más de una manera, y cada manera distinta es una **branch** — ejecuciones distintas que toman caminos distintos por el skill. El branching es la prueba de revelado más limpia: inlinear lo que toda branch necesita, y empujar detrás de un puntero lo que solo algunas branches alcanzan. La _redacción_ de un **puntero de contexto**, no su destino, decide cuándo y con qué fiabilidad el agente alcanza el material.

Donde la escalera decide _cuán abajo_ se sitúa una pieza, la **co-ubicación** decide _qué se sitúa a su lado_ una vez allí: mantener la definición, reglas y salvedades de un concepto bajo un mismo encabezado en vez de dispersas, para que leer una parte traiga consigo a sus vecinas.

## Cuándo dividir

La **granularidad** es cuán finamente divides los skills, y cada corte gasta una de las dos cargas, así que divide solo cuando el corte lo compense. Dos cortes:

- **Por invocación** — separar un skill **invocado por el modelo** cuando tengas una **leading word** distinta que deba dispararlo por sí sola, u otro skill deba alcanzarlo. Pagas **carga de contexto** por la nueva **description** siempre cargada, así que ese alcance independiente tiene que valerlo.
- **Por secuencia** — dividir una tirada de **pasos** cuando los pasos que quedan por delante (los **pasos post-finalización** de un paso) tienten al agente a apresurar el que tiene enfrente (**finalización prematura**). Mantenerlos fuera de la vista anima al agente a hacer más **legwork** en la tarea actual.

## Poda

Mantener cada significado en una **única fuente de verdad**: un lugar autoritativo, para que cambiar el comportamiento sea una edición en un solo sitio.

Comprobar cada línea por **relevancia**: ¿sigue incidiendo en lo que hace el skill?

Luego cazar **no-ops** frase a frase, no solo línea a línea: aplicar el test de no-op a cada frase en aislamiento, y cuando una falle, borrar la frase entera en vez de recortarle palabras. Ser agresivo — la mayor parte de la prosa que falla debe irse, no reescribirse.

## Leading words

Una **leading word** es un concepto compacto que ya vive en el pretraining del modelo y con el que el agente piensa mientras ejecuta el skill (p. ej. _lección_, _niebla de guerra_, _balas trazadoras_). Repetida a lo largo del texto (aunque no necesariamente — una leading word fuerte puede necesitarse solo una vez), acumula una definición distribuida y ancla toda una región de comportamiento en los mínimos tokens, reclutando priors que el modelo ya posee.

Sirve a la predictibilidad dos veces. En el cuerpo ancla la _ejecución_: el agente recurre al mismo comportamiento cada vez que aparece la palabra. En la description ancla la _invocación_: cuando la misma palabra vive en tus prompts, docs y código, el agente vincula ese lenguaje compartido con el skill y lo dispara con más fiabilidad.

Cazar oportunidades de refactorizar skills para usar leading words. Una tríada deletreada en tres sitios (**duplicación**), una description gastando una frase en señalar una sola idea — cada una es un pasaje pidiendo **colapsar** en un único token. Ejemplos:

- "rápido, determinista, de baja sobrecarga" -> _ajustado_ — una cualidad reformulada a lo largo de una fase — en una sola palabra preentrenada (un bucle _ajustado_).
- "un bucle en el que crees" -> _red_ — convierte una compuerta difusa en un estado binario observable (el bucle se pone _red_ con el bug, o no).

Ganas dos veces: menos tokens, _y_ un gancho más afilado del que el agente cuelga su pensamiento. Asume que cada skill carga reformulaciones que las leading words jubilan — ve a encontrarlas.

## Modos de fallo

Usarlos para diagnosticar problemas que el usuario pueda estar teniendo con el skill.

- **Finalización prematura** — terminar un paso antes de que esté genuinamente hecho, la atención resbalando hacia _estar terminado_. Defensa, en orden: afilar primero el criterio de finalización (barato, local); solo si es irreduciblemente difuso _y_ observas la prisa, esconder los pasos post-finalización dividiendo (el corte por secuencia).
- **Duplicación** — el mismo significado en más de un lugar. Cuesta mantenimiento y tokens, e infla la prominencia de un significado en la escalera por encima de su rango real.
- **Sedimento** — capas rancias que se asientan porque añadir se siente seguro y quitar se siente arriesgado. El destino por defecto de cualquier skill sin disciplina de poda.
- **Sprawl** — un skill simplemente demasiado largo, incluso cuando cada línea está viva y es única. Daña la legibilidad y la mantenibilidad y desperdicia tokens. La cura es la escalera: revelar la **referencia** detrás de punteros, y dividir por **branch** o secuencia para que cada camino cargue solo lo que necesita.
- **No-op** — una línea que el modelo ya obedece por defecto, así que pagas carga para no decir nada. El test: ¿cambia el comportamiento respecto al default? Una leading word débil (_sé minucioso_ cuando el agente ya es más o menos minucioso) es un no-op; el arreglo es una palabra más fuerte (_implacable_), no una técnica distinta.
- **Negación** — dirigir por prohibición sale al revés: _no pienses en un elefante_ nombra al elefante y lo hace más disponible, no menos. Prompt en **positivo** — enunciar el comportamiento objetivo para que el prohibido nunca se pronuncie; conservar una prohibición solo como guardrail duro que no puedas formular en positivo, y aun entonces emparejarla con qué hacer en su lugar.
