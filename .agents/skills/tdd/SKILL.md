---
name: tdd
description: Desarrollo guiado por tests. Usar cuando el usuario quiera construir features o corregir bugs test-first, mencione "red-green-refactor", o quiera integration tests.
---

# Desarrollo guiado por tests

TDD es el bucle red → green. Este skill es la referencia que hace que ese bucle produzca tests que valga la pena conservar: qué es un buen test, dónde van los tests, los anti-patrones y las reglas del bucle. Cada sección aplica en cada ciclo — consultarlas antes y durante el bucle, no después.

Al explorar el codebase, leer `CONTEXT.md` (si existe) para que los nombres de los tests y el vocabulario de las interfaces coincidan con el lenguaje de dominio del proyecto, y respetar los ADRs del área que se está tocando.

## Qué es un buen test

Los tests verifican comportamiento a través de interfaces públicas, no detalles de implementación. El código puede cambiar por completo; los tests no deberían. Un buen test se lee como una especificación — "el usuario puede hacer checkout con un carrito válido" te dice exactamente qué capacidad existe — y sobrevive refactors porque no le importa la estructura interna.

Ver [tests.md](references/tests.md) para ejemplos y [mocking.md](references/mocking.md) para las pautas de mocking.

## Seams — dónde van los tests

Un **seam** es el límite público en el que testeas: la interface donde observas comportamiento sin meter la mano dentro. Los tests viven en seams, nunca contra internos.

**Testear solo en seams acordados de antemano.** Antes de escribir cualquier test, dejar por escrito los seams bajo test y confirmarlos con el usuario. No se escribe ningún test en un seam no confirmado. No puedes testearlo todo — acordar los seams por adelantado es cómo el esfuerzo de testing aterriza en las rutas críticas y la lógica compleja en vez de en cada caso límite.

Preguntar: "¿Cuál es la interface pública, y qué seams deberíamos testear?"

Cuando la forma de esa interface esté en discusión — cuán profundo es el módulo, dónde va el seam, qué debería exponer la interface — usar el skill `codebase-design` para el vocabulario. Es la fuente compartida de los términos módulo, interface, profundidad, seam, adapter, leverage y localidad, y es una referencia a consultar, no una sesión a ejecutar.

## Anti-patrones

- **Acoplado a la implementación** — mockea colaboradores internos, testea métodos privados, o verifica por un canal lateral (consultar la base de datos en vez de usar la interface). La señal: el test se rompe al refactorizar aunque el comportamiento no haya cambiado.
- **Tautológico** — la aserción recalcula el valor esperado igual que lo hace el código (`expect(add(a, b)).toBe(a + b)`, un snapshot derivado a mano de la misma manera, una constante asertada igual a sí misma), así que pasa por construcción y nunca puede discrepar del código. Los valores esperados deben venir de una fuente de verdad independiente — un literal conocido-bueno, un ejemplo trabajado, la spec.
- **Slicing horizontal** — escribir todos los tests primero y luego toda la implementación. Los tests en bloque verifican comportamiento _imaginado_: testeas la _forma_ de las cosas en vez del comportamiento de cara al usuario, los tests se vuelven insensibles a los cambios reales, y te comprometes con una estructura de tests antes de entender la implementación. Trabajar en **slices verticales** en su lugar — un test → una implementación → repetir, cada test una **bala trazadora** que responde a lo que enseñó el ciclo anterior.

## Reglas del bucle

- **Red antes que green.** Escribir primero el test que falla, luego solo el código suficiente para pasarlo. No anticipar tests futuros ni añadir features especulativas.
- **Un slice por vez.** Un seam, un test, una implementación mínima por ciclo.
- **El refactoring no es parte del bucle.** Pertenece a la etapa de revisión (ver el skill `code-review`), no al ciclo de implementación red → green.
