---
name: migrate-to-shoehorn
description: Migra archivos de test de type assertions `as` a @total-typescript/shoehorn. Usar cuando el usuario mencione shoehorn, quiera reemplazar `as` en tests, o necesite datos parciales de test.
---

# Migrar a shoehorn

## ¿Por qué shoehorn?

`shoehorn` te deja pasar datos parciales en tests manteniendo contento a TypeScript. Reemplaza las assertions `as` con alternativas type-safe.

**Solo código de test.** Nunca usar shoehorn en código de producción.

Problemas de `as` en tests:

- El modelo está entrenado para no usarlo
- Hay que especificar manualmente el tipo destino
- Doble as (`as unknown as Type`) para datos intencionalmente incorrectos

## Instalación

```bash
npm i @total-typescript/shoehorn
```

## Patrones de migración

### Objetos grandes con pocas propiedades necesarias

Antes:

```ts
type Request = {
  body: { id: string };
  headers: Record<string, string>;
  cookies: Record<string, string>;
  // ...20 propiedades más
};

it("gets user by id", () => {
  // Solo importa body.id pero hay que falsear el Request entero
  getUser({
    body: { id: "123" },
    headers: {},
    cookies: {},
    // ...falsear las 20 propiedades
  });
});
```

Después:

```ts
import { fromPartial } from "@total-typescript/shoehorn";

it("gets user by id", () => {
  getUser(
    fromPartial({
      body: { id: "123" },
    })
  );
});
```

### `as Type` → `fromPartial()`

Antes:

```ts
getUser({ body: { id: "123" } } as Request);
```

Después:

```ts
import { fromPartial } from "@total-typescript/shoehorn";

getUser(fromPartial({ body: { id: "123" } }));
```

### `as unknown as Type` → `fromAny()`

Antes:

```ts
getUser({ body: { id: 123 } } as unknown as Request); // tipo incorrecto a propósito
```

Después:

```ts
import { fromAny } from "@total-typescript/shoehorn";

getUser(fromAny({ body: { id: 123 } }));
```

## Cuándo usar cada una

| Función         | Caso de uso                                                        |
| --------------- | ------------------------------------------------------------------ |
| `fromPartial()` | Pasar datos parciales que siguen pasando el typecheck              |
| `fromAny()`     | Pasar datos intencionalmente incorrectos (conserva autocompletado) |
| `fromExact()`   | Forzar el objeto completo (cambiar por fromPartial después)        |

## Flujo de trabajo

1. **Reunir requisitos** — preguntar al usuario:
   - ¿Qué archivos de test tienen assertions `as` causando problemas?
   - ¿Están lidiando con objetos grandes donde solo importan algunas propiedades?
   - ¿Necesitan pasar datos intencionalmente incorrectos para testear errores?

2. **Instalar y migrar**:
   - [ ] Instalar: `npm i @total-typescript/shoehorn`
   - [ ] Encontrar archivos de test con assertions `as`: `grep -r " as [A-Z]" --include="*.test.ts" --include="*.spec.ts"`
   - [ ] Reemplazar `as Type` con `fromPartial()`
   - [ ] Reemplazar `as unknown as Type` con `fromAny()`
   - [ ] Añadir los imports de `@total-typescript/shoehorn`
   - [ ] Ejecutar el typecheck para verificar
