---
name: resolving-merge-conflicts
description: Usar cuando haya que resolver un conflicto de merge/rebase de git en progreso.
---

1. **Ver el estado actual** del merge/rebase. Revisar el historial de git y los archivos en conflicto.

2. **Encontrar las fuentes primarias** de cada conflicto. Entender en profundidad por qué se hizo cada cambio y cuál era la intención original. Leer los mensajes de commit, revisar las PRs, revisar los issues/tickets originales.

3. **Resolver cada hunk.** Preservar ambas intenciones cuando sea posible. Cuando sean incompatibles, elegir la que coincida con el objetivo declarado del merge y anotar el trade-off. **No** inventar comportamiento nuevo. Resolver siempre; nunca `--abort`.

4. Descubrir los **checks automatizados** del proyecto y ejecutarlos — típicamente typecheck, luego tests, luego formato. Arreglar todo lo que el merge haya roto.

5. **Terminar el merge/rebase.** Stagear todo y commitear. Si es un rebase, continuar el proceso hasta que todos los commits estén rebasados.
