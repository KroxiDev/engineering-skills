---
name: setup-ts-deep-modules
description: Conecta dependency-cruiser a un repo TypeScript para que cada package sea un módulo profundo — implementación oculta en subcarpetas, alcanzable solo a través de sus archivos de entry point. Invocado por el usuario.
---

# Configurar deep modules en TS

Hacer de cada package de este repo un **módulo profundo**: mucho comportamiento detrás de una interface pequeña. La superficie pública de un package son sus **entry points** — los archivos en la raíz del package — y todo lo que hay en sus subcarpetas está oculto. Este skill instala [dependency-cruiser](https://github.com/sverweij/dependency-cruiser) y las reglas que hacen de los entry points la única puerta de entrada, y luego demuestra que las reglas muerden.

Para el vocabulario (módulo profundo, interface, seam, profundidad), ejecutar el skill `codebase-design` — usar su lenguaje en todo momento.

## La forma que esto impone

```
src/packages/
  <nombre>/
    index.ts        ← un entry point (público). Importar esto desde fuera.
    client.ts       ← otro entry point. Los packages pueden exponer VARIOS.
    lib/            ← implementación: oculta desde fuera, libre de importarse entre sí.
    tests/          ← tests co-ubicados + fixtures (una subcarpeta, así que privada).
```

La superficie pública son los **archivos raíz** del package — no un `index.ts` designado. Por convención la implementación vive en `lib/` y los tests en `tests/`, dando a cada package la misma forma de dos carpetas. La regla en sí es general, eso sí: _cualquier cosa_ en _cualquier_ subcarpeta es privada, así que nunca hay que extender la configuración para añadir una carpeta.

Cuatro reglas, todas `error`:

1. **Límite de entry point** — el código de fuera de un package (código de la app u otro package) solo puede importar los entry points de ese package (sus archivos raíz), nunca nada de sus subcarpetas.
2. **Libertad intra-package** — los archivos propios de un package se importan entre sí libremente.
3. **Tests a través de los entry points** — los archivos bajo `<pkg>/tests/` pueden importar los entry points de cualquier package y sus propios fixtures de `tests/`, pero nunca los internals de subcarpetas de ningún package (ni siquiera del propio). Los tests de integración entre packages están bien; los deep imports no.
4. **Sin ciclos** — sin ciclos de dependencias.

**Entry points, no un barrel.** Como la superficie pública es _cada_ archivo raíz, un package puede exponer varios entry points pequeños (`index.ts`, `client.ts`, `server.ts`) en vez de canalizar todo por un `index.ts` gigante. Los barrel files que re-exportan un subárbol entero se desaconsejan — mantener los entry points pequeños y esconder la implementación en subcarpetas.

El layering (qué packages pueden depender de cuáles) es un asunto _distinto_ y queda como stub comentado en la configuración para que este repo lo rellene.

## Pasos

### 1. Detectar el entorno

- **Package manager** — `pnpm-lock.yaml` → pnpm, `yarn.lock` → yarn, `bun.lockb` → bun, si no npm. Usarlo para cada comando de abajo (`pnpm`/`yarn`/`npm run`/`bunx`).
- **Raíz de packages** — si existe `src/`, usar `src/packages`; si no, `packages`. Confirmar la elección con el usuario si el repo ya tiene otra convención obvia.
- **Configuración existente** — buscar un archivo `.dependency-cruiser.*`. Si existe, **no** sobrescribirlo: fusionar dentro las cuatro reglas y las opciones, y decir al usuario qué se añadió.

**Listo cuando:** se conocen el package manager, la raíz de packages y el estado de la configuración existente.

### 2. Instalar dependency-cruiser

Instalar `dependency-cruiser` como devDependency con el package manager detectado.

**Listo cuando:** `dependency-cruiser` está en `devDependencies`.

### 3. Escribir la configuración

Copiar [`dependency-cruiser.config.cjs`](assets/dependency-cruiser.config.cjs) a la raíz del repo como `.dependency-cruiser.cjs`. Poner en `PACKAGES_ROOT` la raíz detectada en el paso 1. Las reglas se basan en profundidad de ruta y son agnósticas de extensión, así que no hace falta adaptar nada más.

**Listo cuando:** `.dependency-cruiser.cjs` existe con el `PACKAGES_ROOT` correcto y las cuatro reglas forbidden están presentes.

### 4. Conectarlo a los checks

- Añadir un script `lint:boundaries`: `depcruise <packages-root>` (o `depcruise src`).
- Integrarlo en el comando paraguas de checks del repo — el que ya ejecuta el typecheck (p. ej. un script `check` / `ci` / `validate`). **No** tocar `tsconfig` ni añadir path aliases.
- Si no hay script paraguas, añadir `lint:boundaries` y decir al usuario que lo incluya en CI.

**Listo cuando:** `lint:boundaries` existe y corre como parte del mismo comando que el typecheck.

### 5. Armar el package de ejemplo

Crear un `<packages-root>/example/` commiteado como plantilla de copiar-y-pegar:

- `index.ts` — un entry point. Exportar una función que delega en un archivo interno (para que el package sea visiblemente _profundo_, no un pass-through).
- `lib/impl.ts` — un archivo interno en una **subcarpeta**, importado por `index.ts`, no alcanzable desde fuera.
- `tests/example.test.ts` — importa **solo** `../index` (un entry point) y aserta contra la función pública.

Decir al usuario que es una plantilla inicial para copiar o borrar.

**Listo cuando:** el package de ejemplo existe, expone su comportamiento a través de un entry point raíz y esconde `impl` en una subcarpeta.

### 6. Demostrar que las reglas muerden

Este es el criterio de finalización del skill entero — una configuración que no falla ante una violación no vale nada.

1. Ejecutar `lint:boundaries`. Debe **pasar** con el ejemplo limpio.
2. Añadir temporalmente un deep import a `tests/example.test.ts` (p. ej. `import { thing } from "../lib/impl"`). Ejecutar `lint:boundaries` de nuevo — debe **fallar** con `tests-through-entrypoints`.
3. Revertir el deep import. Ejecutar una vez más — debe **pasar**.

**Listo cuando:** has observado un pass, luego un fail con el deep import, y luego un pass de nuevo. Si el paso 2 no falla, las reglas no están bien conectadas — arreglarlo antes de terminar.

### 7. Documentar la convención

Escribir un `README.md` **en la carpeta de packages** (`<packages-root>/README.md`) — junto a los packages que gobierna — cubriendo: el layout `src/packages/<nombre>/` (entry points en la raíz, `lib/` para implementación, `tests/` para tests), "importar solo a través de los entry points de un package (sus archivos raíz)", y cómo ejecutar `lint:boundaries`. **Desaconsejar los barrel files** explícitamente — exponer varios entry points pequeños en vez de re-exportar un subárbol entero por un index. Limitarlo al snippet de copiar-y-pegar más las cuatro reglas en un párrafo cada una.

Después añadir un **puntero de contexto** hacia él desde el archivo de instrucciones de agente del repo — `CLAUDE.md` si está presente, si no `AGENTS.md` (crear `AGENTS.md` si no existe ninguno). Con una línea basta, p. ej. `Los packages son módulos profundos — ver [src/packages/README.md](./src/packages/README.md) antes de añadir o importar uno.` Esto es lo que hace que un agente descubra la regla de límites en vez de tropezarse con ella.

**Listo cuando:** `<packages-root>/README.md` existe y desaconseja los barrels, y el `CLAUDE.md`/`AGENTS.md` del repo lo enlaza.

## Notas

- Las back-references `$1` de la configuración (el group matching de dependency-cruiser) son lo que permite a un package alcanzar sus propios internals mientras los de fuera no pueden — no aplanarlas en reglas separadas por package.
- Público vs privado se decide por **profundidad**: los archivos raíz de un package son entry points; cualquier cosa en una subcarpeta es privada. Las subcarpetas convencionales son `lib/` (implementación) y `tests/`, pero la regla no las hardcodea — cualquier subcarpeta es privada, así que una carpeta nueva nunca necesita un cambio de configuración. Añadir un entry point es solo añadir un archivo raíz — sin barrel.
- Los packages son **planos**: un solo nivel de hijos inmediatos bajo la raíz. Los internals de un package pueden anidarse tanto como se quiera; un package no puede contener otro package.
- Usar `.cjs` (no `.js`) para que el `module.exports` de la configuración funcione incluso en repos con `"type": "module"`.
