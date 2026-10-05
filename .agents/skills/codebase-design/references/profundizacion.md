# Profundización

Cómo profundizar con seguridad un cluster de módulos superficiales, dadas sus dependencias. Asume el vocabulario de [SKILL.md](../SKILL.md) — **módulo**, **interface**, **seam**, **adapter**.

## Categorías de dependencias

Al evaluar un candidato a profundización, clasificar sus dependencias. La categoría determina cómo se testea el módulo profundizado a través de su seam.

### 1. In-process

Cálculo puro, estado en memoria, sin I/O. Siempre profundizable — fusionar los módulos y testear directamente a través de la nueva interface. No se necesita adapter.

### 2. Sustituible en local

Dependencias que tienen sustitutos locales de test (PGLite para Postgres, filesystem en memoria). Profundizable si el sustituto existe. El módulo profundizado se testea con el sustituto corriendo en la suite de tests. El seam es interno; no hay port en la interface externa del módulo.

### 3. Remota pero propia (Ports & Adapters)

Servicios propios al otro lado de un límite de red (microservicios, APIs internas). Definir un **port** (interface) en el seam. El módulo profundo es dueño de la lógica; el transporte se inyecta como **adapter**. Los tests usan un adapter en memoria. Producción usa un adapter HTTP/gRPC/cola.

Forma de la recomendación: _"Definir un port en el seam, implementar un adapter HTTP para producción y un adapter en memoria para testing, de modo que la lógica viva en un solo módulo profundo aunque esté desplegada a través de una red."_

### 4. Externa real (Mock)

Servicios de terceros (Stripe, Twilio, etc.) que no controlas. El módulo profundizado recibe la dependencia externa como un port inyectado; los tests aportan un mock adapter.

## Disciplina de seams

- **Un adapter significa un seam hipotético. Dos adapters significan uno real.** No introducir un port a menos que se justifiquen al menos dos adapters (típicamente producción + test). Un seam de un solo adapter es pura indirección.
- **Seams internos vs seams externos.** Un módulo profundo puede tener seams internos (privados de su implementación, usados por sus propios tests) además del seam externo en su interface. No exponer seams internos a través de la interface solo porque los tests los usen.

## Estrategia de testing: reemplazar, no envolver

- Los tests unitarios viejos sobre módulos superficiales se vuelven desperdicio en cuanto existen tests en la interface del módulo profundizado — eliminarlos.
- Escribir tests nuevos en la interface del módulo profundizado. La **interface es la superficie de test**.
- Los tests hacen aserciones sobre resultados observables a través de la interface, no sobre estado interno.
- Los tests deben sobrevivir refactors internos — describen comportamiento, no implementación. Si un test tiene que cambiar cuando cambia la implementación, está testeando más allá de la interface.
