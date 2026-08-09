---
name: prototype
description: Construye un prototipo descartable para responder una pregunta de diseño. Usar cuando el usuario quiera comprobar si un modelo de estado o una lógica se sienten correctos, o explorar cómo debería verse una UI.
---

# Prototipo

Un prototipo es **código descartable que responde una pregunta**. La pregunta decide la forma.

## Elegir una rama

Identificar qué pregunta se está respondiendo — a partir del prompt del usuario, del código circundante, o preguntando si el usuario está presente:

- **"¿Esta lógica / modelo de estado se siente correcto?"** → [logica.md](references/logica.md). Construir un único archivo HTML compartible — botones de juego libre más recorridos guiados en pestañas — que empuje la máquina de estados por casos difíciles de razonar sobre el papel, y que alguien no técnico pueda manejar.
- **"¿Cómo debería verse esto?"** → [ui.md](references/ui.md). Generar varias variantes de UI radicalmente distintas en una sola ruta, conmutables vía un search param de URL y una barra inferior flotante.

Las dos ramas producen artefactos muy distintos — equivocarse aquí desperdicia el prototipo entero. Si la pregunta es genuinamente ambigua y el usuario no está localizable, elegir por defecto la rama que mejor encaje con el código circundante (un módulo de backend → lógica; una página o componente → UI) y declarar la suposición al principio del prototipo.

## Reglas que aplican a ambas

1. **Descartable desde el día uno, y claramente marcado como tal.** Ubicar el código del prototipo cerca de donde se usará realmente (junto al módulo o página para el que se prototipa) para que el contexto sea obvio — pero nombrarlo de forma que un lector casual vea que es un prototipo, no producción. Para rutas de UI descartables, obedecer la convención de routing que el proyecto ya use; no inventar una estructura de primer nivel nueva.
2. **Trivial de ejecutar.** Un prototipo de UI arranca con un comando del task runner del proyecto — `pnpm <nombre>`, `python <ruta>`, `bun <ruta>`, etc. Una demo de lógica es un único archivo HTML que el usuario abre con doble clic. En cualquier caso, arrancarlo no exige pensar.
3. **Sin persistencia por defecto.** El estado vive en memoria. La persistencia es lo que el prototipo está _comprobando_, no algo de lo que deba depender. Si la pregunta involucra explícitamente una base de datos, atacar una DB de borrador o un archivo local con un nombre claro tipo "PROTOTYPE — bórrame".
4. **Saltarse el pulido.** Sin tests, sin manejo de errores más allá de lo que hace al prototipo _ejecutable_, sin abstracciones. El punto es aprender algo rápido.
5. **Exponer el estado.** Tras cada acción (lógica) o en cada cambio de variante (UI), imprimir o renderizar el estado relevante completo para que el usuario vea qué cambió.
6. **Capturarlo al terminar.** Incorporar cualquier decisión validada al código real, y luego capturar el prototipo mismo como **fuente primaria**: commitearlo a una branch descartable, fuera de main, y dejar un puntero de contexto a esa branch en el issue de implementación. Capturar también la respuesta — el veredicto y la pregunta que zanjó — en el issue o en un commit. La branch main conserva solo la decisión validada.
