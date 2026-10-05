---
name: batch-grill-me
description: Una entrevista sin descanso que hace todas las preguntas del frontier a la vez, ronda a ronda.
---

Ejecutar una sesión de `grilling`, pero por **rondas** en vez de pregunta a pregunta. Todo lo que fija `grilling` sigue vigente: los hechos se buscan y las decisiones se preguntan, cada pregunta lleva adjunta tu respuesta recomendada, y no se actúa hasta que el usuario confirme el entendimiento compartido. Lo único que cambia es el ritmo.

Mapear el trabajo como un **árbol de diseño**: cada decisión se ramifica en las decisiones que cuelgan de ella. El **frontier** es cada decisión cuyos prerrequisitos ya están resueltos — las preguntas que puedes hacer _ahora_ sin adivinar respuestas que aún no has oído.

## La ronda

Una ronda es todo el frontier de una vez. Numerar cada pregunta, adjuntarle su respuesta recomendada, y esperar al usuario antes de la siguiente.

**Una ronda está lista para enviarse cuando** cada decisión desbloqueada del frontier está numerada y lleva su respuesta recomendada. Una pregunta cuya respuesta depende de otra aún abierta en esta ronda pertenece a una ronda _posterior_, no a esta.

Cada ronda respondida remodela el árbol: las decisiones resueltas empujan el frontier hacia afuera y desbloquean las preguntas que dependían de ellas. Recalcular el frontier y enviar la siguiente ronda.

### Respuestas parciales

Cuando el usuario deja preguntas sin responder, volver a hacerlas en la ronda siguiente. La excepción es que lo que sí respondió cambie el contexto de la pregunta omitida: entonces reformularla contra ese contexto nuevo, o retirarla si ha quedado resuelta — y decir cuál de las dos cosas hiciste.

### Hechos por subagente

Cuando una pregunta del frontier necesite un hecho del entorno (filesystem, herramientas, etc.), despachar un subagente que lo encuentre. Una exploración en curso es un prerrequisito sin resolver: solo las preguntas aguas abajo de ella esperan su reporte — el resto del frontier sale en esta ronda.

## Fin de la sesión

La sesión termina cuando el frontier está vacío: cada rama del árbol de diseño visitada, nada dejado asumido en silencio.
