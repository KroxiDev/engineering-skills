---
name: wizard
description: Genera un wizard Bash interactivo que guía a un humano por un procedimiento manual — configuración de terceros, una migración puntual, una transición de estado A→B — abriendo URLs, capturando valores, confirmando cada paso, y escribiendo archivos .env y secrets de GitHub Actions.
---

# Wizard

Un **wizard** es un script bash que guía a un humano, paso a paso, por un procedimiento manual que es tedioso de hacer a mano y tedioso de re-explicarle a una IA cada vez. Abre cada URL, dice exactamente qué clicar y copiar, captura los valores, los escribe donde corresponden (`.env`, secrets de GitHub), confirma en cada etapa y muestra cuántas etapas quedan. Puede configurar servicios de terceros, ejecutar una migración puntual o mover el proyecto de un estado a otro.

La UX agradable ya está resuelta por [template.sh](assets/template.sh) — progreso etapa a etapa, compuertas de confirmación, apertura de URLs multiplataforma (incluido WSL), entrada oculta de secretos, upserts idempotentes de `.env`, escrituras con `gh secret`/`gh variable`, y un resumen de cierre. **Tu trabajo es solo delimitar el procedimiento y redactar sus etapas.** La biblioteca por encima del marcador `STAGES` es idéntica en todo wizard; esa consistencia es el punto — nunca editarla a mano.

Un wizard es efímero por defecto — construido para una ejecución, guardado en una ruta de borrador o `scripts/`, borrado cuando el trabajo termina. Commitearlo solo cuando el usuario quiera una ruta de setup repetible que deba vivir en el repo.

## Proceso

### 1. Delimitar el procedimiento

Averiguar cada paso manual que el humano debe dar y cada valor que se captura por el camino. Leer primero el repo — no preguntar en frío:

- Para un setup: `.env`, `.env.example`, `.env.*`, `README`, `docker-compose*`, la configuración del framework y `.github/workflows/*` (cada referencia `secrets.*` / `vars.*` es un valor que el wizard debe producir).
- Para una migración o transición: el estado actual, el estado objetivo y las acciones irreversibles entre ambos.

Luego mostrar al usuario la lista ordenada de etapas y los valores que produce cada una, y confirmar — puede añadir, quitar o reordenar.

**Listo cuando:** cada etapa está nombrada en orden, y de cada valor capturado sabes (a) de dónde lo saca el humano, (b) dónde se escribe (`.env`, un secret de GitHub, ambos, o ninguno — algunas etapas son acciones puras), y (c) si es secreto (entrada oculta) o público.

### 2. Mapear el recorrido de cada etapa

Para cada etapa, escribir el camino preciso que sigue un humano: qué URL abrir, qué hacer allí, dónde se muestra un valor, qué variable rellena — p. ej. "Dashboard → Developers → API keys → Reveal test key → copiar". Donde no conozcas de verdad la UI actual o el comando exacto, dilo y pregunta al usuario o revisa la documentación — nunca inventar pasos que quizá no existan.

**Listo cuando:** cada etapa se traduce en instrucciones concretas que un desconocido podría seguir.

### 3. Redactar el wizard

Copiar `template.sh` a la ruta de destino. Reemplazar la etapa de ejemplo con un `stage` por paso, en orden de dependencia. Usar los helpers de la biblioteca — `stage`, `say`/`step`, `open_url`, `ask`/`ask_secret`, `write_env`, `set_secret`/`set_var`, `pause`/`confirm` — y fijar `TOTAL_STAGES` al número de etapas que escribiste.

Sostener el listón que fija la plantilla: abrir la URL antes de pedir su valor, usar `ask_secret` para todo lo secreto, `write_env` para cada valor persistido, `set_secret` solo para los valores que el CI realmente necesita, y `confirm` antes de cualquier acción irreversible. Cada `stage` limpia la pantalla para que solo el paso actual sea visible — mantener cada etapa en una sola tarea enfocada para que nada de lo que el humano necesita se pierda con el scroll. No tocar la biblioteca por encima del marcador.

### 4. Verificar y entregar

- `bash -n <script>`; ejecutar `shellcheck` si está disponible.
- `chmod +x <script>`.
- No ejecutarlo tú de extremo a extremo — abre navegadores y se bloquea esperando entrada humana. Trazarlo estáticamente en su lugar: cada valor del paso 1 se captura y aterriza donde el paso 1 dijo, y cada nombre de `set_secret` coincide exactamente con una referencia `secrets.*` en CI.
- Decir al usuario cómo ejecutarlo. Si es una ruta de setup repetible, commitearlo y enlazarlo desde el README para que la próxima persona ejecute el script en vez de preguntarle a una IA.
