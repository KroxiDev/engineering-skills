---
name: writing-for-agents
description: Escribir documentos para agentes. Usar al crear o editar skills, o al modificar AGENTS.md o CLAUDE.md.
---

Referencia para escribir cualquier documento que consuma un agente — un skill, un `AGENTS.md` / `CLAUDE.md`, un doc alcanzado por un puntero. El empaquetado difiere; la escritura no: las mismas palancas hacen predecible a cada uno — que el agente siga el mismo _proceso_ en cada ejecución, no que produzca la misma salida.

Cuando el documento que escribes es un skill, leer [`mecanica-de-skills.md`](references/mecanica-de-skills.md) para frontmatter, elección de invocación y router skills.

## Punteros de contexto

Un **puntero de contexto** es una referencia mantenida en el contexto del agente que nombra material fuera de contexto y codifica la condición para alcanzarlo. La description de un skill es uno; una línea de `AGENTS.md` que nombra un doc es el mismo objeto. La _redacción_ del puntero, no su destino, decide cuándo alcanza el agente el material — y con qué fiabilidad. Un destino imprescindible detrás de un puntero débilmente redactado es un bug de varianza: afilar primero la redacción, e inlinear el material solo si afilarla falla.

Un puntero hace dos trabajos — decir qué es el material y listar las **branches** que deben disparar su alcance (una branch es un caso distinto que el documento maneja, de modo que ejecuciones distintas toman caminos distintos por él). Cada palabra de un puntero siempre cargado cuesta en cada turno, así que se gana una poda aún más dura que el cuerpo:

- **Poner por delante la leading word** — el puntero es donde hace su trabajo de disparo.
- **Un disparador por branch.** Los sinónimos que renombran una misma branch son una branch escrita dos veces; colapsarlos y conservar solo las branches genuinamente distintas.
- **Recortar la identidad que ya carga el cuerpo.**

## Las dos cargas

Cada documento y cada puntero que añades gasta uno de dos presupuestos:

- **Carga de contexto** — el coste del material siempre cargado sobre la ventana del agente: una línea de `AGENTS.md`, la description de un skill, cualquier cosa que esté en contexto en cada turno, gastando tokens y atención se dispare o no.
- **Carga cognitiva** — el coste sobre el humano: qué documentos existen y cuándo recurrir a cada uno. El humano es el índice. No es un coste a minimizar — es el precio de la agencia humana; gastarla donde importe el juicio humano, quitarla donde no.

El material alcanzado solo a través de un puntero escapa de la carga de contexto al precio de la línea del propio puntero; el material sin puntero alguno viaja enteramente sobre la carga cognitiva.

## Jerarquía de información

Un documento se construye con dos tipos de contenido — **pasos** (las acciones ordenadas que realiza el agente) y **referencia** (definiciones, reglas, hechos consultados bajo demanda) — que se mezclan libremente: todo pasos (una receta), todo referencia (las reglas de una revisión, este skill), o ambos. La decisión central es dónde se sitúa cada pieza en la **jerarquía de información**, una escalera ordenada por cuán inmediatamente necesita el agente el material:

1. **Paso en el archivo** — el nivel primario: qué hace el agente, en orden.
2. **Referencia en el archivo** — consultada bajo demanda. A menudo un conjunto de pares legítimamente plano (todas las reglas de una revisión en un mismo peldaño) — un arreglo válido, no un smell.
3. **Referencia revelada** — empujada a un archivo aparte, alcanzada por un puntero de contexto, cargada solo cuando el puntero se dispara. Abarca desde un archivo hermano en la misma carpeta hasta la referencia externa plena, que vive en cualquier sitio y a la que cualquier documento puede apuntar.

Empuja demasiado poco hacia abajo y la cima se hincha; empuja demasiado y escondes material que el agente realmente necesita. Esa tensión es toda la decisión.

La **progressive disclosure** es el movimiento escalera abajo — fuera del archivo principal y detrás de un puntero — para que la cima siga siendo legible. No es primariamente una optimización de tokens: es cómo se protege la jerarquía. El branching es la prueba de revelado más limpia: inlinear lo que toda branch necesita, y empujar detrás de un puntero lo que solo algunas branches alcanzan. Cuando un documento tiene pasos, la referencia en el archivo que debería revelarse los entierra y convierte atenderlos en un cara-o-cruz — una palanca de varianza, no solo de legibilidad.

La **co-ubicación** es el compañero intra-archivo: donde la escalera decide _cuán abajo_ se sitúa una pieza, la co-ubicación decide _qué se sitúa a su lado_ una vez allí. Mantener la definición, reglas y salvedades de un concepto bajo un mismo encabezado en vez de dispersas, para que leer una parte traiga consigo a sus vecinas. La prueba: el documento debe leerse como documentación escrita para el agente — el material agrupado se lee así; el disperso no. (Distinta de la duplicación: esa repite un significado en dos lugares; la dispersión fragmenta un solo significado en muchos.)

El **sprawl** es el modo de fallo de aquí: un documento simplemente demasiado largo, incluso cuando cada línea está viva y es única. La atención se adelgaza sobre el exceso, y cada línea extra es una más que mantener relevante. La cura es la escalera: revelar la referencia detrás de punteros, y dividir por branch o secuencia para que cada camino cargue solo lo que necesita.

## Pasos y criterios de finalización

Cada paso termina en un **criterio de finalización** — la condición que le dice al agente que el trabajo está hecho. Dos propiedades lo hacen palanca:

- **Claridad** — ¿puede el agente distinguir hecho de no-hecho? Un límite vago ("entendimiento alcanzado") invita a la **finalización prematura**: terminar el paso antes de que esté genuinamente hecho, la atención resbalando hacia _estar terminado_. Los pasos visibles que aún quedan por delante — los **pasos post-finalización** — aportan el tirón; la claridad del criterio es la resistencia. Defender en orden: **afilar primero el límite** (local y barato); solo si es irreduciblemente difuso _y_ observas la prisa, esconder los pasos posteriores dividiendo la secuencia — y esconder solo funciona a través de un límite de contexto real (un traspaso o un despacho a subagente; una llamada inline deja los pasos posteriores en contexto y no despeja nada).
- **Exigencia** — cuánto requiere. "Cada modelo modificado contabilizado" fuerza trabajo minucioso donde "producir una lista de cambios" no. La exigencia impulsa el **legwork** — la excavación que hace el agente dentro del trabajo, latente en la redacción en vez de escrita como paso propio — y no está atada a los pasos: "cada regla aplicada" ata un cuerpo de referencia plana igual que "cada paso hecho" ata una secuencia, que es como un documento todo-referencia sigue cargando un listón de exhaustividad.

Los criterios más fuertes son a la vez comprobables y exhaustivos.

## Cuándo dividir

Dividir un documento en dos gasta una de las dos cargas, así que dividir solo cuando el corte lo compense:

- **Por secuencia** — dividir una tirada de pasos donde los pasos post-finalización tienten al agente a apresurar el que tiene enfrente. Mantenerlos fuera de la vista impulsa más legwork en la tarea actual. Cuidado con lo inverso: fusionar secuencias expone los pasos posteriores de cada paso a lo que sigue, invitando a la finalización prematura.
- **Por invocación** — específico de skills: ver [`mecanica-de-skills.md`](references/mecanica-de-skills.md).

## Leading words

Una **leading word** es un concepto compacto que ya vive en el pretraining del modelo y con el que el agente piensa mientras ejecuta el documento (_lección_, _niebla de guerra_, _balas trazadoras_). Repetida como token, nunca como frase, acumula una definición distribuida y ancla toda una región de comportamiento en los mínimos tokens, reclutando priors que el modelo ya posee. Acuñar la tuya propia funciona si la defines con claridad, pero una palabra inventada no recluta priors — pagas en tokens de definición lo que una palabra preentrenada da gratis; recurrir primero a una palabra existente.

Ancla dos veces. En el cuerpo, la _ejecución_: el agente recurre al mismo comportamiento cada vez que aparece la palabra, y dentro de referencia plana enfoca la atención en una clase de cosa que buscar. En un puntero, la _invocación_: cuando la misma palabra vive en tus prompts, tus docs y tu codebase, el agente vincula ese lenguaje compartido con el material y lo alcanza con más fiabilidad.

Cazar oportunidades de refactorizar con leading words. Una tríada deletreada en tres sitios, un puntero gastando una frase en señalar una sola idea — cada uno es un pasaje pidiendo colapsar en un único token:

- "rápido, determinista, de baja sobrecarga" → _ajustado_ (un bucle _ajustado_).
- "un bucle en el que crees" → _red_ — una compuerta difusa se vuelve un estado binario observable (el bucle se pone _red_ con el bug, o no).

Ganas dos veces: menos tokens, y un gancho más afilado del que el agente cuelga su pensamiento. Asume que cada documento carga reformulaciones que las leading words jubilan — ve a encontrarlas.

La **negación** es el modo de fallo que acompaña a esta palanca: dirigir por prohibición arrastra el comportamiento prohibido al contexto y lo hace _más_ disponible, no menos. _No pienses en un elefante_, y el elefante es todo lo que hay; la negación es un modificador débil que el concepto fuertemente activado desborda, así que la prohibición se lee a medias como instrucción de hacer la cosa. Prompt en **positivo** — enunciar el comportamiento objetivo ("escribe comentarios de una línea") para que el prohibido nunca se pronuncie. Una prohibición se gana su lugar solo como guardrail duro que no puedas formular en positivo; incluso entonces, emparejarla con el objetivo positivo para que la atención aterrice en qué hacer.

## Poda

- Mantener cada significado en una **única fuente de verdad**: un lugar autoritativo, para que cambiar el comportamiento sea una edición en un solo sitio. La **duplicación** — el mismo significado en más de un lugar — cuesta mantenimiento y tokens, e infla la prominencia de un significado en la escalera por encima de su rango real. (La inversa accidental de una leading word, que repite un token a propósito, nunca el significado.)
- El **entorno** también es una fuente de verdad — los scripts de `package.json`, los archivos de configuración, la disposición de directorios, la salida de `--help` — y un documento que lo reformula es una **cache**: una copia de una consulta, que se gana su carga solo cuando la consulta es cara. Cachear lo que el agente no puede encontrar mirando: la convención no escrita, la razón detrás de una elección, la trampa que ninguna configuración confiesa. Dejar las consultas de un archivo o un comando al entorno, donde no pueden ranciarse.
- Comprobar cada línea por **relevancia**: ¿sigue incidiendo en lo que hace el documento? Una línea pierde relevancia por no incidir nunca en la tarea (mera exposición, o una branch que debería revelarse) o por ranciarse a medida que el comportamiento o el mundo que describe cambia. Los documentos más cortos son más fáciles de mantener relevantes. Sin disciplina de poda, el destino por defecto es el **sedimento**: capas rancias que se asientan porque añadir se siente seguro y quitar se siente arriesgado, hasta que hay que perforar a través de ellas para encontrar lo que sigue vivo.
- Cazar **no-ops** frase a frase: una instrucción que el modelo ya obedece por defecto paga carga para no decir nada. El test — ¿cambia el comportamiento respecto al default? — es relativo al modelo, no al lector: dos personas que discrepan sobre un no-op discrepan sobre el default, y lo zanjan ejecutando el documento, no debatiendo. Cuando una frase falla, borrar la frase entera en vez de recortarle palabras. El test también califica a las leading words: una palabra demasiado débil para vencer al default (_sé minucioso_ cuando el agente ya es más o menos minucioso) es un no-op, y el arreglo es una palabra más fuerte (_implacable_), no una técnica distinta.
