import { getIo } from "@realtime/socketServer";
import { OrderDTOOut, OrderDetailDTOOut } from "@models/DTOs/order.DTO";
import { ProductDTOOut } from "@models/DTOs/product.DTO";

// ----------------------------------------------------------------------------
// TYPED REAL-TIME EMITTERS
// ----------------------------------------------------------------------------
// Each function below is the canonical way for a controller (or service) to
// publish an order / product event to subscribed clients. The emitters are
// intentionally pure: they take already-serialized DTOs so the over-the-wire
// payload matches exactly what the HTTP endpoints return.
//
// All events are versioned with a `v1:` prefix so that a breaking change in
// payload shape can ship as `v2:` alongside the old topic until clients
// catch up. Add new events by creating a new `emit*` function — do NOT
// call `io.emit` directly from controllers.
//
// NOTE: controllers do not call these yet. Wiring into the Order lifecycle
// controllers happens in batch S6, which replaces the existing
// `// TODO(S6): emitOrderStatusChanged(...)` markers.
// ----------------------------------------------------------------------------

/**
 * Publish to a single room. Safe against a missing io singleton (test / pre-
 * boot scenarios) and swallows emit errors so a broken socket layer never
 * fails an HTTP request.
 */
function safeEmit(room: string, event: string, payload: unknown): void {
  const io = getIo();
  if (!io) return;
  try {
    io.to(room).emit(event, payload);
  } catch (err) {
    console.log("❌ Socket emit failed:", event, err);
  }
}

/**
 * Collect the set of production area IDs referenced by the details of an
 * order. Used to fan out cocina events to every relevant area room.
 */
function collectAreaIDs(order: OrderDTOOut): Set<string> {
  const areaIDs = new Set<string>();
  for (const d of order.details ?? []) {
    if (d.productionArea?.id) areaIDs.add(d.productionArea.id);
  }
  return areaIDs;
}

/**
 * Fires when a new order is accepted by the API.
 * Rooms: bu:<BU> + every bu:<BU>:area:<areaID> referenced by its details.
 */
export function emitOrderCreated(order: OrderDTOOut, businessUnitID: string): void {
  safeEmit(`bu:${businessUnitID}`, "v1:order:created", order);
  for (const areaID of collectAreaIDs(order)) {
    safeEmit(`bu:${businessUnitID}:area:${areaID}`, "v1:order:created", order);
  }
}

/**
 * Fires on any OrderStatus transition (OPEN -> IN_PREPARATION -> READY ->
 * COMPLETED -> CLOSED / CANCELED).
 * Rooms: bu:<BU> + the owning waiter's personal room.
 */
export function emitOrderStatusChanged(
  order: OrderDTOOut,
  previousStatus: number,
  businessUnitID: string
): void {
  const payload = { order, previousStatus };
  safeEmit(`bu:${businessUnitID}`, "v1:order:status_changed", payload);
  if (order.owner?.id) {
    safeEmit(
      `bu:${businessUnitID}:user:${order.owner.id}`,
      "v1:order:status_changed",
      payload
    );
  }
}

/**
 * Fires when a line item is appended to an existing order.
 * Rooms: bu:<BU> + bu:<BU>:area:<areaID> for the detail's production area.
 *
 * `detailID` is the mongo sub-document _id of the freshly inserted detail —
 * the DTO itself does not carry an id field. Controllers should pull this
 * from the saved order (`order.details[order.details.length-1]._id`).
 */
export function emitOrderItemAdded(
  order: OrderDTOOut,
  detailID: string,
  detail: OrderDetailDTOOut,
  businessUnitID: string
): void {
  const payload = { orderID: order.id, detailID, detail };
  safeEmit(`bu:${businessUnitID}`, "v1:order:item_added", payload);
  if (detail.productionArea?.id) {
    safeEmit(
      `bu:${businessUnitID}:area:${detail.productionArea.id}`,
      "v1:order:item_added",
      payload
    );
  }
}

/**
 * Fires when a line item is removed from an order.
 * Rooms: bu:<BU> + (optional) bu:<BU>:area:<areaID> if the caller knows the
 * area the removed item belonged to.
 */
export function emitOrderItemRemoved(
  orderID: string,
  detailID: string,
  businessUnitID: string,
  areaID?: string
): void {
  const payload = { orderID, detailID };
  safeEmit(`bu:${businessUnitID}`, "v1:order:item_removed", payload);
  if (areaID) {
    safeEmit(`bu:${businessUnitID}:area:${areaID}`, "v1:order:item_removed", payload);
  }
}

/**
 * Fires when cocina o mesero cambia el estado de un ítem (PENDING ->
 * IN_PREPARATION -> READY -> DELIVERED / CANCELED).
 * Rooms: bu:<BU> + la owner room del mesero.
 */
export function emitOrderItemStatusChanged(
  order: OrderDTOOut,
  detailID: string,
  detail: OrderDetailDTOOut,
  previousStatus: number,
  businessUnitID: string
): void {
  const payload = { orderID: order.id, detailID, detail, previousStatus };
  safeEmit(`bu:${businessUnitID}`, "v1:order:item_status_changed", payload);
  if (order.owner?.id) {
    safeEmit(
      `bu:${businessUnitID}:user:${order.owner.id}`,
      "v1:order:item_status_changed",
      payload
    );
  }
}

/**
 * Fires when `Product.isAvailable` is toggled via PATCH
 * /Products/:id/availability. Rooms: bu:<BU>.
 */
export function emitProductAvailabilityChanged(
  product: ProductDTOOut,
  businessUnitID: string
): void {
  safeEmit(`bu:${businessUnitID}`, "v1:product:availability_changed", product);
}
