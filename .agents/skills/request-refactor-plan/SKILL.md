---
name: request-refactor-plan
description: Crea un plan de refactor detallado en commits diminutos entrevistando al usuario, y lo publica como issue. Usar cuando el usuario quiera planificar un refactor, redactar un RFC de refactorización, o dividir un refactor en pasos pequeños y seguros.
---

# Planificar un refactor

Este skill se invoca cuando el usuario quiere crear una solicitud de refactor. Recorrer los pasos de abajo. Dar por resueltos los pasos cuya información ya esté disponible y verificada.

La configuración del issue tracker debería estar documentada en `docs/agents/issue-tracker.md` — si falta, preguntar al usuario qué issue tracker usa y cómo publicar en él.

## Pasos

1. Pedirle al usuario una descripción larga y detallada del problema que quiere resolver, y cualquier idea de solución que ya tenga.

2. Explorar el repo para verificar sus afirmaciones y entender el estado actual del codebase.

3. Preguntar si ha considerado otras opciones, y presentarle otras opciones.

4. Entrevistar al usuario sobre la implementación. Ser extremadamente detallado y minucioso.

5. Fijar el alcance exacto de la implementación. Determinar qué se planea cambiar y qué se planea no cambiar.

6. Mirar en el codebase para comprobar la cobertura de tests de esa área. Si la cobertura es insuficiente, preguntar al usuario cuáles son sus planes de testing.

7. Dividir la implementación en un plan de commits diminutos. Recuerda: "haz cada paso de refactorización lo más pequeño posible, para que siempre puedas ver el programa funcionando".

8. Crear un issue con el plan de refactor. Usar la siguiente plantilla para la descripción del issue:

<plantilla-plan-refactor>

## Planteamiento del problema

El problema al que se enfrenta el desarrollador, desde la perspectiva del desarrollador.

## Solución

La solución al problema, desde la perspectiva del desarrollador.

## Commits

Un plan de implementación LARGO y detallado. Escribir el plan en lenguaje llano, desglosando la implementación en los commits más diminutos posibles. Cada commit debe dejar el codebase en un estado funcionando.

## Documento de decisiones

Una lista de las decisiones de implementación que se tomaron. Puede incluir:

- Los módulos que se van a construir o modificar
- Las interfaces de esos módulos que se van a modificar
- Aclaraciones técnicas del desarrollador
- Decisiones arquitectónicas
- Cambios de esquema
- Contratos de API
- Interacciones específicas

NO incluir rutas de archivo concretas ni fragmentos de código. Pueden quedar obsoletos muy rápido.

## Decisiones de testing

Una lista de las decisiones de testing que se tomaron. Incluir:

- Una descripción de qué hace bueno a un test (probar solo comportamiento externo, no detalles de implementación)
- Qué módulos se van a testear
- Precedentes para los tests (es decir, tests de tipo similar que ya existan en el codebase)

## Fuera de alcance

Una descripción de las cosas que quedan fuera del alcance de este refactor.

## Notas adicionales (opcional)

Cualquier nota adicional sobre el refactor.

</plantilla-plan-refactor>
