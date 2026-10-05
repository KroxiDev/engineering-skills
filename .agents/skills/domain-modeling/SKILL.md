---
name: domain-modeling
description: Construye y afila el modelo de dominio de un proyecto. Usar cuando el usuario quiera fijar la terminología del dominio o un lenguaje ubicuo, registrar una decisión arquitectónica, o cuando otro skill necesite mantener el modelo de dominio.
---

# Modelado de dominio

Construir y afilar activamente el modelo de dominio del proyecto mientras diseñas. Esta es la disciplina _activa_ — desafiar términos, inventar escenarios límite y escribir el glosario y las decisiones en el momento en que cristalizan. (Meramente _leer_ `CONTEXT.md` para tomar vocabulario no es este skill — eso es un hábito de una línea que cualquier skill puede hacer. Este skill es para cuando estás cambiando el modelo, no solo consumiéndolo.)

## Estructura de archivos

La mayoría de los repos tienen un solo contexto:

```
/
├── CONTEXT.md
├── docs/
│   └── adr/
│       ├── 0001-event-sourced-orders.md
│       └── 0002-postgres-for-write-model.md
└── src/
```

Si existe un `CONTEXT-MAP.md` en la raíz, el repo tiene múltiples contextos. El mapa apunta a dónde vive cada uno:

```
/
├── CONTEXT-MAP.md
├── docs/
│   └── adr/                          ← decisiones de todo el sistema
├── src/
│   ├── ordering/
│   │   ├── CONTEXT.md
│   │   └── docs/adr/                 ← decisiones específicas del contexto
│   └── billing/
│       ├── CONTEXT.md
│       └── docs/adr/
```

Crear los archivos de forma diferida — solo cuando haya algo que escribir. Si no existe `CONTEXT.md`, crearlo cuando se resuelva el primer término. Si no existe `docs/adr/`, crearlo cuando se necesite el primer ADR.

## Durante la sesión

### Desafiar contra el glosario

Cuando el usuario use un término que entra en conflicto con el lenguaje existente en `CONTEXT.md`, señalarlo de inmediato. "Tu glosario define 'cancelación' como X, pero parece que te refieres a Y — ¿cuál es?"

### Afilar el lenguaje difuso

Cuando el usuario use términos vagos o sobrecargados, proponer un término canónico preciso. "Dices 'cuenta' — ¿te refieres al Customer o al User? Son cosas distintas."

### Discutir escenarios concretos

Cuando se estén discutiendo relaciones del dominio, someterlas a estrés con escenarios específicos. Inventar escenarios que sondeen casos límite y obliguen al usuario a ser preciso sobre las fronteras entre conceptos.

### Contrastar con el código

Cuando el usuario afirme cómo funciona algo, comprobar si el código está de acuerdo. Si encuentras una contradicción, sácala a la superficie: "Tu código cancela Orders completas, pero acabas de decir que la cancelación parcial es posible — ¿cuál es la correcta?"

### Actualizar CONTEXT.md sobre la marcha

Cuando un término se resuelva, actualizar `CONTEXT.md` ahí mismo. No acumularlos en lotes — capturarlos según ocurren. Usar el formato de [formato-contexto.md](references/formato-contexto.md).

`CONTEXT.md` debe estar totalmente libre de detalles de implementación. No tratar `CONTEXT.md` como una spec, un borrador o un repositorio de decisiones de implementación. Es un glosario y nada más.

### Ofrecer ADRs con moderación

Ofrecer crear un ADR solo cuando las tres condiciones sean ciertas:

1. **Difícil de revertir** — el coste de cambiar de opinión más adelante es significativo
2. **Sorprendente sin contexto** — un lector futuro se preguntará "¿por qué lo hicieron así?"
3. **Resultado de un trade-off real** — había alternativas genuinas y se eligió una por razones específicas

Si falta cualquiera de las tres, omitir el ADR. Usar el formato de [formato-adr.md](references/formato-adr.md).
