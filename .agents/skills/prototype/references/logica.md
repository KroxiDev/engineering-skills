# Prototipo de lógica

Un único archivo HTML autocontenido — una **demo compartible** — que permite a cualquiera manejar un modelo de estado pulsando botones. Usar esto cuando la pregunta trate de **lógica de negocio, transiciones de estado o forma de datos** — el tipo de cosa que parece razonable sobre el papel pero solo se siente mal cuando la empujas por casos reales.

Como es un solo archivo sin nada que instalar, puedes dárselo a alguien no técnico — un diseñador, un PM, un experto de dominio — y dejar que sienta el modelo por sí mismo. Así que habla su idioma, no el del código.

## Cuándo esta es la forma correcta

- "No estoy seguro de si esta máquina de estados maneja el caso límite donde X y luego Y."
- "¿Este modelo de datos me deja de verdad representar el caso donde...?"
- "Quiero tantear cómo debería verse la API antes de escribirla."
- Cualquier cosa donde alguien quiera **pulsar botones y ver cambiar el estado**.

Si la pregunta es "cómo debería verse esto" — rama equivocada. Usar [ui.md](ui.md).

## Proceso

### 1. Enunciar la pregunta

Antes de escribir código, dejar por escrito qué modelo de estado y qué pregunta se está prototipando. Un párrafo, al principio de la demo (en una introducción visible, no solo en un comentario). Un prototipo de lógica que responde la pregunta equivocada es puro desperdicio — hacer la pregunta explícita para que pueda comprobarse después, tanto si el usuario está mirando ahora como si vuelve a ello más tarde.

### 2. Aislar la lógica en un módulo portable

Poner la lógica real — la parte que responde la pregunta — en un único bloque `<script>` escrito como un módulo pequeño y puro que pueda extraerse y soltarse en el codebase real más adelante. La página de alrededor es descartable; este módulo no.

La forma correcta depende de la pregunta:

- **Un reducer puro** — `(state, action) => state`. Bueno cuando las acciones son eventos discretos y el estado es un único valor.
- **Una máquina de estados** — estados y transiciones explícitos. Buena cuando "qué acciones son siquiera legales ahora mismo" es parte de la pregunta.
- **Un conjunto pequeño de funciones puras** sobre un tipo de datos plano. Bueno cuando no hay estado actual implícito — solo transformaciones.
- **Una clase o módulo con una superficie de métodos clara** cuando la lógica genuinamente posee estado interno continuo.

Elegir la forma que mejor encaje con la pregunta planteada, _no_ la que sea más fácil de cablear a una página. Mantenerla pura: sin DOM, sin `document`, sin handlers de botones metiendo la mano dentro. La página la llama; nada fluye en la dirección contraria. Esto es lo que hace al prototipo útil más allá de su propia vida: cuando la pregunta esté respondida, el reducer / máquina / conjunto de funciones validado se extrae al módulo real por sí solo.

### 3. Construir el archivo HTML compartible

Un archivo, HTML/CSS/JS plano — sin framework, sin bundler, sin servidor, todo inline para que se abra con doble clic y sobreviva a que lo manden por correo. Cualquiera debería poder ejecutarlo abriéndolo.

Escribirlo para alguien no técnico. Cada etiqueta va en **lenguaje de dominio**, no en código — botones y estado se leen como el negocio, no como el reducer. Explicar en palabras llanas qué está pasando.

Maquetarlo con una jerarquía limpia, de arriba abajo:

1. **Título y una línea de explicación** de qué deja explorar esta demo (la pregunta del paso 1).
2. **Estado actual** — el estado relevante completo, renderizado como un panel legible (campos etiquetados, no un volcado de JSON crudo), re-renderizado tras cada clic para que el cambio sea visible. Donde ayude a alguien no técnico a seguir el hilo, señalar qué acaba de cambiar.
3. **Botones de juego libre** — un botón por acción, siempre disponibles, para que cualquiera pueda tantear el modelo en el orden que quiera. Cada clic despacha su acción y re-renderiza el estado.
4. **Recorridos guiados** — un conjunto de **escenarios**, uno por pestaña. Cada pestaña contiene una descripción breve en lenguaje llano del escenario — la situación que plantea y qué hay que observar — y debajo, los **botones a pulsar** en orden para ese escenario. Cada paso es un botón real: al pulsarlo ejecuta esa acción y avanza al siguiente. Arrancar un recorrido resetea a un estado inicial conocido para que el escenario corra igual siempre.

Elegir escenarios que demuestren los casos incómodos — el camino feliz, un caso límite peliagudo, un intento de algo que debería ser ilegal — los que son difíciles de razonar sobre el papel.

Mantenerlo bonito pero sobrio: tipografía limpia, espaciado generoso, un solo color de acento. Sin animaciones, sin florituras — nada que compita con el estado y los botones.

### 4. Entregarlo

Mandarles el archivo, o abrírselo. Recorrerán los guiados y jugarán libre cuando puedan; los momentos interesantes son cuando dicen "espera, eso no debería ser posible" o "vaya, asumí que X sería distinto" — esos son los bugs de la _idea_, que es todo el punto. Si quieren acciones nuevas o un escenario nuevo, añadirlos. Los prototipos evolucionan.

### 5. Capturar la respuesta y el prototipo

Cuando el prototipo haya respondido su pregunta, capturar la respuesta, y luego capturar el prototipo como describe el [SKILL](../SKILL.md). El mapeo específico de lógica: el reducer / máquina / conjunto de funciones validado se extrae al módulo real (la decisión, absorbida); el cascarón HTML viaja a la branch descartable que conserva el prototipo como fuente primaria — y al ser un solo archivo autocontenido, allí sigue siendo trivial de volver a ejecutar.

## Anti-patrones

- **No añadir tests.** Un prototipo que necesita tests ya no es un prototipo.
- **No cablearlo a la base de datos real.** Usar estado en memoria a menos que la pregunta sea específicamente sobre persistencia.
- **No generalizar.** Nada de "¿y si quisiéramos soportar X más adelante?". El prototipo responde una pregunta.
- **No difuminar la lógica y la página juntas.** Si el módulo puro referencia el DOM, `document` o handlers de botones, ya no es extraíble. Mantener la página como un cascarón delgado sobre un módulo puro.
- **No recurrir a un framework, un bundler o un servidor.** Un archivo que el destinatario abre con doble clic; una app de React o un dev server destruyen lo de "compartible".
- **No enviar el cascarón HTML a producción.** La página está optimizada para recorrerse a mano a golpe de clic. El módulo de lógica detrás de ella es la parte que vale la pena conservar.
