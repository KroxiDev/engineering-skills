# Formato del informe HTML

La revisión arquitectónica se renderiza como un único archivo HTML autocontenido en el directorio temporal del SO. Tailwind y Mermaid vienen ambos de CDNs. Mermaid maneja con fiabilidad los diagramas con forma de grafo; los divs construidos a mano y el SVG inline manejan los visuales más editoriales (diagramas de masa, cortes transversales). Mezclar los dos — no apoyarse en Mermaid para todo, empezará a verse genérico.

## Esqueleto

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>Revisión de arquitectura — {{nombre del repo}}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script type="module">
      import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
      mermaid.initialize({
        startOnLoad: true,
        theme: "neutral",
        securityLevel: "loose",
      });
    </script>
    <style>
      /* pequeña capa custom para lo que Tailwind no cubre limpiamente:
         líneas de seam discontinuas, puntas de flecha con aire dibujado a mano, etc. */
      .seam {
        stroke-dasharray: 4 4;
      }
      .leak {
        stroke: #dc2626;
      }
      .deep {
        background: linear-gradient(135deg, #0f172a, #1e293b);
      }
    </style>
  </head>
  <body class="bg-stone-50 text-slate-900 font-sans">
    <main class="max-w-5xl mx-auto px-6 py-12 space-y-12">
      <header>...</header>
      <section id="candidates" class="space-y-10">...</section>
      <section id="top-recommendation">...</section>
    </main>
  </body>
</html>
```

## Encabezado

Nombre del repo, fecha y una leyenda compacta: caja sólida = módulo, línea discontinua = seam, flecha roja = fuga, caja gruesa oscura = módulo profundo. Sin párrafo de introducción — directo a los candidatos.

## Card de candidato

Los diagramas cargan con el peso. La prosa es escasa, llana, y usa los términos del glosario (del skill `codebase-design`) sin ceremonia.

Cada candidato es un `<article>`:

- **Título** — corto, nombra la profundización (p. ej. "Colapsar el pipeline de entrada de Orders").
- **Fila de badges** — fuerza de la recomendación (`Fuerte` = esmeralda, `Vale la pena explorar` = ámbar, `Especulativa` = pizarra), más una etiqueta de la categoría de dependencia (`in-process`, `sustituible en local`, `ports & adapters`, `mock`).
- **Archivos** — lista monoespaciada, `font-mono text-sm`.
- **Diagrama antes/después** — la pieza central. Dos columnas, lado a lado. Ver patrones abajo.
- **Problema** — una frase. Qué duele.
- **Solución** — una frase. Qué cambia.
- **Ganancias** — bullets, ≤6 palabras cada uno. P. ej. "Los tests atacan una interface", "La lógica de pricing deja de filtrarse", "Borrar 4 wrappers superficiales".
- **Aviso de ADR** (si aplica) — una línea en una caja teñida de ámbar.

Sin párrafos de explicación. Si el diagrama necesita un párrafo para entenderse, redibujar el diagrama.

## Patrones de diagramas

Elegir el patrón que le quede al candidato. Mezclarlos. No hacer que todos los diagramas se vean iguales — la variedad es parte del punto.

### Grafo de Mermaid (el caballo de batalla para dependencias / flujo de llamadas)

Usar un `flowchart` o `graph` de Mermaid cuando el punto sea "X llama a Y llama a Z, y mira qué desastre". Envolverlo en una card estilada con Tailwind para que no se sienta paracaidista. Estilarlo con classDef para colorear en rojo las aristas con fuga y en oscuro el módulo profundo. Los diagramas de secuencia funcionan bien para "antes: 6 round-trips; después: 1".

```html
<div class="rounded-lg border border-slate-200 bg-white p-4">
  <pre class="mermaid">
    flowchart LR
      A[OrderHandler] --> B[OrderValidator]
      B --> C[OrderRepo]
      C -.leak.-> D[PricingClient]
      classDef leak stroke:#dc2626,stroke-width:2px;
      class C,D leak
  </pre>
</div>
```

### Cajas y flechas construidas a mano (cuando el layout de Mermaid pelea contigo)

Módulos como `<div>`s con bordes y etiquetas. Flechas como elementos SVG inline `<line>` o `<path>` posicionados de forma absoluta sobre un contenedor relativo. Recurrir a esto cuando quieras que el diagrama de "después" se sienta como un solo módulo profundo de borde grueso con los internos atenuados — Mermaid no renderiza eso con el peso adecuado.

### Corte transversal (bueno para superficialidad por capas)

Apilar bandas horizontales (`h-12 border-l-4`) para mostrar las capas que atraviesa una llamada. Antes: 6 capas delgadas que no hacen nada. Después: 1 banda gruesa etiquetada con la responsabilidad consolidada.

### Diagrama de masa (bueno para "interface tan ancha como la implementación")

Dos rectángulos por módulo — uno para la superficie de la interface, otro para la implementación. Antes: el rectángulo de la interface es casi tan alto como el de la implementación (superficial). Después: el rectángulo de la interface es bajo, el de la implementación es alto (profundo).

### Colapso de call graph

Antes: un árbol de llamadas a funciones renderizado como cajas anidadas. Después: el mismo árbol colapsado en una sola caja, con las llamadas ahora internas mostradas atenuadas dentro de ella.

## Guía de estilo

- Tender a editorial, no a dashboard corporativo. Espacio en blanco generoso. Serif opcional para encabezados (`font-serif` funciona bien con stone/slate).
- Color con moderación: un acento (esmeralda o índigo) más rojo para fugas y ámbar para avisos.
- Mantener los diagramas en ~320px de alto para que el antes/después quepa cómodamente lado a lado sin scroll.
- Usar `text-xs uppercase tracking-wider` para las etiquetas de módulos dentro de los diagramas — deben leerse como esquema, no como UI.
- Los únicos scripts son el CDN de Tailwind y el import ESM de Mermaid. Por lo demás el informe es estático — sin código de aplicación, sin interactividad más allá del propio renderizado de Mermaid.

## Sección de recomendación principal

Una card más grande. Nombre del candidato, una frase sobre el porqué, enlace ancla a su card. Eso es todo.

## Tono

Lenguaje llano, conciso — pero los sustantivos y verbos arquitectónicos vienen directos del skill `codebase-design`. La concisión no es excusa para derivar.

**Usar exactamente:** módulo, interface, implementación, profundidad, profundo, superficial, seam, adapter, leverage, localidad.

**Nunca sustituir:** componente, servicio, unidad (por módulo) · API, firma (por interface) · boundary (por seam) · capa, wrapper (por módulo, cuando se quiere decir módulo).

**Formulaciones que encajan con el estilo:**

- "El módulo de entrada de Orders es superficial — la interface casi calca la implementación."
- "El pricing se filtra a través del seam."
- "Profundizar: una interface, un solo lugar donde testear."
- "Dos adapters justifican el seam: HTTP en producción, en memoria en tests."

**Los bullets de ganancias** nombran la ganancia en términos del glosario: _"localidad: los bugs se concentran en un módulo"_, _"leverage: una interface, N call sites"_, _"la interface encoge; la implementación absorbe los wrappers"_. No escribir _"más fácil de mantener"_ ni _"código más limpio"_ — esos términos no están en el glosario y no se ganan su lugar.

Sin coberturas, sin carraspeos, sin "cabe señalar que…". Si una frase puede ser un bullet, hacerla bullet. Si un bullet puede recortarse, recortarlo. Si un término no está en el glosario de `codebase-design`, buscar uno que sí esté antes de inventar uno nuevo.
