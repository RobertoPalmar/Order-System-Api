// ORDER + ITEM STATE MACHINE
// Enforces valid transitions between OrderStatus values (order-level) and
// ItemStatus values (per line item). Controllers call the assert* helpers
// before mutating state; invalid transitions raise BadRequestError which the
// global errorHandler maps to the standard response envelope.
//
// The OrderStatus / ItemStatus enums are defined in @global/definitions as
// NUMERIC enums (to stay compatible with existing documents in Mongo, where
// `status` is stored as a Number). This file re-exports them so callers can
// import the enum + the transition map from a single place.

import { BadRequestError } from "@global/errors";
import { ItemStatus, OrderStatus } from "@global/definitions";

export { OrderStatus, ItemStatus };

// ORDER-LEVEL TRANSITIONS
// PENDING  -> CREATED | CANCELLED
// CREATED  -> IN_PROGRESS | CANCELLED
// IN_PROGRESS -> COMPLETED | CANCELLED
// COMPLETED -> CLOSED
// CLOSED / CANCELLED are terminal
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CREATED, OrderStatus.CANCELLED],
  [OrderStatus.CREATED]: [OrderStatus.IN_PROGRESS, OrderStatus.CANCELLED],
  [OrderStatus.IN_PROGRESS]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
  [OrderStatus.COMPLETED]: [OrderStatus.CLOSED],
  [OrderStatus.CLOSED]: [],
  [OrderStatus.CANCELLED]: [],
};

// ITEM-LEVEL TRANSITIONS
// PENDING   -> IN_PREP | CANCELLED
// IN_PREP   -> READY | CANCELLED
// READY     -> DELIVERED
// DELIVERED / CANCELLED are terminal
export const ITEM_TRANSITIONS: Record<ItemStatus, ItemStatus[]> = {
  [ItemStatus.PENDING]: [ItemStatus.IN_PREP, ItemStatus.CANCELLED],
  [ItemStatus.IN_PREP]: [ItemStatus.READY, ItemStatus.CANCELLED],
  [ItemStatus.READY]: [ItemStatus.DELIVERED],
  [ItemStatus.DELIVERED]: [],
  [ItemStatus.CANCELLED]: [],
};

/**
 * Pure predicate — returns true when `to` is a legal next state from `from`
 * according to `map`. Does not throw.
 */
export function canTransition<T extends number | string>(
  map: Record<any, T[]>,
  from: T,
  to: T
): boolean {
  const next = map[from as any];
  return Array.isArray(next) && next.includes(to);
}

/**
 * Throws BadRequestError("status") when the transition is not allowed.
 * Use this in controllers right before persisting a status change.
 */
export function assertOrderTransition(
  from: OrderStatus,
  to: OrderStatus
): void {
  if (!canTransition(ORDER_TRANSITIONS, from, to)) {
    throw new BadRequestError(
      "status",
      `Invalid order transition from ${OrderStatus[from] ?? from} to ${
        OrderStatus[to] ?? to
      }`
    );
  }
}

/**
 * Throws BadRequestError("itemStatus") when the item-level transition is not
 * allowed. Use this in controllers before mutating an order detail's status.
 */
export function assertItemTransition(from: ItemStatus, to: ItemStatus): void {
  if (!canTransition(ITEM_TRANSITIONS, from, to)) {
    throw new BadRequestError(
      "itemStatus",
      `Invalid item transition from ${ItemStatus[from] ?? from} to ${
        ItemStatus[to] ?? to
      }`
    );
  }
}
