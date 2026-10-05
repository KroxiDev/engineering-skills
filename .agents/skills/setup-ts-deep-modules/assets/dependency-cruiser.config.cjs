// @ts-check
// Aplicación de deep modules con dependency-cruiser.
//
// Cada package es un DEEP MODULE: mucho comportamiento detrás de una interface
// pequeña. Su superficie pública son los ENTRY POINTS de la raíz. La
// implementación vive en subcarpetas privadas, por convención `lib/` y `tests/`.
// Un package puede exponer varios entry points pequeños; preferirlos a un barrel.
//
// Solo debería ser necesario editar PACKAGES_ROOT.

/** Ubicación de packages: un directorio hijo por package, sin anidamiento. */
const PACKAGES_ROOT = "src/packages";

// --- patrones derivados; no editar -----------------------------------------
const R = PACKAGES_ROOT;
/**
 * Internals privados: todo lo anidado en una subcarpeta del package.
 * Los archivos raíz son entry points y siguen siendo importables externamente.
 */
const PACKAGE_INTERNALS = `^${R}/[^/]+/[^/]+/`;

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "entrypoint-boundary-from-app",
      comment:
        "El código externo puede importar entry points raíz, pero no internals de subcarpetas.",
      severity: "error",
      from: { pathNot: `^${R}/` }, // importer is NOT inside any package
      to: { path: PACKAGE_INTERNALS },
    },
    {
      name: "entrypoint-boundary-across-packages",
      comment:
        "Los archivos propios se importan libremente; otros packages solo se alcanzan mediante entry points.",
      severity: "error",
      // importer is inside a package ($1), but is not a test file
      from: { path: `^${R}/([^/]+)/`, pathNot: `^${R}/[^/]+/tests/` },
      to: {
        path: PACKAGE_INTERNALS,
        pathNot: `^${R}/$1/`, // same package → intra-package freedom
      },
    },
    {
      name: "tests-through-entrypoints",
      comment:
        "Los tests usan entry points y fixtures propios, nunca internals de ningún package.",
      severity: "error",
      from: { path: `^${R}/([^/]+)/tests/` }, // a test file, in package $1
      to: {
        path: PACKAGE_INTERNALS,
        pathNot: `^${R}/$1/tests/`, // own tests/ fixtures → allowed
      },
    },
    {
      name: "tests-folder-is-private",
      comment:
        "La carpeta tests/ solo es accesible desde tests; otros archivos no importan fixtures.",
      severity: "error",
      from: { pathNot: `^${R}/[^/]+/tests/` }, // importer is not itself a test
      to: { path: `^${R}/[^/]+/tests/` },
    },
    {
      name: "no-circular",
      comment:
        "Sin ciclos de dependencias. Limitar a `^${R}/` para permitir ciclos externos.",
      severity: "error",
      from: {},
      to: { circular: true },
    },

    // --- Layering opcional, desactivado por defecto ---------------------------
    // Los entry points controlan CÓMO importar. Layering controla QUÉ packages
    // pueden depender entre sí. Agregar reglas propias aquí, por ejemplo:
    //
    // {
    //   name: "ui-may-not-depend-on-billing",
    //   severity: "error",
    //   from: { path: `^${R}/ui/` },
    //   to:   { path: `^${R}/billing/` },
    // },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsConfig: { fileName: "tsconfig.json" },
    enhancedResolveOptions: {
      extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    },
  },
};
