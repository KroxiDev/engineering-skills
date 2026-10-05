# Escribir briefs para agentes

Un brief de agente es un comentario estructurado publicado en un issue o PR de GitHub cuando pasa a `ready-for-agent`. Es la especificación autoritativa desde la que trabajará un agente AFK. El cuerpo original y la discusión son contexto — el brief de agente es el contrato.

El brief enuncia **qué debe hacer el agente**, lo cual abarca ambas superficies: para un issue, es construir el cambio desde cero; para una PR, es lo que queda por hacer _sobre el diff existente_ — terminarlo, cerrar huecos, atender puntos de la revisión. Mismos principios en ambos casos; el ejemplo de PR de abajo muestra la diferencia.

## Principios

### Durabilidad sobre precisión

El issue puede quedarse en `ready-for-agent` días o semanas. El codebase cambiará mientras tanto. Escribir el brief para que siga siendo útil aunque los archivos se renombren, se muevan o se refactoricen.

- **Sí** describir interfaces, tipos y contratos de comportamiento
- **Sí** nombrar tipos específicos, firmas de funciones o formas de configuración que el agente debe buscar o modificar
- **No** referenciar rutas de archivos — se quedan obsoletas
- **No** referenciar números de línea
- **No** asumir que la estructura actual de la implementación seguirá igual

### Conductual, no procedimental

Describir **qué** debe hacer el sistema, no **cómo** implementarlo. El agente explorará el codebase de cero y tomará sus propias decisiones de implementación.

- **Bien:** "El tipo `SkillConfig` debe aceptar un campo opcional `schedule` de tipo `CronExpression`"
- **Mal:** "Abre src/types/skill.ts y añade un campo schedule en la línea 42"
- **Bien:** "Cuando un usuario ejecute `triage` sin argumentos, debe ver un resumen de los issues que necesitan atención"
- **Mal:** "Añade un switch en la función handler principal"

### Criterios de aceptación completos

El agente necesita saber cuándo ha terminado. Todo brief de agente debe tener criterios de aceptación concretos y testeables. Cada criterio debe ser verificable de forma independiente.

- **Bien:** "Ejecutar `gh issue list --label needs-triage` devuelve los issues que han pasado por la clasificación inicial"
- **Mal:** "El triage debe funcionar correctamente"

### Límites de alcance explícitos

Enunciar qué queda fuera del alcance. Esto evita que el agente sobre-pula o haga suposiciones sobre features adyacentes.

## Plantilla

```markdown
## Agent Brief

**Category:** bug / enhancement
**Summary:** descripción de una línea de lo que tiene que pasar

**Current behavior:**
Describir qué pasa ahora. Para bugs, este es el comportamiento roto.
Para enhancements, es el statu quo sobre el que se construye la feature.

**Desired behavior:**
Describir qué debe pasar cuando el trabajo del agente esté completo.
Ser específico sobre casos límite y condiciones de error.

**Key interfaces:**

- `TypeName` — qué debe cambiar y por qué
- Tipo de retorno de `functionName()` — qué devuelve ahora vs qué debería devolver
- Forma de la configuración — cualquier opción de configuración nueva necesaria

**Acceptance criteria:**

- [ ] Criterio específico y testeable 1
- [ ] Criterio específico y testeable 2
- [ ] Criterio específico y testeable 3

**Out of scope:**

- Cosa que NO debe cambiarse ni abordarse en este issue
- Feature adyacente que podría parecer relacionada pero es aparte
```

## Ejemplos

### Buen brief de agente (bug)

```markdown
## Agent Brief

**Category:** bug
**Summary:** El truncado de la descripción del skill corta a mitad de palabra, produciendo salida rota

**Current behavior:**
Cuando la descripción de un skill supera los 1024 caracteres, se trunca
exactamente en 1024 caracteres sin respetar los límites de palabra. Esto
produce descripciones que terminan a mitad de palabra (p. ej. "Usar cuando
el usuario quiera confi").

**Desired behavior:**
El truncado debe cortar en el último límite de palabra antes de los 1024
caracteres y añadir "..." para indicar el truncado.

**Key interfaces:**

- El campo `description` del tipo `SkillMetadata` — no hace falta cambiar
  el tipo, pero la lógica de validación/procesamiento que lo puebla debe
  respetar los límites de palabra
- Cualquier función que lea el frontmatter de SKILL.md y extraiga la descripción

**Acceptance criteria:**

- [ ] Las descripciones de menos de 1024 caracteres quedan sin cambios
- [ ] Las descripciones de más de 1024 caracteres se truncan en el último
      límite de palabra antes de los 1024
- [ ] Las descripciones truncadas terminan en "..."
- [ ] La longitud total incluyendo "..." no supera los 1024 caracteres

**Out of scope:**

- Cambiar el propio límite de 1024 caracteres
- Soporte para descripciones multilínea
```

### Buen brief de agente (enhancement)

```markdown
## Agent Brief

**Category:** enhancement
**Summary:** Añadir soporte del directorio `.out-of-scope/` para registrar peticiones de features rechazadas

**Current behavior:**
Cuando se rechaza una petición de feature, el issue se cierra con la label
`wontfix` y un comentario. No queda registro persistente de la decisión ni
del razonamiento. Peticiones similares futuras exigen que el maintainer
recuerde o busque la discusión previa.

**Desired behavior:**
Las peticiones de features rechazadas deben documentarse en archivos
`.out-of-scope/<concepto>.md` que capturen la decisión, el razonamiento y
enlaces a todos los issues que pidieron la feature. Al triar issues nuevos,
estos archivos deben consultarse en busca de coincidencias.

**Key interfaces:**

- Formato de archivo Markdown en `.out-of-scope/` — cada archivo debe tener
  un encabezado `# Nombre del concepto`, una línea `**Decision:**`, una línea
  `**Reason:**` y una lista `**Prior requests:**` con enlaces a los issues
- El flujo de triage debe leer todos los `.out-of-scope/*.md` temprano
  y contrastar los issues entrantes contra ellos por similitud de concepto

**Acceptance criteria:**

- [ ] Cerrar una feature como wontfix crea/actualiza un archivo en `.out-of-scope/`
- [ ] El archivo incluye la decisión, el razonamiento y el enlace al issue cerrado
- [ ] Si ya existe un archivo `.out-of-scope/` coincidente, el issue nuevo se
      añade a su lista de "Prior requests" en vez de crear un duplicado
- [ ] Durante el triage, los archivos `.out-of-scope/` existentes se consultan
      y se sacan a la superficie cuando un issue nuevo coincide con un rechazo previo

**Out of scope:**

- Coincidencia automatizada (un humano confirma la coincidencia)
- Reabrir features rechazadas anteriormente
- Reportes de bugs (solo los rechazos de enhancements van a `.out-of-scope/`)
```

### Buen brief de agente (PR)

Para una PR, "Current behavior" describe el estado del diff, y el brief pide al agente terminarlo o arreglarlo en vez de construir desde cero.

```markdown
## Agent Brief

**Category:** enhancement
**Summary:** Terminar el flag de salida `--json` del contribuidor para `triage list`

**Current behavior:**
La PR añade un flag `--json` que serializa la lista de issues a JSON. El
happy path funciona y el diff encaja con la estructura de comandos del
proyecto. Quedan dos huecos: los errores aún se imprimen como texto humano
(no JSON), y el flag nuevo no tiene cobertura de tests.

**Desired behavior:**
Con `--json`, toda la salida — incluidos los errores — es JSON bien formado
en stdout, y los exit codes del comando no cambian. La salida legible por
humanos existente queda intacta cuando el flag está ausente.

**Key interfaces:**

- La ruta de error del comando debe emitir `{ "error": string }` bajo `--json`
  en vez del error en texto plano
- Reutilizar el serializador que la PR ya añadió; no introducir un segundo

**Acceptance criteria:**

- [ ] `triage list --json` emite JSON válido tanto en éxito como en error
- [ ] Los exit codes coinciden con el comando sin JSON
- [ ] Un test cubre la salida de éxito de `--json` y un caso de error
- [ ] La salida por defecto (sin JSON) queda idéntica byte a byte

**Out of scope:**

- Añadir `--json` a cualquier otro comando
- Cambiar la forma JSON del payload de éxito que la PR ya definió
```

### Mal brief de agente

```markdown
## Agent Brief

**Summary:** Arreglar el bug del triage

**What to do:**
Lo del triage está roto. Mira el archivo principal y arréglalo.
La función alrededor de la línea 150 tiene el problema.

**Files to change:**

- src/triage/handler.ts (línea 150)
- src/types.ts (línea 42)
```

Esto está mal porque:

- Sin categoría
- Descripción vaga ("lo del triage está roto")
- Referencia rutas de archivos y números de línea que se quedarán obsoletos
- Sin criterios de aceptación
- Sin límites de alcance
- Sin descripción del comportamiento actual vs el deseado
