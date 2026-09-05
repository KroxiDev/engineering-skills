# Glosario — Construir grandes skills

El modelo de dominio de lo que hace grande a un skill. Un skill existe para arrancarle determinismo a un sistema estocástico; la virtud raíz es la **Predictibilidad**, y cada término de abajo es una palanca sobre ella. Esta es la referencia revelada de [`writing-great-skills`](../SKILL.md).

Los términos se agrupan por eje: **Invocación** (cómo se alcanza un skill), **Jerarquía de información** (cómo se organiza su contenido), **Dirección** (cómo se moldea el comportamiento del agente en ejecución) y **Poda** (cómo se mantiene magro). Cada **modo de fallo** vive junto a la palanca que lo cura, etiquetado _modo de fallo_.

Los **términos en negrita** dentro de cualquier definición están a su vez definidos en este glosario; encontrarlos por su encabezado.

## Predictibilidad

El grado en que un skill hace que el agente se comporte de la misma _manera_ en cada ejecución — el mismo proceso, no la misma salida (un skill de brainstorming debe divergir _predeciblemente_; sus tokens varían, su comportamiento no). La virtud raíz a la que sirve todo otro término — el coste y la mantenibilidad son síntomas de ella, no rivales.

_Evitar_: consistencia, fiabilidad, robustez, determinismo-de-salida

## Invocación

Cómo se alcanza un skill — y las dos cargas que pagas por la elección.

### Invocado por el modelo

Un skill que conserva su campo **description**, de modo que el agente puede verlo y dispararlo de forma autónoma — y el humano aún puede escribir su nombre, así que la invocación por el modelo siempre _incluye_ el alcance del usuario. No existe un estado solo-modelo: una description solo _añade_ descubrimiento por el agente, nunca quita el del humano. Paga una **carga de contexto** permanente en cada turno a cambio de esa descubribilidad. Alcanzable por otros skills, porque la description que lo hace descubrible por el agente lo hace invocable. Un skill invocado por el modelo cuyo contenido es todo **referencia** es también un hogar para referencia compartida: otro skill puede invocarlo, así que la referencia que necesitan varios skills vive en un solo lugar. Elegir invocación por el modelo solo cuando el agente deba alcanzar el skill por su cuenta; si nunca se dispara salvo a mano, quitar la description y no pagar carga de contexto.

_Evitar_: habilidad, herramienta, capacidad

### Invocado por el usuario

Un skill con su **description** retirada — invisible para el agente y alcanzable solo por el humano escribiendo su nombre (solo-usuario, donde **invocado por el modelo** es usuario-y-agente). Cambia la descubribilidad por el agente por cero **carga de contexto**. Como no tiene description, nada salvo el humano puede alcanzarlo: ningún otro skill puede dispararlo.

_Evitar_: procedimiento, workflow, comando

### Description

El disparador legible por máquina del skill, y el único **puntero de contexto** que un skill **invocado por el modelo** está obligado a mantener cargado en todo momento. Su mera presencia _es_ el eje de invocación: consérvala y el skill es invocado por el modelo (y alcanzable por otros skills); bórrala y el skill es **invocado por el usuario**, alcanzable solo por el humano. La fuente de la **carga de contexto** de un skill invocado por el modelo.

_Evitar_: frontmatter, resumen

### Puntero de contexto

Una referencia mantenida en el contexto del agente que nombra material fuera de contexto y codifica la condición para alcanzarlo. La **description** es el puntero de contexto de nivel superior (ventana de contexto → skill); los punteros a archivos revelados son el mismo objeto un nivel más abajo. Su redacción, no el destino, decide _cuándo_ alcanza el agente — y _con qué fiabilidad_. Un destino imprescindible detrás de un puntero débilmente redactado es un bug de varianza: arreglar primero la redacción, e inlinear el material solo si afilarla falla.

_Evitar_: enlace, referencia, import

### Carga de contexto

El coste que un skill **invocado por el modelo** impone sobre la ventana de contexto del agente — su **description**, siempre cargada, gastando tokens y atención. De lo que escapan los skills **invocados por el usuario** al no tener description, y el freno a dividir en más skills invocados por el modelo.

_Evitar_: coste de tokens, hinchazón de contexto

### Carga cognitiva

El coste que un skill **invocado por el usuario** impone sobre el humano — lo que debe mantener en la cabeza: qué skills existen y cuándo recurrir a cada uno (el humano es el índice). Lo que la **invocación por el modelo** elimina al ser descubrible por el agente, y el freno a dividir en más skills invocados por el usuario. No es un coste a minimizar: es el precio de la agencia humana, la razón por la que algunos skills permanecen invocados por el usuario. Gastarla donde importe el juicio humano; quitarla donde no.

_Evitar_: índice humano, carga, sobrecoste

### Router skill

Un skill **invocado por el usuario** cuyo trabajo es apuntar a tus otros skills invocados por el usuario — nombrando cada uno y cuándo recurrir a él — para que el humano tenga un skill que recordar en vez de muchos. Solo puede insinuar, nunca dispararlos: los skills invocados por el usuario no tienen **description**, así que nada salvo el humano puede alcanzarlos. La cura de la **carga cognitiva** cuando los skills invocados por el usuario se multiplican.

_Evitar_: dispatcher, menú, registro, índice, procedimiento router

### Granularidad

Cuán finamente divides los skills. Una división más fina gasta una de las dos cargas: más skills **invocados por el modelo** gastan **carga de contexto** (más descriptions abarrotando la ventana y compitiendo por atención); más skills **invocados por el usuario** gastan **carga cognitiva** (más que el humano debe recordar y alcanzar). Dos cortes guían la división. Por **invocación**, separar un skill invocado por el modelo donde tengas una **leading word** distinta que lo dispare — una palabra disparadora que realmente uses en tus prompts. Por **secuencia**, dividir una tirada de **pasos** donde los **pasos post-finalización** de un paso necesiten esconderse, ya que aislarlo en su propio contexto despeja lo que sigue. Cuidado con lo inverso: fusionar secuencias expone los pasos post-finalización de cada paso a lo que sigue, invitando a la finalización prematura.

_Evitar_: chunking, modularidad

## Jerarquía de información

Cómo se organiza el contenido de un skill, y cuán abajo de la escalera se sitúa cada pieza.

### Jerarquía de información

El contenido de un skill ordenado por cuán inmediatamente lo necesita el agente — una sola escalera, producida por dos cortes: en el archivo o detrás de un puntero, y paso o referencia. Los peldaños:

- **Pasos** — en el archivo, primario
- **Referencia**, en el archivo — secundario
- **Referencia**, revelada — detrás de un **puntero de contexto**

Un skill sin **pasos** usa solo los dos peldaños de abajo — a menudo un conjunto de pares legítimamente plano (p. ej. todas las reglas de una revisión en un peldaño), que es un arreglo válido, no un smell. La jerarquía es independiente de la invocación: un skill puede ser invocado por el modelo o por el usuario tanto si es todo pasos, todo referencia, o ambos. Cuando un skill tiene pasos, la referencia en el archivo que debería estar revelada los entierra y convierte atenderlos en un cara-o-cruz — una palanca de varianza, no solo de legibilidad. Mantener legible la cima de la escalera; empujar hacia abajo todo lo que se pueda.

_Evitar_: estructura, organización, layout

### Pasos

Las acciones ordenadas que realiza el agente — cuando un skill los tiene, el nivel primario de su contenido, y la parte que se gana su lugar en SKILL.md. No todo skill tiene pasos: un skill puede ser todo pasos (`tdd`), todo **referencia** (una revisión), o ambos, independientemente de la invocación. Cada paso termina en un **criterio de finalización**, claro o vago.

_Evitar_: workflow, instrucciones, coreografía

### Referencia

Material que el agente consulta bajo demanda — definiciones, hechos, parámetros, ejemplos, instrucciones condicionales. Cuando un skill tiene **pasos** es secundaria a ellos; cuando no tiene ninguno es el contenido entero; o vive completamente fuera de cualquier skill — ver **Referencia externa**. Alcanzada vía **punteros de contexto**, y la candidata principal a la **progressive disclosure**.

_Evitar_: material de apoyo, docs, contexto de fondo

### Referencia externa

**Referencia** que vive fuera del sistema de skills — un archivo plano, sin **description**, sin **pasos**, no invocable — a la que cualquier skill puede apuntar. El hogar de la referencia compartida que no necesita dispararse por sí sola, y el único hogar compartido que pueden usar dos skills **invocados por el usuario**, ya que ninguno tiene description y por tanto ninguno puede disparar al otro.

_Evitar_: doc, recurso, base de conocimiento

### Progressive disclosure

Mover la **referencia** escalera abajo — fuera de SKILL.md y detrás de un **puntero de contexto** — para que la cima siga siendo legible. No es primariamente una optimización de tokens; es cómo se protege la **jerarquía de información**. La licencia el **branching**: revelar lo que solo algunas branches necesitan, inlinear lo que todo camino necesita, y si un puntero se dispara con poca fiabilidad sobre material imprescindible, afilar su redacción, y traerlo de vuelta inline solo si eso falla.

_Evitar_: lazy loading, chunking

### Co-ubicación

Mantener el material que un agente necesita a la vez en un solo lugar — la definición, reglas y salvedades de un concepto bajo un único encabezado, no dispersas por el archivo — para que leer una parte traiga consigo a sus vecinas. El compañero intra-archivo de la **jerarquía de información**: la jerarquía ordena _cuán abajo_ se sitúa una pieza; la co-ubicación decide _qué se sitúa a su lado_ una vez allí. No hay fórmula para el formato correcto de un cuerpo de **referencia**; la prueba es que un skill debe leerse como documentación escrita para el agente, y el material agrupado se lee así donde el disperso no. Distinta de la **duplicación**: esa repite un significado en dos lugares, mientras que la dispersión fragmenta un solo significado en muchos.

_Evitar_: agrupación, clustering, cohesión

### Sprawl

_Modo de fallo._ Un skill simplemente demasiado largo — demasiadas líneas en SKILL.md — independientemente de si están rancias o repetidas. Incluso un skill todo-vivo y todo-único puede tener sprawl. Cuesta legibilidad (el agente vadea más antes de poder actuar, y la atención se adelgaza sobre el exceso), mantenibilidad (cada línea extra es una más que mantener **relevante**) y tokens. La cura es la **jerarquía de información**: empujar la **referencia** detrás de **punteros de contexto**, y dividir por **branch** o secuencia para que cada camino cargue solo lo que necesita. Distinto del **sedimento** (longitud por acumulación rancia) y de la **duplicación** (longitud por significado repetido) — el sprawl es la longitud misma, sea cual sea su causa.

_Evitar_: hinchazón, longitud, tamaño, verbosidad

## Dirección

Las palancas que moldean el comportamiento del agente en ejecución hacia la **Predictibilidad**.

### Branch

Una manera distinta en que un skill puede invocarse — un caso que el skill maneja — de modo que ejecuciones distintas toman caminos distintos por él. Un skill con muchos pasos puede cargar muchas branches; uno lineal no tiene ninguna.

_Evitar_: camino, caso, bifurcación

### Leading word

Un concepto compacto — también llamado _Leitwort_ — que ya vive en el pretraining del modelo, con el que el agente piensa mientras ejecuta el skill. Codifica un principio de comportamiento en los mínimos tokens posibles invocando priors que el modelo ya posee (p. ej. _lección_, _zona de desarrollo próximo_, _niebla de guerra_, _balas trazadoras_). Repetida como token, nunca como frase, acumula una definición distribuida a lo largo del skill y ancla toda una región de comportamiento. Acuñar la tuya propia funciona si la defines con claridad, pero una palabra inventada no recluta priors — pagas en tokens de definición lo que una palabra preentrenada da gratis. Recurrir primero a una palabra existente.

Una leading word sirve a la **predictibilidad** dos veces. En el cuerpo ancla la **ejecución** — el agente recurre al mismo comportamiento cada vez que aparece el concepto, y dentro de referencia plana enfoca la atención en una clase de cosa que buscar, reclutando las comprobaciones correctas en cada ejecución. En la **description** ancla la **invocación** — y no solo dentro del skill: cuando la misma palabra vive en tus prompts, tus docs y tu codebase, el agente vincula ese lenguaje compartido con el skill y lo dispara con más fiabilidad. Redactar una description con las leading words que realmente usas cuando quieres el skill.

_Evitar_: keyword, término, motivo

### Criterio de finalización

La condición que le dice al agente que una unidad de trabajo está hecha — el objetivo contra el que juzga. Dos propiedades lo hacen palanca, no solo cualidad. Su **claridad** (¿puede el agente distinguir hecho de no-hecho?) resiste la **finalización prematura** — un límite vago ("entendimiento alcanzado") deja al agente declararse hecho y resbalar al siguiente paso; este eje necesita _pasos_ para morder, ya que la finalización prematura es un fallo entre-pasos. Su **exigencia** (cuánto requiere) fija el **legwork** — "cada modelo modificado contabilizado" fuerza trabajo minucioso donde "producir una lista de cambios" no — y este eje _no_ está atado a los pasos: puede atar también un cuerpo de referencia plana, que es como un skill sin pasos sigue cargando un listón de exhaustividad ("cada regla aplicada"). Los criterios más fuertes son a la vez comprobables y exhaustivos.

_Evitar_: condición de hecho, condición de salida, regla de parada

### Legwork

El trabajo que un agente hace entre bastidores dentro de un solo paso — leer archivos, explorar el codebase, hacer cambios, desenterrar lo que necesita en vez de descargarlo en el usuario. Vive por debajo de la estructura de pasos: nunca escrito como paso propio, latente en la redacción, controlado por el agente y no por el skill. La contraparte intra-paso del tirón entre-pasos de los **pasos post-finalización**. Se eleva con una **leading word** (_exhaustivo_, _minucioso_) o con un **criterio de finalización** que exija que el trabajo sea exhaustivo — incluido el eje de exigencia aplicado a referencia plana, que es lo que impulsa a un skill de referencia plana a cubrir todos sus peldaños. Se adelgaza cuando falta esa exigencia o cuando la **finalización prematura** corta el paso antes de tiempo.

_Evitar_: alcance, esfuerzo, diligencia, cobertura

### Pasos post-finalización

Los **pasos** que siguen al paso actual. Visibles, tiran del agente hacia la **finalización prematura** — cuanto más ve, más fuerte el tirón; la defensa es esconderlos dividiendo la secuencia de pasos en dos.

_Evitar_: horizonte, niebla de guerra, lookahead

### Finalización prematura

_Modo de fallo._ Terminar el paso actual antes de que esté genuinamente hecho, porque la atención del agente resbala hacia estar terminado en vez de hacia el trabajo. Un fallo entre-pasos: necesita **pasos** para ocurrir — un skill sin pasos que abandona temprano no es finalización prematura sino **legwork** delgado bajo una exigencia incumplida. Un tira y afloja entre dos fuerzas: los **pasos post-finalización** visibles (el tirón hacia adelante) y la claridad del **criterio de finalización** (la resistencia — un listón afilado y comprobable aguanta; uno vago cede). La difusidad es la condición necesaria: un límite afilado resiste el tirón por muchos pasos posteriores que se vean, así que un paso que nunca se apresura no necesita defensa. Dos palancas sostienen a uno que sí, pero recurrir a ellas en orden: **afilar primero el límite** — es local y barato. Solo cuando el criterio es irreduciblemente difuso _y_ observas de verdad la prisa, **esconder los pasos posteriores** — y esconder solo funciona a través de un límite de contexto real (un traspaso invocado por el usuario o un despacho a subagente; una llamada inline invocada por el modelo deja los pasos posteriores en contexto y no despeja nada). Una causa del legwork delgado, pero distinta de él: el legwork puede ser delgado incluso cuando un paso corre hasta la finalización completa.

_Evitar_: cierre prematuro, la prisa, apresurarse, atajar

### Negación

_Modo de fallo._ Dirigir por prohibición — decirle al agente qué _no_ hacer — lo cual arrastra el comportamiento prohibido al contexto y lo hace _más_ disponible, no menos. _No pienses en un elefante_, y el elefante es todo lo que hay; _nunca escribas comentarios verbosos_, y la verbosidad es el patrón que el agente acaba de leer. La negación es un modificador débil que el concepto fuertemente activado desborda, así que la prohibición se lee a medias como instrucción de hacer la cosa. Su **leading word** es el _elefante_: aquello que una prohibición nombra dentro del marco. Cura: prompt en **positivo** — describir el comportamiento objetivo ("escribe comentarios de una línea") para que el prohibido nunca se pronuncie. Una prohibición se gana su lugar solo como guardrail duro sobre un comportamiento que no puedes formular en positivo; incluso entonces, emparejarla con el objetivo positivo para que la atención aterrice en qué hacer.

_Evitar_: rebote irónico, don't-prompting, el elefante rosa

## Poda

Mantener un skill magro — cada remedio emparejado con el fallo que cura.

### Única fuente de verdad

El estado deseado donde cada significado vive en exactamente un lugar autoritativo, de modo que un cambio en el comportamiento del skill es un cambio en un solo lugar. La **duplicación** es su violación.

_Evitar_: hogar, ubicación canónica

### Duplicación

_Modo de fallo._ El mismo significado con más de una **única fuente de verdad**. Cuesta mantenimiento (cambias un lugar, debes cambiar los otros), cuesta tokens, e infla la prominencia — repetir un significado lo pondera en la escalera por encima de su rango real. La inversa accidental de una **leading word**, que eleva la atención a propósito repitiendo un token, nunca el significado.

_Evitar_: repetición, redundancia

### Relevancia

Si una línea sigue incidiendo en lo que hace el skill — la lente para decidir qué conservar. Una línea pierde relevancia o bien por no incidir nunca en la tarea (mera exposición, o una **branch** que debería revelarse) o bien por ranciarse: quedar desfasada a medida que el comportamiento o el mundo que describe cambia. Los skills más cortos son más fáciles de mantener relevantes, porque cada línea es más barata de comprobar. Distinta del **no-op**: la relevancia pregunta si una línea incide en la tarea, no si cambia el comportamiento.

_Evitar_: load-bearing, ranciedad, frescura

### Sedimento

_Modo de fallo._ Capas de contenido viejo que se asientan en un skill y nunca se limpian, porque añadir se siente seguro y quitar se siente arriesgado — así las líneas rancias e irrelevantes se acumulan y hay que perforar a través de ellas para encontrar lo que sigue vivo. El destino por defecto de cualquier skill sin disciplina de poda; la erosión lenta de la **relevancia**, frente al significado repetido de la **duplicación**.

_Evitar_: acreción, hinchazón, cruft, podredumbre

### No-op

_Modo de fallo._ Una instrucción que no cambia nada porque el modelo ya lo hace por defecto — pagas carga para decirle al agente lo que haría de todos modos. El test: ¿cambia una línea el comportamiento respecto al default? Una línea puede ser perfectamente **relevante** y aun así ser un no-op. Los mismos priors que hacen gratis a una **leading word** hacen inútil a un no-op.

Una leading word es una _técnica_; el no-op es un _veredicto_ sobre una línea — y se cruzan. Una leading word demasiado débil para vencer al default es un no-op (_sé minucioso_ cuando el agente ya es más o menos minucioso), y el arreglo es una palabra más fuerte que pase el veredicto (_implacable_), no una técnica distinta. Así que el test del no-op — ¿cambia el comportamiento respecto al default? — es también cómo calificas si una leading word se está ganando sus repeticiones. Esto es relativo al modelo, no al lector: dos personas que discrepan sobre si una línea es un no-op discrepan sobre el default, y lo zanjan ejecutando el skill, no debatiendo.

_Evitar_: instrucción redundante, reafirmar lo obvio, machacar
