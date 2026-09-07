---
name: git-worktree
description: Prepara worktrees para implementar varias tareas del mismo proyecto en paralelo sin sobrescribir archivos entre agentes. Solo por invocación explícita del usuario.
license: MIT
---

# Implementación en worktrees

Ejecuta este skill cuando el usuario lo invoque por su nombre. Una tarea de implementación corresponde a un worktree, una rama y una sesión responsable de escribir. Las revisiones siguen su flujo separado; un revisor de solo lectura puede consultar ese mismo estado mientras se mantiene estable.

1. **Identifica la tarea y el estado del repositorio.** Lee sus instrucciones y consulta `git rev-parse --show-toplevel`, `git status --short --branch` y `git worktree list --porcelain`. Determina la tarea, la rama base y la ruta de destino a partir del encargo y las convenciones del proyecto. Pregunta solo si falta un dato indispensable. Los cambios sin commit del checkout actual no aparecen en un worktree nuevo: si la tarea depende de ellos, acuerda cómo trasladar únicamente los cambios pertinentes antes de continuar.

2. **Asigna un directorio exclusivo para escribir.** Reutiliza un worktree enlazado solo si corresponde a esta tarea y ninguna otra sesión está escribiendo allí. Estar dentro de un worktree no basta para asumir que está disponible. Si hay otro agente trabajando o la asignación es incierta, elige una rama y una ruta nuevas. Para crear uno nuevo, verifica que el destino esté permitido, no exista y quede fuera de los directorios de trabajo de otras tareas. Conserva las ramas y los archivos de las demás sesiones.

   Para crear una rama, usa `git worktree add -b <rama-tarea> <ruta-absoluta> <base>`. Para una rama existente que no está ocupada, usa `git worktree add <ruta-absoluta> <rama-tarea>`. Sustituye los marcadores y entrecomilla las rutas. Respeta la base solicitada; no presupongas `main` ni actualices otras ramas. Si Git rechaza la operación, examina la causa antes de continuar; no fuerces la reutilización de ramas o rutas.

3. **Sitúa la sesión en el worktree asignado.** Verifica allí la raíz, la rama y el commit inicial. Fija ese directorio en cada herramienta de edición, comando y proceso; un cambio de directorio en una llamada puede no persistir en la siguiente. Lee las instrucciones aplicables en ese checkout. Si la herramienta no permite trabajar allí, informa el bloqueo antes de editar. Comparte la asignación tarea → ruta absoluta → rama. Este skill prepara la sesión actual; no lanza agentes adicionales por sí solo.

4. **Prepara el entorno necesario.** Un worktree nuevo contiene el estado versionado de la base, no los archivos locales del checkout de origen. Reutiliza el procedimiento de preparación documentado por el proyecto y comprueba:

   - **Configuración e instrucciones locales:** identifica los archivos no versionados necesarios. Usa plantillas o copias independientes de los archivos autorizados; preserva su condición de ignorados y evita mostrar secretos. Copiar un `.env` conserva sus destinos: verifica que servicios y datos correspondan a esta tarea antes de ejecutar pruebas o migraciones.
   - **Dependencias y artefactos:** instala con el gestor, lockfile y versión del proyecto, y genera los artefactos dentro del worktree. Cada tarea mantiene su propio entorno virtual, dependencias instaladas y salidas de compilación; evita enlaces a directorios mutables de otro checkout. En Windows/PowerShell usa comandos nativos y `npm.cmd` cuando corresponda.
   - **Servicios y datos:** asigna puertos distintos a servidores, pruebas y depuradores. Usa bases, esquemas, archivos y volúmenes separados para procesos que mutan datos; un servidor compartido requiere aislar los datos de cada tarea. En Docker Compose distingue el nombre del proyecto, los puertos publicados y los volúmenes externos. Conserva los recursos de las demás sesiones.
   - **Estado compartido de Git:** los worktrees comparten referencias, stash y configuración por defecto. Conserva esa configuración y comprueba que los hooks no escriban en otro checkout. El aislamiento de carpetas no protege frente a comandos dirigidos a rutas o recursos ajenos.

5. **Implementa y valida dentro de la asignación.** Continúa la tarea autorizada con sus requisitos y comprobaciones habituales. Si el usuario pidió únicamente preparar el worktree, termina cuando el entorno necesario esté verificado. Si la preparación falla, informa qué falta y conserva el trabajo. Al entregar, indica tarea, ruta, rama, comprobaciones y estado pendiente de commit o integración. Mantén el worktree disponible para la revisión posterior; no publiques, integres ni limpies por el solo hecho de terminar la implementación.

## Integración y limpieza solicitadas

Aplica esta sección solo cuando el encargo incluya integrar o retirar el worktree. Respeta las autorizaciones existentes y el flujo de ramas y PR del proyecto. Integra de a una tarea y verifica el resultado; si se usa squash, crea y valida el commit resultante antes de limpiar.

Antes de retirar un worktree, confirma que ninguna sesión lo use, revisa cambios pendientes, archivos nuevos e ignorados valiosos, y verifica que el trabajo esté integrado o que su descarte esté autorizado. Usa `git worktree remove <ruta-absoluta>` sin forzar. El borrado de la rama es una acción separada: `git branch -d <rama-tarea>` puede rechazar una rama integrada por squash; verifica la integración y la autorización en lugar de sustituirlo automáticamente por un borrado forzado. Retira solo los servicios y datos exclusivos de la tarea cuya limpieza esté autorizada.
