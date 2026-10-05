# Cuándo mockear

Mockear solo en los **límites del sistema**:

- APIs externas (pagos, email, etc.)
- Bases de datos (a veces — preferir una DB de test)
- Tiempo/aleatoriedad
- Filesystem (a veces)

No mockear:

- Tus propias clases/módulos
- Colaboradores internos
- Nada que controles

## Diseñar para la mockeabilidad

En los límites del sistema, diseñar interfaces fáciles de mockear:

**1. Usar inyección de dependencias**

Pasar las dependencias externas desde fuera en vez de crearlas internamente:

```typescript
// Fácil de mockear
function processPayment(order, paymentClient) {
  return paymentClient.charge(order.total);
}

// Difícil de mockear
function processPayment(order) {
  const client = new StripeClient(process.env.STRIPE_KEY);
  return client.charge(order.total);
}
```

**2. Preferir interfaces estilo SDK sobre fetchers genéricos**

Crear funciones específicas para cada operación externa en vez de una función genérica con lógica condicional:

```typescript
// BIEN: Cada función es mockeable de forma independiente
const api = {
  getUser: (id) => fetch(`/users/${id}`),
  getOrders: (userId) => fetch(`/users/${userId}/orders`),
  createOrder: (data) => fetch("/orders", { method: "POST", body: data }),
};

// MAL: Mockear exige lógica condicional dentro del mock
const api = {
  fetch: (endpoint, options) => fetch(endpoint, options),
};
```

El enfoque SDK significa:

- Cada mock devuelve una forma específica
- Sin lógica condicional en el setup de los tests
- Es más fácil ver qué endpoints ejercita un test
- Type safety por endpoint
