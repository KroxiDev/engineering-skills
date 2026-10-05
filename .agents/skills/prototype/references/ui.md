# Prototipo de UI

Generar **varias variantes de UI radicalmente distintas** en una sola ruta, conmutables desde una barra inferior flotante. El usuario alterna entre variantes en el navegador, elige una (o roba trozos de cada una), y luego tira el resto.

Si la pregunta es sobre lógica/estado y no sobre cómo se ve algo — rama equivocada. Usar [logica.md](logica.md).

## Cuándo esta es la forma correcta

- "¿Cómo debería verse esta página?"
- "Quiero ver algunas opciones para este dashboard antes de comprometerme."
- "Prueba un layout distinto para la pantalla de ajustes."
- Cada vez que el usuario, si no, pasaría un día eligiendo entre tres mockups vagos en su cabeza.

## Dos sub-formas — preferir fuertemente la sub-forma A

Un prototipo de UI es mucho más fácil de juzgar cuando está **pegado contra el resto de la app** — header real, sidebar real, datos reales, densidad real. Una ruta descartable por sí sola es un vacío: toda variante se ve bien en aislamiento. Elegir por defecto la sub-forma A siempre que exista una página plausible que hospede las variantes. Recurrir a la sub-forma B solo si el prototipo genuinamente no tiene un hogar cercano.

### Sub-forma A — ajuste a una página existente (preferida)

La ruta ya existe. Las variantes se renderizan **en la misma ruta**, controladas por un search param `?variant=` en la URL. El data fetching, los params y la auth existentes se quedan — solo cambia el renderizado. Este es el default; elegirlo salvo que haya una razón específica para no hacerlo.

Si el prototipo es para algo que aún no tiene página pero que _viviría naturalmente dentro de una_ (una sección nueva del dashboard, una card nueva en la pantalla de ajustes, un paso nuevo en un flujo existente) — eso sigue siendo sub-forma A. Montar las variantes dentro de la página anfitriona.

### Sub-forma B — una página nueva (último recurso)

Usarla solo cuando lo prototipado genuinamente no tenga ninguna página existente donde vivir — p. ej. una superficie de primer nivel completamente nueva, o un flujo que no puede incrustarse en ningún sitio razonable.

Crear una **ruta descartable** siguiendo la convención de routing que el proyecto ya use — no inventar una estructura de primer nivel nueva. Nombrarla para que sea obviamente un prototipo (p. ej. incluir la palabra `prototype` en la ruta o el nombre del archivo). Mismo patrón `?variant=`.

Antes de comprometerse con la sub-forma B, hacer un sanity check: ¿de verdad no hay ninguna página existente donde incrustarlo? Una ruta vacía esconde problemas de diseño que una poblada expondría.

En ambas sub-formas la barra inferior flotante es idéntica.

## Proceso

### 1. Enunciar la pregunta y elegir N

Por defecto, **3 variantes**. Más de 5 deja de ser radicalmente distinto y empieza a ser ruido — poner el tope ahí.

Dejar el plan por escrito en una línea, en la ubicación del prototipo o en un comentario al principio del archivo:

> "Tres variantes de la página de ajustes, conmutables vía `?variant=`, en la ruta existente `/settings`."

Esto funciona tanto si el usuario está presente para objetar como si no.

### 2. Generar variantes radicalmente distintas

Redactar cada variante. Exigir a cada una:

- El propósito de la página y los datos a los que tiene acceso.
- La librería de componentes / sistema de estilos del proyecto (TailwindCSS, shadcn, MUI, CSS plano, lo que sea).
- Un nombre de componente exportado claro, p. ej. `VariantA`, `VariantB`, `VariantC`.

Las variantes deben ser **estructuralmente distintas** — distinto layout, distinta jerarquía de información, distinta affordance principal, no solo colores distintos. Tres grids de cards ligeramente retocados no son un prototipo de UI, son papel pintado. Si dos borradores salen demasiado parecidos, rehacer uno con la instrucción explícita de "no usar un grid de cards".

### 3. Cablearlas juntas

Crear un único componente conmutador en la ruta:

```tsx
// pseudocódigo — adaptar al framework del proyecto
const variant = searchParams.get("variant") ?? "A";
return (
  <>
    {variant === "A" && <VariantA {...data} />}
    {variant === "B" && <VariantB {...data} />}
    {variant === "C" && <VariantC {...data} />}
    <PrototypeSwitcher variants={["A", "B", "C"]} current={variant} />
  </>
);
```

Para la sub-forma A (página existente): mantener todo el data fetching existente por encima del conmutador; solo el subárbol renderizado cambia por variante.

Para la sub-forma B (página nueva): la ruta descartable bajo `/prototype/<nombre>` monta el mismo conmutador.

### 4. Construir el conmutador flotante

Una pequeña barra de posición fija en el centro inferior de la pantalla con tres piezas:

- **Flecha izquierda** — cicla a la variante anterior (da la vuelta).
- **Etiqueta de variante** — muestra la clave de la variante actual y, si la variante exporta un nombre, también ese nombre. P. ej. `B — Layout con sidebar`.
- **Flecha derecha** — cicla hacia adelante (da la vuelta).

Comportamiento:

- Hacer clic en una flecha actualiza el search param de la URL (usar el router del framework — `router.replace` en Next, `navigate` en React Router, etc.) para que la variante sea compartible y estable al recargar.
- Teclado: las flechas `←` y `→` también ciclan. No interceptar las flechas cuando un `<input>`, `<textarea>` o `[contenteditable]` tenga el foco.
- Visualmente distinta de la página (p. ej. píldora de alto contraste, sombra sutil) para que sea obvio que no forma parte del diseño que se está evaluando.
- Oculta en builds de producción — condicionar a `process.env.NODE_ENV !== 'production'` o una comprobación equivalente, para que un merge accidental del prototipo no pueda enviar la barra a los usuarios.

Poner el conmutador en un único componente compartido para que ambas sub-formas puedan reutilizarlo. Ubicarlo donde viva la UI compartida del proyecto.

### 5. Entregarlo

Comunicar la URL (y las claves de `?variant=`). El usuario irá alternando cuando le llegue el momento. El feedback interesante suele ser **"quiero el header de B con el sidebar de C"** — ese es el diseño que realmente quiere.

### 6. Capturar la respuesta y limpiar

Cuando una variante haya ganado, capturar la respuesta — qué variante y por qué — y luego capturar el prototipo como describe el [SKILL](../SKILL.md). Incorporar la ganadora al código real y mover el resto a la branch descartable, no a main:

- **Sub-forma A** — incorporar la ganadora a la página existente; quitar de main las variantes perdedoras y el conmutador.
- **Sub-forma B** — promover la variante ganadora a una ruta real; quitar de main la ruta descartable y el conmutador.

El conjunto completo de variantes es la fuente primaria, así que aterriza en la branch descartable, no en la papelera — los componentes de variantes y el conmutador dejados en main se pudren rápido y confunden al siguiente lector.

## Anti-patrones

- **Variantes que solo difieren en color o texto.** Eso es un retoque, no un prototipo. Las variantes reales discrepan sobre la estructura.
- **Compartir demasiado código entre variantes.** Un `<Header>` compartido está bien; un `<Layout>` compartido derrota el propósito. Cada variante debe ser libre de tirar el layout.
- **Cablear variantes a mutaciones reales.** Los prototipos de solo lectura están bien. Si una variante necesita mutar, apuntarla a un stub — la pregunta es "cómo debería verse esto", no "funciona el backend".
- **Promover el prototipo directamente a producción.** El código de las variantes se escribió bajo restricciones de prototipo (sin tests, manejo de errores mínimo). Reescribirlo como es debido al incorporarlo.
