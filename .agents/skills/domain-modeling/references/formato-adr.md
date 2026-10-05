# Formato de ADR

Los ADRs viven en `docs/adr/` y usan numeración secuencial: `0001-slug.md`, `0002-slug.md`, etc.

Crear el directorio `docs/adr/` de forma diferida — solo cuando se necesite el primer ADR.

## Plantilla

```md
# {Título corto de la decisión}

{1-3 frases: cuál es el contexto, qué decidimos y por qué.}
```

Eso es todo. Un ADR puede ser un solo párrafo. El valor está en registrar _que_ se tomó una decisión y _por qué_ — no en rellenar secciones.

## Secciones opcionales

Incluirlas solo cuando aporten valor genuino. La mayoría de los ADRs no las necesitarán.

- Frontmatter de **Status** (`proposed | accepted | deprecated | superseded by ADR-NNNN`) — útil cuando las decisiones se revisitan
- **Opciones consideradas** — solo cuando las alternativas rechazadas merecen recordarse
- **Consecuencias** — solo cuando hay efectos posteriores no obvios que señalar

## Numeración

Escanear `docs/adr/` en busca del número más alto existente e incrementar en uno.

## Cuándo ofrecer un ADR

Las tres condiciones deben ser ciertas:

1. **Difícil de revertir** — el coste de cambiar de opinión más adelante es significativo
2. **Sorprendente sin contexto** — un lector futuro mirará el código y se preguntará "¿por qué demonios lo hicieron así?"
3. **Resultado de un trade-off real** — había alternativas genuinas y se eligió una por razones específicas

Si una decisión es fácil de revertir, omitirla — simplemente se revertirá. Si no es sorprendente, nadie se preguntará por qué. Si no había alternativa real, no hay nada que registrar más allá de "hicimos lo obvio".

### Qué califica

- **Forma arquitectónica.** "Usamos un monorepo." "El write model es event-sourced, el read model se proyecta en Postgres."
- **Patrones de integración entre contextos.** "Ordering y Billing se comunican vía eventos de dominio, no HTTP síncrono."
- **Elecciones tecnológicas con lock-in.** Base de datos, message bus, proveedor de auth, destino de despliegue. No cada librería — solo las que llevaría un trimestre reemplazar.
- **Decisiones de límites y alcance.** "Los datos de cliente pertenecen al contexto Customer; los demás contextos los referencian solo por ID." Los noes explícitos valen tanto como los síes.
- **Desviaciones deliberadas del camino obvio.** "Usamos SQL manual en vez de un ORM porque X." Cualquier cosa donde un lector razonable asumiría lo contrario. Esto evita que el siguiente ingeniero "arregle" algo que era deliberado.
- **Restricciones no visibles en el código.** "No podemos usar AWS por requisitos de compliance." "Los tiempos de respuesta deben estar bajo 200ms por el contrato con la API del partner."
- **Alternativas rechazadas cuando el rechazo no es obvio.** Si consideraste GraphQL y elegiste REST por razones sutiles, regístralo — si no, alguien volverá a sugerir GraphQL en seis meses.
