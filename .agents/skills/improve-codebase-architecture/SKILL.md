---
name: improve-codebase-architecture
description: Escanea un codebase en busca de oportunidades de profundización, las presenta como un informe HTML visual y luego somete a entrevista la que elijas.
---

# Mejorar la arquitectura del codebase

Sacar a la superficie la fricción arquitectónica y proponer **oportunidades de profundización** — refactors que convierten módulos superficiales en profundos. El objetivo es testeabilidad y navegabilidad por IA.

Este comando está _informado_ por el modelo de dominio del proyecto y construido sobre un vocabulario de diseño compartido:

- Ejecutar el skill `codebase-design` para el vocabulario de arquitectura (**módulo**, **interface**, **profundidad**, **seam**, **adapter**, **leverage**, **localidad**) y sus principios (el test de la eliminación, "la interface es la superficie de test", "un adapter = seam hipotético, dos = real"). Usar estos términos exactamente en cada sugerencia — no derivar hacia "componente", "servicio", "API" o "boundary".
- El lenguaje de dominio de `CONTEXT.md` da nombre a los buenos seams; los ADRs en `docs/adr/` registran decisiones que este comando no debe re-litigar.

## Proceso

### 1. Explorar

**Delimitar antes de escanear — YAGNI.** Profundizar un módulo compensa porque facilita sus cambios futuros, así que dar peso extra a las partes del codebase que han cambiado recientemente. Decidir _dónde_ mirar antes de mirar:

- Si el usuario nombró una dirección — un módulo, un subsistema, un punto de dolor — tomarla, y saltarse la inferencia de abajo.
- Si no, recorrer un buen tramo del historial de commits (`git log --oneline`) para encontrar los hot spots del codebase — los archivos y áreas que salen una y otra vez — y dejar que esas rutas atraigan la atención primero. Si los cambios están dispersos sin hot spot claro, ampliar la red.

Leer primero el glosario de dominio del proyecto (`CONTEXT.md`) y cualquier ADR del área que se va a tocar.

Después lanzar un subagente para recorrer el codebase. No seguir heurísticas rígidas — explorar orgánicamente y anotar dónde se experimenta fricción:

- ¿Dónde entender un concepto exige rebotar entre muchos módulos pequeños?
- ¿Dónde hay módulos **superficiales** — interface casi tan compleja como la implementación?
- ¿Dónde se extrajeron funciones puras solo por testeabilidad, pero los bugs reales se esconden en cómo se llaman (sin **localidad**)?
- ¿Dónde los módulos fuertemente acoplados se filtran a través de sus seams?
- ¿Qué partes del codebase están sin testear, o son difíciles de testear a través de su interface actual?

Aplicar el **test de la eliminación** a todo lo que se sospeche superficial: ¿eliminarlo concentraría la complejidad, o solo la movería? Un "sí, la concentra" es la señal buscada.

### 2. Presentar los candidatos como informe HTML

Escribir un archivo HTML autocontenido en el directorio temporal del SO para que nada aterrice en el repo. Resolver el directorio temporal desde `$TMPDIR`, con fallback a `/tmp` (o `%TEMP%` en Windows), y escribir en `<tmpdir>/architecture-review-<timestamp>.html` para que cada ejecución tenga un archivo fresco. Abrirlo para el usuario — `xdg-open <ruta>` en Linux, `open <ruta>` en macOS, `start <ruta>` en Windows — y decirle la ruta absoluta.

El informe usa **Tailwind vía CDN** para layout y estilos, y **Mermaid vía CDN** para diagramas donde un grafo/flujo/secuencia comunique la estructura con fiabilidad. Mezclar Mermaid con visuales CSS/SVG hechos a mano — usar Mermaid cuando las relaciones tienen forma de grafo (call graphs, dependencias, secuencias), y divs/SVG construidos a mano cuando se quiera algo más editorial (diagramas de masa, cortes transversales, animaciones de colapso). Cada candidato lleva una **visualización antes/después**. Ser visual.

Para cada candidato, renderizar una card con:

- **Archivos** — qué archivos/módulos están involucrados
- **Problema** — por qué la arquitectura actual causa fricción
- **Solución** — descripción en lenguaje llano de qué cambiaría
- **Beneficios** — explicados en términos de localidad y leverage, y cómo mejorarían los tests
- **Diagrama antes/después** — lado a lado, dibujado a medida, ilustrando la superficialidad y la profundización
- **Fuerza de la recomendación** — una de `Fuerte`, `Vale la pena explorar`, `Especulativa`, renderizada como badge

Cerrar el informe con una sección de **Recomendación principal**: qué candidato abordarías primero y por qué.

**Usar el vocabulario de CONTEXT.md para el dominio, y el vocabulario de `codebase-design` para la arquitectura.** Si `CONTEXT.md` define "Order", hablar del "módulo de entrada de Orders" — no del "FooBarHandler", y no del "servicio de Orders".

**Conflictos con ADRs**: si un candidato contradice un ADR existente, sacarlo a la superficie solo cuando la fricción sea lo bastante real para justificar revisitar el ADR. Marcarlo claramente en la card (p. ej. un aviso: _"contradice el ADR-0007 — pero vale la pena reabrirlo porque…"_). No listar cada refactor teórico que un ADR prohíbe.

Ver [informe-html.md](references/informe-html.md) para el esqueleto HTML completo, los patrones de diagramas y la guía de estilo.

NO proponer interfaces todavía. Tras escribir el archivo, preguntar al usuario: "¿Cuál de estas te gustaría explorar?"

### 3. Bucle de entrevista

Cuando el usuario elija un candidato, ejecutar el skill `grilling` para recorrer con él el árbol de decisiones — restricciones, dependencias, la forma del módulo profundizado, qué queda detrás del seam, qué tests sobreviven.

Los efectos secundarios ocurren en línea a medida que las decisiones cristalizan — ejecutar el skill `domain-modeling` para mantener el modelo de dominio al día sobre la marcha:

- **¿Nombrar un módulo profundizado con un concepto que no está en `CONTEXT.md`?** Añadir el término a `CONTEXT.md`. Crear el archivo de forma diferida si no existe.
- **¿Afilar un término difuso durante la conversación?** Actualizar `CONTEXT.md` ahí mismo.
- **¿El usuario rechaza el candidato con una razón de peso?** Ofrecer un ADR, planteado como: _"¿Quieres que registre esto como ADR para que futuras revisiones de arquitectura no lo vuelvan a sugerir?"_ Ofrecerlo solo cuando la razón le haría falta de verdad a un explorador futuro para no re-sugerir lo mismo — omitir razones efímeras ("ahora no vale la pena") y las autoevidentes.
- **¿Quiere explorar interfaces alternativas para el módulo profundizado?** Ejecutar el skill `codebase-design` y usar su patrón de subagentes paralelos de diseñar-dos-veces.
