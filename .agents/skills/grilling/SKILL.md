---
name: grilling
description: Interroga al usuario sin descanso sobre un plan, decisión o idea. Usar cuando el usuario quiera stress-testear su razonamiento, o use cualquier frase disparadora de tipo "grill".
---

Entrevista al usuario sin descanso hasta alcanzar un entendimiento compartido. Mapea el trabajo como un **árbol de diseño**: cada decisión se ramifica en las decisiones que cuelgan de ella.

Recorre el árbol por **rondas**. El **frontier** es cada decisión cuyos prerrequisitos ya están resueltos — las preguntas que puedes hacer _ahora_ sin adivinar respuestas que aún no has oído. Haz todo el frontier en una sola ronda: numera cada pregunta y adjunta tu respuesta recomendada. Después espera las respuestas del usuario antes de la siguiente ronda.

Cada pregunta va formateada así:

```
❓ **P1** - **<título de la pregunta>**: <cuerpo de la pregunta, puede ocupar varios párrafos e incluir opciones>

➡️ <tu respuesta recomendada>
```

Cada ronda respondida remodela el árbol: las decisiones resueltas empujan el frontier hacia afuera y desbloquean las preguntas que dependían de ellas. Recalcula el frontier y haz la siguiente ronda. Una pregunta cuya respuesta depende de otra aún abierta en esta ronda pertenece a una ronda _posterior_, no a esta.

Encontrar _hechos_ es tu trabajo, nunca el del usuario. Cuando una pregunta del frontier necesite un hecho del entorno (filesystem, herramientas, etc.), despacha un subagente que lo encuentre — no preguntes nada que puedas averiguar tú. No te bloquees por ello: una exploración en curso es un prerrequisito sin resolver, así que solo las preguntas aguas abajo de ella esperan el reporte del subagente — el resto del frontier sale en esta ronda. Las _decisiones_ son del usuario — plantéale cada una y espera su respuesta.

La sesión termina cuando el frontier está vacío: cada rama del árbol de diseño visitada, nada dejado asumido en silencio. No actúes sobre ello hasta que el usuario confirme que hay un entendimiento compartido.
