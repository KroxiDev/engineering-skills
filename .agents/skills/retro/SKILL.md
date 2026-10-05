---
name: retro
description: Hace una retrospectiva de una sesión de programación.
---

El usuario pidió una **retrospectiva**: sugiere mejoras al **entorno** del agente de programación para mejorar las ejecuciones futuras.

## Pasos

1. Usa el skill `writing-for-agents` como guía de estilo de escritura.

2. Lee las fuentes primarias de la sesión que indique el usuario; puede hacer falta buscar en los logs de sesión de esta máquina. Si no indica ninguna, usa la actual.

3. Busca candidatos de mejora en estas categorías:

- **Navegación**: ¿le costó al agente encontrar los archivos correctos? ¿Hay dependencias ocultas entre archivos? ¿Ayudaría un **puntero de navegación**? _Usar cuando_ la sesión tardó en encontrar un dato.
- **Checks automáticos**: ¿qué checks (linting, tipos, tests, linters del filesystem) habrían atrapado errores del agente? Lee primero el comando de checks del propio repo (scripts `lint`/`check` de `package.json` o de la herramienta de build, su workflow de CI): si un check ya existe pero está sin conectar o roto en silencio, ese es el hallazgo, no reinventarlo. Un repo sin **guardrail** (ni hook pre-commit ni job de CI que ejecute su lint/typecheck/tests) es un hallazgo en sí: un repo sin lint es una oportunidad perdida permanente, no algo neutral. _Usar cuando_ el agente cometió un error que un check automático habría atrapado, o el repo no tiene ningún guardrail.
- **Estándares de código**: ¿hay que darle al **agente revisor** una regla nueva, o quitar o aclarar una existente? Clasifica antes la violación: una **mecánica** (un patrón sintáctico fijo, una API prohibida, una forma de import, una regla de ubicación de archivos) recibe un check determinista, sin excepción: una regla propia en el linter del repo, un hook pre-commit nuevo o un job de CI nuevo, lo que resulte más barato según el lenguaje y el guardrail existentes. Por defecto, construye el check en vez de escribir la regla. Reserva `CODING_STANDARDS.md` para genuinas **cuestiones de criterio** (consistencia entre archivos, "sigue el estilo del código circundante", lo que ningún guardrail podría sustituir). _Usar cuando_ el agente revisor no atrapó un error.
- **AGENTS.md global**: ¿hay instrucciones de steering que deberían pasar a estándares de código (o a checks automáticos)? _Usar cuando_ el `AGENTS.md` es particularmente grande, en el repo O en el scope global del usuario.
- **Economía de herramientas**: ¿hizo el agente llamadas a herramientas caras que podrían simplificarse? ¿Hay tooling propio (CLIs, MCPs) especialmente ineficiente en tokens? _Usar cuando_ el agente hizo una llamada cara.
- **No-ops**: busca instrucciones en archivos de steering que no modifican el comportamiento del agente. _Usar cuando_ los archivos de steering son grandes y difíciles de manejar.
- **Acceso a información**: busca formas de ampliar el acceso del agente a la información, como volcar con `tee` los logs del dev server o dar acceso de solo lectura a servicios de terceros. _Usar cuando_ un dato crucial no estuvo disponible para el agente.

4. Presenta los candidatos al usuario, ordenados por severidad.

## Referencia

### Implementación vs. revisión

Todo trabajo pasa por dos etapas: implementación y revisión. El agente implementador tiene la mayor **presión de contexto**: explora, escribe código y depura fallos. El revisor tiene la menor: recibe un diff, así que no explora, y a menudo no necesita escribir código ni depurar. Por eso los estándares de código los impone el revisor, no el implementador.

### Archivos

- `CLAUDE.md`/`AGENTS.md`: se cargan en la ventana de contexto de cualquier agente que trabaje en el repo. Úsalos con muchísima moderación, normalmente solo para **punteros de navegación** a otros archivos.
- `CODING_STANDARDS.md`: se lee durante la revisión, no durante la implementación. Añade **punteros de navegación** a carpetas de docs si supera las 1000 líneas.
- Docs: archivos de referencia a los que apuntan otros archivos. Busca docs existentes antes de escribir nuevos.
- Skills: para docs (su description entra en la ventana de contexto del agente) o para comandos que invoca el usuario. Sigue los consejos del skill `writing-for-agents`.
