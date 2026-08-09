---
name: diagnosing-bugs
description: Bucle de diagnóstico para bugs difíciles y regresiones de rendimiento. Usar cuando el usuario diga "diagnostica"/"debuggea esto", o reporte algo roto, que lanza errores, que falla o que va lento.
---

# Diagnosticar bugs

Una disciplina para bugs difíciles. Saltarse fases solo cuando esté explícitamente justificado.

Al explorar el codebase, leer `CONTEXT.md` (si existe) para obtener un modelo mental claro de los módulos relevantes, y revisar los ADRs del área que se está tocando.

## Censurar secretos

Este skill te hace mostrar comandos, salidas y artefactos capturados. **Censura primero cada secreto** — escribe `<REDACTED>` en su lugar. Construye los bucles contra variables de entorno, para que la credencial viva en el entorno y no en lo que muestras. Los artefactos capturados llevan cabeceras de autenticación: cita solo las líneas que llevan la señal.

Si la salida censurada no alcanza para diagnosticar el bug, dilo y pregunta al usuario.

## Fase 1 — Construir un bucle de feedback

**Esto es el skill.** Todo lo demás es mecánico. Si tienes una señal pass/fail **ajustada** para el bug — una que se ponga red con _este_ bug — encontrarás la causa; la bisección, la prueba de hipótesis y la instrumentación no hacen más que consumirla. Si no la tienes, ninguna cantidad de mirar código te salvará.

Dedica aquí un esfuerzo desproporcionado. **Sé agresivo. Sé creativo. Niégate a rendirte.**

### Maneras de construir uno — probarlas aproximadamente en este orden

1. **Test que falla** en el seam que alcance el bug — unit, integration, e2e.
2. **Script de curl / HTTP** contra un dev server corriendo.
3. **Invocación de CLI** con un fixture de entrada, comparando stdout contra un snapshot conocido-bueno.
4. **Script de navegador headless** (Playwright / Puppeteer) — maneja la UI, hace aserciones sobre DOM/console/red.
5. **Reproducir una traza capturada.** Guardar en disco una petición de red real / payload / log de eventos; reproducirla a través del code path en aislamiento.
6. **Harness desechable.** Levantar un subconjunto mínimo del sistema (un servicio, dependencias mockeadas) que ejercite el code path del bug con una sola llamada a función.
7. **Bucle de property / fuzz.** Si el bug es "a veces la salida es incorrecta", ejecutar 1000 entradas aleatorias y buscar el modo de fallo.
8. **Harness de bisección.** Si el bug apareció entre dos estados conocidos (commit, dataset, versión), automatizar "arrancar en el estado X, comprobar, repetir" para poder hacer `git bisect run`.
9. **Bucle diferencial.** Pasar la misma entrada por la versión vieja vs la nueva (o dos configuraciones) y comparar salidas.
10. **Script bash HITL.** Último recurso. Si un humano debe hacer clic, dirígelo _a él_ con [hitl-loop.template.sh](scripts/hitl-loop.template.sh) para que el bucle siga siendo estructurado. La salida capturada vuelve a ti.

Construye el bucle de feedback correcto y el bug está resuelto al 90%.

### Ajustar el bucle

Trata el bucle como un producto. En cuanto tengas _un_ bucle, **ajústalo**:

- ¿Puedo hacerlo más rápido? (Cachear el setup, saltar inicialización no relacionada, estrechar el alcance del test.)
- ¿Puedo afilar la señal? (Asertar sobre el síntoma específico, no "no crasheó".)
- ¿Puedo hacerlo más determinista? (Fijar el tiempo, seedear el RNG, aislar el filesystem, congelar la red.)

Un bucle flaky de 30 segundos es apenas mejor que ningún bucle; uno determinista de 2 segundos es ajustado — un superpoder de debugging.

### Bugs no deterministas

El objetivo no es una repro limpia sino una **tasa de reproducción más alta**. Ejecuta el trigger en bucle 100×, paraleliza, añade estrés, estrecha ventanas de timing, inyecta sleeps. Un bug que falla el 50% de las veces es debuggeable; el 1% no — sigue subiendo la tasa hasta que sea debuggeable.

### Cuando genuinamente no puedes construir un bucle

Detente y dilo explícitamente. Lista lo que intentaste. Pide al usuario: (a) acceso al entorno que lo reproduce, (b) un artefacto capturado y censurado (archivo HAR, volcado de logs, core dump, grabación de pantalla con timestamps), o (c) permiso para añadir instrumentación temporal en producción. **No** procedas a hipotetizar sin un bucle.

### Criterio de completitud — un bucle ajustado que se pone red

La Fase 1 está lista cuando el bucle es **ajustado** y **capaz de ponerse red**: puedes nombrar **un comando** — la ruta de un script, la invocación de un test, un curl — que ya has **ejecutado al menos una vez** (muestra la invocación y su salida, censuradas), y que es:

- [ ] **Capaz de ponerse red** — recorre el code path real del bug y aserta el **síntoma exacto del usuario**, de modo que puede ponerse red con este bug y green una vez arreglado. No "corre sin error" — debe poder _atrapar este bug específico_.
- [ ] **Determinista** — mismo veredicto en cada ejecución (bugs flaky: una tasa de reproducción alta y fijada, según lo anterior).
- [ ] **Rápido** — segundos, no minutos.
- [ ] **Ejecutable por el agente** — puedes correrlo sin supervisión; un humano en el bucle solo vía [hitl-loop.template.sh](scripts/hitl-loop.template.sh).

Si te sorprendes leyendo código para armar una teoría antes de que este comando exista, **para — saltar directo a una hipótesis es exactamente el fallo que este skill previene.** Sin comando capaz de ponerse red, no hay Fase 2.

## Fase 2 — Reproducir + minimizar

Ejecuta el bucle. Míralo ponerse red — el bug aparece.

Confirma:

- [ ] El bucle produce el modo de fallo que describió el **usuario** — no un fallo distinto que casualmente queda cerca. Bug equivocado = fix equivocado.
- [ ] El fallo es reproducible en múltiples ejecuciones (o, para bugs no deterministas, reproducible a una tasa lo bastante alta para debuggear contra ella).
- [ ] Has capturado el síntoma exacto (mensaje de error, salida incorrecta, timing lento) para que las fases posteriores puedan verificar que el fix realmente lo resuelve.

### Minimizar

En cuanto esté red, encoge la repro al **escenario más pequeño que siga poniéndose red**. Recorta entradas, callers, configuración, datos y pasos **de uno en uno**, re-ejecutando el bucle tras cada recorte — conserva solo lo que sostiene el fallo.

Por qué molestarse: una repro mínima encoge el espacio de hipótesis de la Fase 3 (quedan menos piezas móviles que sospechar) y se convierte en el test de regresión limpio de la Fase 5.

Está listo cuando **cada elemento restante sostiene el fallo** — quitar cualquiera de ellos hace que el bucle se ponga green.

No avances hasta haber reproducido **y** minimizado.

## Fase 3 — Hipotetizar

Genera **3–5 hipótesis rankeadas** antes de probar ninguna. Generar una sola hipótesis ancla en la primera idea plausible.

Cada hipótesis debe ser **falsable**: enuncia la predicción que hace.

> Formato: "Si <X> es la causa, entonces <cambiar Y> hará desaparecer el bug / <cambiar Z> lo empeorará."

Si no puedes enunciar la predicción, la hipótesis es una corazonada — descártala o afílala.

**Muestra la lista rankeada al usuario antes de probar.** A menudo tiene conocimiento de dominio que re-rankea al instante ("acabamos de desplegar un cambio en la #3"), o conoce hipótesis que ya descartó. Checkpoint barato, gran ahorro de tiempo. No te bloquees en él — continúa con tu ranking si el usuario está ausente.

## Fase 4 — Instrumentar

Cada sonda debe mapear a una predicción específica de la Fase 3. **Cambia una variable por vez.**

Preferencia de herramientas:

1. **Debugger / inspección en REPL** si el entorno lo soporta. Un breakpoint vale más que diez logs.
2. **Logs dirigidos** en los límites que distinguen hipótesis.
3. Nunca "loguear todo y grepear".

**Etiqueta cada log de debug** con un prefijo único, p. ej. `[DEBUG-a4f2]`. La limpieza final se vuelve un solo grep. Los logs sin etiqueta sobreviven; los etiquetados mueren.

**Rama de rendimiento.** Para regresiones de rendimiento, los logs suelen ser la herramienta equivocada. En su lugar: establece una medición de línea base (harness de timing, `performance.now()`, profiler, query plan) y luego bisecta. Medir primero, arreglar después.

## Fase 5 — Fix + test de regresión

Escribe el test de regresión **antes del fix** — pero solo si existe un **seam correcto** para él.

Un seam correcto es uno donde el test ejercita el **patrón real del bug** tal como ocurre en el call site. Si el único seam disponible es demasiado superficial (test de un solo caller cuando el bug necesita varios, unit test que no puede replicar la cadena que disparó el bug), un test de regresión ahí da falsa confianza.

**Si no existe un seam correcto, eso mismo es el hallazgo.** Anótalo. La arquitectura del codebase está impidiendo dejar el bug bajo llave. Márcalo para la fase siguiente.

Si existe un seam correcto:

1. Convierte la repro minimizada en un test que falla en ese seam.
2. Míralo fallar.
3. Aplica el fix.
4. Míralo pasar.
5. Re-ejecuta el bucle de feedback de la Fase 1 contra el escenario original (sin minimizar).

## Fase 6 — Limpieza + post-mortem

Requerido antes de declarar terminado:

- [ ] La repro original ya no reproduce (re-ejecutar el bucle de la Fase 1)
- [ ] El test de regresión pasa (o la ausencia de seam está documentada)
- [ ] Toda la instrumentación `[DEBUG-...]` eliminada (`grep` del prefijo)
- [ ] Prototipos desechables borrados (o movidos a una ubicación de debug claramente marcada)
- [ ] La hipótesis que resultó correcta queda enunciada en el mensaje del commit / PR — para que el siguiente debugger aprenda

**Después pregunta: ¿qué habría prevenido este bug?** Si la respuesta implica cambio arquitectónico (sin buen seam de test, callers enredados, acoplamiento oculto), traspásalo al skill `improve-codebase-architecture` con los detalles. Haz la recomendación **después** de que el fix esté dentro, no antes — ahora tienes más información que cuando empezaste.
