---
name: codebase-design
description: Vocabulario compartido para diseñar módulos profundos. Usar cuando el usuario quiera diseñar o mejorar la interface de un módulo, encontrar oportunidades de profundización, decidir dónde va un seam, hacer el código más testeable o navegable por IA, o cuando otro skill necesite el vocabulario de módulos profundos.
---

# Diseño de codebase

Diseñar **módulos profundos**: mucho comportamiento detrás de una interface pequeña, colocada en un seam limpio, testeable a través de esa interface. Usar este lenguaje y estos principios dondequiera que se esté diseñando o reestructurando código. El objetivo es leverage para los callers, localidad para los mantenedores y testeabilidad para todos.

## Glosario

Usar estos términos exactamente — no sustituirlos por "componente", "servicio", "API" o "boundary". El lenguaje consistente es todo el punto.

**Módulo** — cualquier cosa con una interface y una implementación. Deliberadamente agnóstico de escala: una función, clase, package o slice que atraviesa capas. _Evitar_: unidad, componente, servicio.

**Interface** — todo lo que un caller debe saber para usar el módulo correctamente: la firma de tipos, pero también invariantes, restricciones de orden, modos de error, configuración requerida y características de rendimiento. _Evitar_: API, firma (demasiado estrechos — se refieren solo a la superficie a nivel de tipos).

**Implementación** — lo que hay dentro de un módulo, su cuerpo de código. Distinta de **Adapter**: algo puede ser un adapter pequeño con una implementación grande (un repo de Postgres) o un adapter grande con una implementación pequeña (un fake en memoria). Usar "adapter" cuando el tema es el seam; "implementación" en los demás casos.

**Profundidad** — leverage en la interface: la cantidad de comportamiento que un caller (o test) puede ejercitar por unidad de interface que tiene que aprender. Un módulo es **profundo** cuando una gran cantidad de comportamiento se asienta tras una interface pequeña, **superficial** cuando la interface es casi tan compleja como la implementación.

**Seam** _(Michael Feathers)_ — un lugar donde puedes alterar el comportamiento sin editar en ese lugar; la _ubicación_ donde vive la interface de un módulo. Dónde poner el seam es una decisión de diseño propia, distinta de qué va detrás de él. _Evitar_: boundary (sobrecargado con el bounded context de DDD).

**Adapter** — una cosa concreta que satisface una interface en un seam. Describe _rol_ (qué hueco llena), no sustancia (qué hay dentro).

**Leverage** — lo que los callers obtienen de la profundidad: más capacidad por unidad de interface que aprenden. Una implementación se amortiza en N call sites y M tests.

**Localidad** — lo que los mantenedores obtienen de la profundidad: el cambio, los bugs, el conocimiento y la verificación se concentran en un solo lugar en vez de dispersarse entre los callers. Se arregla una vez, queda arreglado en todas partes.

## Profundo vs superficial

**Módulo profundo** = interface pequeña + mucha implementación:

```
┌─────────────────────┐
│  Interface pequeña  │  ← Pocos métodos, parámetros simples
├─────────────────────┤
│                     │
│    Implementación   │  ← Lógica compleja oculta
│      profunda       │
└─────────────────────┘
```

**Módulo superficial** = interface grande + poca implementación (evitar):

```
┌─────────────────────────────────┐
│        Interface grande         │  ← Muchos métodos, parámetros complejos
├─────────────────────────────────┤
│  Implementación delgada         │  ← Solo pasa las llamadas
└─────────────────────────────────┘
```

Al diseñar una interface, preguntarse:

- ¿Puedo reducir el número de métodos?
- ¿Puedo simplificar los parámetros?
- ¿Puedo ocultar más complejidad dentro?

## Principios

- **La profundidad es una propiedad de la interface, no de la implementación.** Un módulo profundo puede estar compuesto internamente de partes pequeñas, mockeables e intercambiables — simplemente no forman parte de la interface. Un módulo puede tener **seams internos** (privados de su implementación, usados por sus propios tests) además del **seam externo** en su interface.
- **El test de la eliminación.** Imagina eliminar el módulo. Si la complejidad desaparece, era un pass-through. Si la complejidad reaparece repartida entre N callers, se estaba ganando su lugar.
- **La interface es la superficie de test.** Los callers y los tests cruzan el mismo seam. Si quieres testear _más allá_ de la interface, el módulo probablemente tiene la forma equivocada.
- **Un adapter significa un seam hipotético. Dos adapters significan uno real.** No introducir un seam a menos que algo realmente varíe a través de él.

## Diseñar para la testeabilidad

Las buenas interfaces hacen que testear sea natural:

1. **Aceptar dependencias, no crearlas.**

   ```typescript
   // Testeable
   function processOrder(order, paymentGateway) {}

   // Difícil de testear
   function processOrder(order) {
     const gateway = new StripeGateway();
   }
   ```

2. **Devolver resultados, no producir efectos secundarios.**

   ```typescript
   // Testeable
   function calculateDiscount(cart): Discount {}

   // Difícil de testear
   function applyDiscount(cart): void {
     cart.total -= discount;
   }
   ```

3. **Superficie pequeña.** Menos métodos = menos tests necesarios. Menos parámetros = setup de test más simple.

## Relaciones

- Un **Módulo** tiene exactamente una **Interface** (la superficie que presenta a callers y tests).
- La **Profundidad** es una propiedad de un **Módulo**, medida contra su **Interface**.
- Un **Seam** es donde vive la **Interface** de un **Módulo**.
- Un **Adapter** se sitúa en un **Seam** y satisface la **Interface**.
- La **Profundidad** produce **Leverage** para los callers y **Localidad** para los mantenedores.

## Encuadres rechazados

- **Profundidad como ratio de líneas de implementación sobre líneas de interface** (Ousterhout): premia inflar la implementación. Usamos profundidad-como-leverage en su lugar.
- **"Interface" como la keyword `interface` de TypeScript o los métodos públicos de una clase**: demasiado estrecho — interface aquí incluye cada hecho que un caller debe saber.
- **"Boundary"**: sobrecargado con el bounded context de DDD. Decir **seam** o **interface**.

## Para profundizar

- **Profundizar un cluster dadas sus dependencias** — ver [profundizacion.md](references/profundizacion.md): categorías de dependencias, disciplina de seams y testing de reemplazar-no-envolver.
- **Explorar interfaces alternativas** — ver [disenar-dos-veces.md](references/disenar-dos-veces.md): lanzar subagentes paralelos para diseñar la interface de varias maneras radicalmente distintas y compararlas por profundidad, localidad y ubicación del seam.
