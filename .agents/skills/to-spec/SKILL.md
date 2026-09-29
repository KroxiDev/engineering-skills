---
name: to-spec
description: Convierte la conversación actual en una spec y la publica en el issue tracker del proyecto — sin entrevista, solo síntesis de lo ya discutido.
---

Este skill toma el contexto de la conversación actual y el entendimiento del codebase y produce una spec (puede que conozcas este documento como PRD). NO entrevistar al usuario — solo sintetizar lo que ya sabes.

El issue tracker y el vocabulario de etiquetas de triage deberían estar ya configurados (p. ej. en `docs/agents/issue-tracker.md`) — si no, preguntar al usuario qué tracker usa.

## Proceso

1. Explorar el repo para entender el estado actual del codebase, si no se ha hecho ya. Usar el vocabulario del glosario de dominio del proyecto a lo largo de toda la spec, y respetar cualquier ADR del área que se está tocando.

2. Esbozar los seams en los que se va a testear la feature. Preferir los seams existentes a los nuevos. Usar el seam más alto posible. Si se necesitan seams nuevos, proponerlos en el punto más alto que se pueda. Cuantos menos seams en el codebase, mejor — el número ideal es uno.

Comprobar con el usuario que estos seams coinciden con sus expectativas.

3. Escribir la spec usando la plantilla de abajo y publicarla en el issue tracker del proyecto. Aplicar primero la etiqueta `spec` y luego la etiqueta de triage `ready-for-agent` — no hace falta triage adicional.

<spec-template>

## Enunciado del problema

El problema que enfrenta el usuario, desde la perspectiva del usuario.

## Solución

La solución al problema, desde la perspectiva del usuario.

## Historias de usuario

Una lista LARGA y numerada de historias de usuario. Cada historia de usuario debe tener el formato:

1. Como <actor>, quiero <feature>, para <beneficio>

<user-story-example>
1. Como cliente de banca móvil, quiero ver el saldo de mis cuentas, para tomar decisiones mejor informadas sobre mis gastos
</user-story-example>

Esta lista de historias de usuario debe ser extremadamente extensa y cubrir todos los aspectos de la feature.

## Decisiones de implementación

Una lista de las decisiones de implementación tomadas. Puede incluir:

- Los módulos que se construirán/modificarán
- Las interfaces de esos módulos que se modificarán
- Aclaraciones técnicas del desarrollador
- Decisiones arquitectónicas
- Cambios de schema
- Contratos de API
- Interacciones específicas

NO incluir rutas de archivos específicas ni snippets de código. Pueden quedar desactualizados muy rápido.

Excepción: si un prototipo produjo un snippet que codifica una decisión con más precisión que la prosa (máquina de estados, reducer, schema, forma de un tipo), inlinearlo dentro de la decisión relevante y anotar brevemente que vino de un prototipo. Recortar a las partes ricas en decisión — no una demo funcional, solo lo importante.

## Decisiones de testing

Una lista de las decisiones de testing tomadas. Incluir:

- Una descripción de qué hace bueno a un test (testear solo comportamiento externo, no detalles de implementación)
- Qué módulos se testearán
- Prior art para los tests (es decir, tests de tipo similar en el codebase)

## Fuera de alcance

Una descripción de las cosas que quedan fuera del alcance de esta spec.

## Notas adicionales

Cualquier nota adicional sobre la feature.

</spec-template>
