---
name: gpt-review
description: Revisión independiente de código con GPT-6 Astra Max e informe íntegro en español. Solo por invocación explícita del usuario.
license: MIT
---

# Revisión con GPT

Ejecuta este skill solo cuando el usuario lo invoque por su nombre. Cada invocación encarga una revisión; no activa revisiones automáticas posteriores. El resultado es un informe, sin aplicar correcciones ni integrar cambios.

1. **Delimita el alcance.** Usa los archivos, cambios, rama o PR indicados. Si no se especifican, revisa el trabajo actual de la conversación, incluidos los cambios sin commit y archivos nuevos pertinentes. Expón el alcance y la base de comparación; pregunta solo si no puedes determinarlos.

2. **Lanza un único revisor con GPT-6 Astra Max.** Usa un mecanismo de subagentes que permita seleccionar ese modelo y esfuerzo. En Codex, con `collaboration.spawn_agent`, configura `model: "gpt-6-astra"`, `reasoning_effort: "max"` y `fork_turns: "none"`. Si el usuario indica otra herramienta, úsala conservando modelo y esfuerzo. Si no están disponibles, informa el bloqueo y detén la revisión; no sustituyas el modelo silenciosamente.

   Dale acceso al mismo directorio de trabajo y estado de los archivos. Incluye en el encargo el alcance, la base de comparación, los requisitos, las instrucciones del repositorio y las comprobaciones ya realizadas. Presenta ese contexto de forma neutral, sin anticipar hallazgos ni orientar hacia una solución.

3. **Encarga una revisión profunda y de solo lectura.** Pide al subagente que evalúe el trabajo con criterio de desarrollador sénior, examine el código relacionado y las pruebas, y busque por su cuenta fallos de corrección, regresiones, riesgos de seguridad y discrepancias con los requisitos. Debe conservar los archivos y el estado de Git.

   Su informe debe ser conciso, en español neutro, y contener:

   - Hallazgos ordenados por gravedad, priorizando los críticos y graves. Para cada uno: ubicación con archivo y línea, evidencia o condición que lo provoca, impacto y corrección recomendada.
   - Comprobaciones realizadas y límites de la revisión, distinguiendo hechos verificados de hipótesis.
   - Un veredicto sobre si los cambios pueden integrarse, si hay bloqueantes o si falta evidencia. Si no encuentra problemas relevantes, debe indicarlo sin inventar hallazgos ni garantizar seguridad absoluta.

4. **Entrega el resultado íntegro.** Espera a que termine el subagente y muestra su respuesta final completa, literalmente, sin resumirla ni reescribirla. Si falla o queda incompleta, informa ese estado en lugar de presentar la revisión como terminada.
