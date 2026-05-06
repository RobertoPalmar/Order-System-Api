# Sistema de Comandas — Design Brief

> Documento pensado para entregárselo a **Claude Design** (o cualquier diseñador UI/UX) y obtener un diseño visual + flujos coherentes con el backend ya construido.

---

## 1. Resumen del producto

**Sistema de Comandas** es un SaaS multi-tenant para restaurantes / bares / food-trucks que gestiona el ciclo de vida completo de una orden: desde que el mesero la toma en una mesa, pasando por cocina, hasta el cobro y cierre.

- **Backend ya existe:** API REST en TypeScript/Express + MongoDB (replica set), versionada bajo `/v1`, con OpenAPI en `/docs`.
- **Multi-tenant:** un `User` puede pertenecer a varias `BusinessUnit` (negocios). Cada operación está scopeada al negocio activo.
- **Cliente esperado:** app **mobile-first** (mesero en piso) + vistas tablet (cocina / barra) + panel admin web (gerencia / dueño). Aún **no existe ningún cliente** — eso es lo que hay que diseñar.

---

## 2. Roles de usuario (UserRole)

| Rol | Quién es | Qué hace en la app |
|---|---|---|
| `ADMIN` | Dueño / gerente | Configura el negocio (productos, categorías, áreas, monedas, usuarios). Ve reportes. Cierra órdenes. |
| `ANFITRION` | Host / encargado de turno | Asigna mesas, abre/cierra órdenes, cobra, gestiona personal en piso. |
| `WAITER` | Mesero | Toma órdenes en mesa, agrega/quita ítems, marca entregas. |
| `PREP_COOK` | Cocinero / barista | Ve la cola de ítems de su área de producción y los marca `IN_PREP` → `READY`. |

Hay además un `isSuperAdmin` (acceso global, fuera del scope de tenant) — pensar solo una vista mínima de operación.

---

## 3. Modelo de dominio (entidades)

### BusinessUnit
Negocio / sucursal. Toda data está scopeada por aquí.
- `name`, `description`, `owner` (User).

### User + Membership
Un User existe globalmente; su pertenencia y rol en un negocio se definen vía `Membership` (User ↔ BusinessUnit + role).

### Category
Agrupador de productos (Bebidas, Entradas, Platos fuertes, Postres…).

### Product
Lo que se vende. `name`, `description`, `image`, `price`, `cost`, `currency`, `category`, `components[]` (ingredientes / modificadores), `productArea` (a qué área de producción se manda), `status` (activo/inactivo).

### Component
Ingrediente o "extra" (queso extra, sin cebolla, salsa picante…). Puede tener costo extra opcional.

### ProductionArea
Estación de preparación: Cocina, Parrilla, Barra, Postres. Cada Product se rutea a una. Cada item de orden hereda esa área para mostrarse en el KDS correcto.

### Currency
Multi-moneda con tasa de cambio. Una `main` por negocio.

### Customer
Cliente final (opcional en cada orden). `firstName`, `lastName`, `documentID`, `email`, `phone`.

### Order (núcleo del producto)
Snapshot-based: al crearse, embebe copias mínimas de customer/owner/currency/product/component (no joins en lectura). Campos clave:
- `code` (autoincremental humano), `description`, `notes`
- `status` (ver §4), `type` (`DINE_IN` | `TAKE_AWAY` | `DELIVERY`)
- `tableNumber`, `partySize` (sólo dine-in)
- `details[]` — ítems de la orden, cada uno con: `product`, `quantity`, `unitPrice`, `totalPrice`, `extras[]` (componentes añadidos), `removed[]` (componentes quitados), `notes`, `itemStatus`, `productionArea`
- `amount`, `discountAmount`, `tipAmount`
- `paymentMethod` (`cash` | `card` | `transfer`), `paidAt`, `closedAt`
- `owner` (mesero), `customer` (opcional)

---

## 4. Máquinas de estado

### OrderStatus
`PENDING → CREATED → IN_PROGRESS → COMPLETED → CLOSED`
(con `CANCELLED` como terminal alterno)

- **PENDING / CREATED:** mesero está armando la orden, aún no se manda a cocina.
- **IN_PROGRESS:** cocina/barra trabajando.
- **COMPLETED:** todos los items entregados, falta cobrar.
- **CLOSED:** cobrada y cerrada (con `paymentMethod` + `paidAt`).
- **CANCELLED:** anulada.

### ItemStatus (por cada `details[i]`)
`PENDING → IN_PREP → READY → DELIVERED` (+ `CANCELLED`)

El estado de la orden se deriva del agregado de los items. Cada área de producción solo ve y mueve sus propios items.

---

## 5. Endpoints relevantes (para mapear a pantallas)

Base: `/v1`. Todos requieren `validateBusinessAuth` (Bearer JWT con `businessUnitID`).

**Auth:** `POST /Auth/signIn`, `POST /Auth/signInBussinesUnit/:id`, `POST /Auth/refresh`.
**Orders:**
- `GET /Orders/getAllOrders` — feed general
- `GET /Orders/getOrdersBy?status=&type=&tableNumber=` — filtros
- `GET /Orders/byTable/:tableNumber` — vista mesa
- `GET /Orders/byProductionArea/:areaID` — KDS de una estación
- `POST /Orders/createOrder`
- `PATCH /Orders/changeOrderStatus/:id`
- `POST /Orders/addItem/:id` / `DELETE /Orders/removeItem/:id/:detailID`
- `PATCH /Orders/updateItemStatus/:id/:detailID` — el botón que toca el cocinero
- `PATCH /Orders/closeOrder/:id` — selecciona método de pago + cierra

**CRUD para admin:** `Products`, `Categories`, `Components`, `Currencies`, `ProductionAreas`, `Customers`, `Users`, `BusinessUnit`, `Memberships`.

> Hay sockets planeados para tiempo real (notificar a cocina cuando entra item nuevo, notificar al mesero cuando un item está `READY`). Diseñar pensando en updates push, no polling.

---

## 6. Superficies a diseñar (lo que necesito de Claude Design)

### A) App Mesero (mobile-first, una mano)
1. **Login** → selector de BusinessUnit (si pertenece a varias).
2. **Mapa/lista de mesas** — estado por color (libre, ocupada, lista para cobrar, sucia).
3. **Tomar orden:**
   - selector de mesa + party size
   - catálogo de productos (grid con imagen, agrupado por categoría, búsqueda)
   - configuración de item: cantidad, agregar `extras` (componentes), quitar `removed`, notas
   - resumen en sidebar/bottom-sheet con total
4. **Detalle de orden activa:** lista de items con su `itemStatus` (badge), poder agregar más items o cancelar items, ver notas de cocina.
5. **Notificaciones push in-app** "Mesa 7 — Pasta lista para llevar".

### B) KDS — Kitchen Display System (tablet, landscape)
- Vista por `ProductionArea`. Tarjetas tipo Kanban: `PENDING | IN_PREP | READY`.
- Cada tarjeta = un item: producto, cantidad, extras, removidos, notas, mesa de origen, tiempo transcurrido (timer).
- Tap para avanzar estado. Diseño legible a distancia, alto contraste, color por urgencia (>10 min en `IN_PREP` = warning).

### C) Anfitrión / Caja (tablet o desktop)
- Dashboard de mesas + órdenes activas en tiempo real.
- Flujo de **cierre/cobro**: ver orden, aplicar `discountAmount`/`tipAmount`, elegir `paymentMethod`, confirmar `CLOSED`.
- Reabrir / cancelar / reasignar mesero.

### D) Panel Admin (desktop)
- CRUD de: Productos (con upload de imagen), Categorías, Componentes, Áreas de producción, Monedas, Clientes, Usuarios y Memberships.
- Configuración del negocio (BusinessUnit).
- Reportes básicos: ventas por día, por mesero, por categoría, por método de pago. (El backend aún no tiene endpoints de reportes → diseñar pensando que vendrán; mostrar el "lugar" donde irán.)

### E) Onboarding / Selección de negocio
- Login global → si tiene >1 membership, picker visual de BusinessUnit.
- Indicador siempre visible del negocio activo + posibilidad de switch.

---

## 7. Requerimientos de UX a respetar

- **Idioma:** UI principal en **español** (es-LA), con copy claro para personal no técnico.
- **Mobile-first** para mesero (uso con una mano, golpeada por luz exterior, dedos sucios → targets ≥ 48px, alto contraste).
- **Tablet horizontal** para KDS y caja.
- **Offline-tolerante:** la red en restaurantes falla. Diseñar estados de "reintentando", cola de acciones pendientes, indicador de sincronización.
- **Tiempos largos:** una orden puede vivir 2h. Mostrar siempre el tiempo desde apertura.
- **Multi-moneda visible:** mostrar símbolo + ISO cuando haya conversión.
- **Roles:** ocultar/deshabilitar acciones que el rol no puede ejecutar (no esconderlas con error después).

---

## 8. Sistema visual sugerido (a definir por el diseñador)

Lo que pido a Claude Design que entregue:

1. **Design tokens:** paleta (sugerido: un primario cálido tipo restaurante + neutros + semánticos para los 5 estados de orden y 5 de item), tipografía (legible a 1m de distancia en KDS), spacing, radii, sombras, motion.
2. **Componentes base:** Button, Input, Select, Card, Badge (status), Modal/Sheet, Toast, Tab, EmptyState, Skeleton.
3. **Componentes de dominio:** TableCard, OrderCard, OrderItemRow, ProductCard (catálogo), KDSCard, PaymentSummary, CurrencyAmount.
4. **Patrones:** navegación por rol (bottom-nav mesero / sidebar admin), feedback de acciones críticas (cobrar, cancelar), diseño de estados vacíos / error / cargando.
5. **Pantallas clave (high-fi):** las 5 superficies de §6, mínimo 2 pantallas cada una, en mobile y/o tablet según corresponda.
6. **Flujos (user flows):** "tomar una orden completa", "cobrar y cerrar", "cocinar items en KDS", "alta de producto desde admin".
7. **Modo oscuro** para KDS (entorno de cocina iluminado fuerte) y opcional en el resto.

---

## 9. Restricciones técnicas que afectan el diseño

- Las imágenes de producto se sirven desde `/static/...` (uploads locales). Diseñar pensando en **placeholder cuando no hay imagen** (muchos productos no tendrán foto al inicio).
- El `code` de orden es legible (ej. `ORD-000123`) — usar como identificador visible al cliente y al cocinero.
- Los `details` de la orden guardan **snapshot** del producto/componente. El precio mostrado en una orden vieja es el del momento de creación, no el actual → no confundir al usuario si edita el producto luego.
- `extras` y `removed` se muestran como modificadores en el ticket de cocina (importante para KDS).
- Rate limit: 100 req/min por usuario → no hacer pantallas que disparen polling agresivo; preferir push/socket.

---

## 10. Lo que NO hay que diseñar (out of scope)

- Integraciones con impresoras fiscales / facturación electrónica.
- Módulo de inventario / stock (los `Component` aún no descuentan stock).
- Delivery tracking / mapa de repartidores.
- Programa de fidelidad / cupones.

---

## 11. Entregable esperado

Un set Figma (o equivalente) con:
1. Foundations + tokens.
2. Librería de componentes (base + dominio).
3. Las 5 superficies de §6 con sus pantallas clave en alta fidelidad.
4. Al menos 1 user flow completo navegable (prototipo): "mesero abre orden → cocina la prepara → caja cobra y cierra".
5. Notas de handoff para implementación en React/React Native.

---

**Contexto adicional disponible si lo necesitas:** OpenAPI completo en `/docs` del API corriendo, modelos en `Api/src/models/database/`, enums y constantes en `Api/src/global/definitions.ts`.
