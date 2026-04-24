# Socket.IO real-time events — Commander System API

This document is the contract between the API and the mobile client
(waiter, kitchen, admin) for push events. If you add or change an event,
update this file in the same commit.

## Connection

- **URL**: same host/port as the REST API. In local dev that is
  `http://localhost:3000` (or whatever `PORT` is set to in `.env`). The
  Socket.IO handshake upgrades over the existing HTTP server — there is no
  second port.
- **Protocol**: Socket.IO v4. Any v4-compatible client library works
  (`socket.io-client` for JS/RN, `socket_io_client` for Dart/Flutter, etc.).
- **Transports**: default (polling then upgrade to websocket). Do NOT
  force-disable polling on the client unless you are 100% sure the target
  environment supports websocket natively.
- **CORS**: origin is matched against the `CORS_ORIGINS` env var (same
  whitelist the REST layer uses). Native mobile apps that do not send an
  `Origin` header are allowed through.

### Authentication

Every connection MUST provide a **BUSINESS** access token (the one issued
by `POST /Auth/signInBussinesUnit/:businessUnitID`, claim `type =
"business-access"`). User-level access tokens are rejected.

Two equivalent ways to pass the token:

```ts
// RECOMMENDED — handshake auth payload
import { io } from "socket.io-client";
const socket = io("http://localhost:3000", {
  auth: { token: businessAccessToken },
});

// ALTERNATIVE — Authorization header
const socket = io("http://localhost:3000", {
  extraHeaders: { Authorization: `Bearer ${businessAccessToken}` },
});
```

The server-side middleware validates JWT signature + expiry and, on
success, attaches `{ userID, role, businessUnitID }` to the connection.

If any of the following fails, `connect_error` fires on the client with
the reason string:

- `Missing token` — neither `auth.token` nor `Authorization` provided.
- `Expired token` — JWT past its `exp`.
- `Invalid token` — signature mismatch or malformed JWT.
- `Invalid token type (business-access required)` — user-access or refresh
  token supplied instead.
- `Invalid business token payload` — token is missing `userID` or
  `businessUnitID` claims.

When the business token expires the client must obtain a fresh one via
the refresh-token flow and reconnect (`socket.auth.token = ...; socket.connect()`).

## Room model

Rooms are server-side membership lists used to fan out events. A single
socket can belong to many rooms at once.

| Room | Membership | Purpose |
|---|---|---|
| `bu:<businessUnitID>` | auto-joined at connect | Tenant-wide broadcast. Every connected client for that business receives these events. |
| `bu:<businessUnitID>:user:<userID>` | auto-joined at connect | Personal channel. Used to nudge the waiter that owns a specific order. |
| `bu:<businessUnitID>:area:<areaID>` | opt-in via `subscribe:area` | Kitchen / production-area channel. A user can handle multiple areas simultaneously by subscribing to each. |

### Client control events

| Event (client → server) | Payload | Effect |
|---|---|---|
| `subscribe:area` | `areaID: string` (24-char hex Mongo id) | Joins `bu:<BU>:area:<areaID>`. Invalid ids are silently ignored. |
| `unsubscribe:area` | `areaID: string` | Leaves the same room. |

Example — the kitchen screen subscribes on mount, unsubscribes on unmount:

```ts
useEffect(() => {
  socket.emit("subscribe:area", areaID);
  return () => socket.emit("unsubscribe:area", areaID);
}, [areaID]);
```

## Events (server → client)

All events are prefixed with a protocol version (`v1:`). A breaking change
in payload shape will ship as a new prefix (`v2:`) alongside the old topic
for one release window before the old one is removed.

| Event | Payload | Emitted on | Rooms |
|---|---|---|---|
| `v1:order:created` | `OrderDTOOut` | New order accepted by `POST /Orders/createOrder`. | `bu:<BU>` + every `bu:<BU>:area:<areaID>` referenced by a detail. |
| `v1:order:status_changed` | `{ order: OrderDTOOut, previousStatus: number }` | `PATCH /Orders/:id/status` (OPEN → IN_PREPARATION → READY → COMPLETED → CLOSED / CANCELED). | `bu:<BU>` + `bu:<BU>:user:<owner.id>` |
| `v1:order:item_added` | `{ orderID: string, detailID: string, detail: OrderDetailDTOOut }` | `POST /Orders/:id/items`. | `bu:<BU>` + `bu:<BU>:area:<detail.productionArea.id>` if set. |
| `v1:order:item_removed` | `{ orderID: string, detailID: string }` | `DELETE /Orders/:id/items/:itemId`. | `bu:<BU>` + `bu:<BU>:area:<areaID>` if the server knew the area. |
| `v1:order:item_status_changed` | `{ orderID: string, detailID: string, detail: OrderDetailDTOOut, previousStatus: number }` | `PATCH /Orders/:id/items/:itemId/status` (cocina mueve el ítem). | `bu:<BU>` + `bu:<BU>:user:<owner.id>` |
| `v1:product:availability_changed` | `ProductDTOOut` | `PATCH /Products/:id/availability` (o el endpoint equivalente de toggle). | `bu:<BU>` |

Payload shapes are the exact DTOs returned by the corresponding REST
endpoints — `src/models/DTOs/order.DTO.ts` and `src/models/DTOs/product.DTO.ts`
are the source of truth. Consumers should reuse those type definitions
rather than redefining them on the client.

### Status / ItemStatus enums

`previousStatus` (and the current `order.status` / `detail.itemStatus`
fields inside the payload) are numeric enums defined in
`src/global/definitions.ts`. Mobile clients must translate the numbers
into user-facing labels — the server does not send pretty strings.

## Example — full client wiring (TypeScript)

```ts
import { io, Socket } from "socket.io-client";
import type { OrderDTOOut, OrderDetailDTOOut } from "./types";

const socket: Socket = io(API_BASE_URL, {
  auth: { token: getBusinessAccessToken() },
  reconnection: true,
  reconnectionAttempts: Infinity,
});

socket.on("connect", () => console.log("Socket connected", socket.id));
socket.on("connect_error", (err) => console.warn("Socket error:", err.message));

// Global listeners — the mesero dashboard and the kitchen screen can
// both register these; rooms already narrow the fan-out server-side.
socket.on("v1:order:created", (order: OrderDTOOut) => {
  store.orders.upsert(order);
});
socket.on(
  "v1:order:status_changed",
  (p: { order: OrderDTOOut; previousStatus: number }) => {
    store.orders.upsert(p.order);
  }
);
socket.on(
  "v1:order:item_added",
  (p: { orderID: string; detailID: string; detail: OrderDetailDTOOut }) => {
    store.orders.appendDetail(p.orderID, p.detailID, p.detail);
  }
);
socket.on(
  "v1:order:item_removed",
  (p: { orderID: string; detailID: string }) => {
    store.orders.removeDetail(p.orderID, p.detailID);
  }
);
socket.on(
  "v1:order:item_status_changed",
  (p: {
    orderID: string;
    detailID: string;
    detail: OrderDetailDTOOut;
    previousStatus: number;
  }) => {
    store.orders.patchDetail(p.orderID, p.detailID, p.detail);
  }
);
socket.on("v1:product:availability_changed", (product) => {
  store.products.upsert(product);
});

// Area subscription — only from the kitchen screen
function openKitchen(areaID: string) {
  socket.emit("subscribe:area", areaID);
}
function closeKitchen(areaID: string) {
  socket.emit("unsubscribe:area", areaID);
}
```

## Reliability notes

- **At-most-once delivery**: Socket.IO does not persist events. A client
  that reconnects after a dropped connection must refresh its state via
  the REST endpoints (e.g. `GET /Orders/getActiveOrders`) — do not rely on
  socket events alone to build the initial snapshot.
- **Emit safety**: when the socket server is not initialized (tests, early
  boot) the server-side emitters no-op. No HTTP request will fail because
  of a broken real-time layer.
- **Ordering**: events are delivered in the order they are emitted per
  socket, but the server does not coordinate order across rooms. Clients
  should treat `previousStatus` / optimistic updates as authoritative on
  transitions.
