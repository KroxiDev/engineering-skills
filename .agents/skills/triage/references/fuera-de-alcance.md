# Base de conocimiento fuera de alcance

El directorio `.out-of-scope/` de un repo almacena registros persistentes de peticiones de features rechazadas. Sirve a dos propósitos:

1. **Memoria institucional** — por qué se rechazó una feature, para que el razonamiento no se pierda al cerrar el issue
2. **Deduplicación** — cuando llega un issue nuevo que coincide con un rechazo previo, el skill puede sacar a la superficie la decisión anterior en vez de re-litigarla

## Estructura del directorio

```
.out-of-scope/
├── dark-mode.md
├── plugin-system.md
└── graphql-api.md
```

Un archivo por **concepto**, no por issue. Múltiples issues que piden lo mismo se agrupan bajo un archivo.

## Formato del archivo

El archivo debe escribirse en un estilo relajado y legible — más como un documento de diseño corto que como una entrada de base de datos. Usar párrafos, muestras de código y ejemplos para que el razonamiento quede claro y sea útil para alguien que lo encuentra por primera vez.

````markdown
# Dark Mode

Este proyecto no soporta dark mode ni theming de cara al usuario.

## Por qué está fuera de alcance

El pipeline de renderizado asume una única paleta de colores definida en
`ThemeConfig`. Soportar múltiples temas exigiría:

- Un provider de contexto de tema envolviendo todo el árbol de componentes
- Resolución de estilos consciente del tema por componente
- Una capa de persistencia para las preferencias de tema del usuario

Es un cambio arquitectónico significativo que no encaja con el foco del
proyecto en la autoría de contenido. El theming es un asunto de los
consumidores downstream que incrustan o redistribuyen la salida.

```ts
// La interface actual de ThemeConfig no está diseñada para cambiar en runtime:
interface ThemeConfig {
  colors: ColorPalette; // paleta única, resuelta en build time
  fonts: FontStack;
}
```

## Prior requests

- #42 — "Add dark mode support"
- #87 — "Night theme for accessibility"
- #134 — "Dark theme option"
````

### Nombrar el archivo

Usar un nombre corto y descriptivo en kebab-case para el concepto: `dark-mode.md`, `plugin-system.md`, `graphql-api.md`. El nombre debe ser lo bastante reconocible como para que alguien que navegue el directorio entienda qué se rechazó sin abrir el archivo.

### Escribir la razón

La razón debe ser sustantiva — no "no queremos esto" sino el porqué. Las buenas razones referencian:

- Alcance o filosofía del proyecto ("Este proyecto se centra en X; el theming es un asunto downstream")
- Restricciones técnicas ("Soportar esto exigiría Y, que entra en conflicto con nuestra arquitectura Z")
- Decisiones estratégicas ("Elegimos A en vez de B porque...")

La razón debe ser durable. Evitar referenciar circunstancias temporales ("ahora mismo estamos muy ocupados") — esos no son rechazos reales, son aplazamientos.

## Cuándo consultar `.out-of-scope/`

Durante el triage (Paso 1: Reunir contexto), leer todos los archivos de `.out-of-scope/`. Al evaluar un issue nuevo:

- Comprobar si la petición coincide con un concepto fuera de alcance existente
- La coincidencia es por similitud de concepto, no por palabra clave — "night theme" coincide con `dark-mode.md`
- Si hay coincidencia, sacarla a la superficie ante el maintainer: "Esto se parece a `.out-of-scope/dark-mode.md` — lo rechazamos antes porque [razón]. ¿Sigues pensando lo mismo?"

El maintainer puede:

- **Confirmar** — el issue nuevo se añade a la lista de "Prior requests" del archivo existente, y se cierra
- **Reconsiderar** — el archivo fuera-de-alcance se borra o actualiza, y el issue sigue el triage normal
- **Discrepar** — los issues están relacionados pero son distintos; proceder con el triage normal

## Cuándo escribir en `.out-of-scope/`

Solo cuando un **enhancement** (no un bug) se _rechaza_ como `wontfix`. Esto aplica a las PRs de enhancement exactamente igual que a los issues — una PR rechazada se registra aquí para que la misma petición no vuelva como código fresco.

**No** escribir aquí cuando algo se cierra como `wontfix` por estar **ya implementado**. Eso es una feature construida, no una rechazada; registrarla envenenaría las comprobaciones de deduplicación con falsos rechazos. En su lugar, el comentario de cierre apunta a dónde vive ya la feature.

El flujo:

1. El maintainer decide que una petición de feature está fuera de alcance
2. Comprobar si ya existe un archivo `.out-of-scope/` coincidente
3. Si sí: añadir el issue nuevo a la lista de "Prior requests"
4. Si no: crear un archivo nuevo con el nombre del concepto, la decisión, la razón y la primera petición previa
5. Publicar un comentario en el issue explicando la decisión y mencionando el archivo `.out-of-scope/`
6. Cerrar el issue con la label `wontfix`

## Actualizar o eliminar archivos fuera de alcance

Si el maintainer cambia de opinión sobre un concepto rechazado anteriormente:

- Borrar el archivo `.out-of-scope/`
- El skill no necesita reabrir issues viejos — son registros históricos
- El issue nuevo que disparó la reconsideración sigue el triage normal
