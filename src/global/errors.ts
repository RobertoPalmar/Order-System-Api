// TYPED ERROR HIERARCHY
// Controllers throw these instead of calling ErrorResponse.* directly. The
// global errorHandler middleware (src/middlewares/errorHandler.middleware.ts)
// catches them via `instanceof` and maps them to the project's standard
// response envelope through ErrorResponse.*.
//
// The `kind` discriminator survives `JSON.stringify` and structured logs even
// when prototype chains are lost (e.g. across async boundaries or when thrown
// objects are re-wrapped). The middleware still prefers `instanceof` checks
// for type-narrowing.

export class AppError extends Error {
  constructor(
    public readonly kind: string,
    message: string,
    public readonly field?: string,
  ) {
    super(message);
    this.name = kind;
    // Preserve prototype chain across TS transpile targets that lose it
    // (needed for reliable `instanceof` when class extends Error on ES5).
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// 404 — resource does not exist (or is out of tenant scope).
export class NotFoundError extends AppError {
  constructor(public readonly resource: string) {
    super("NotFoundError", `${resource} not found`);
  }
}

// 403 — caller is authenticated but not allowed to perform the action.
export class ForbiddenError extends AppError {
  constructor(reason?: string) {
    super("ForbiddenError", reason ?? "Forbidden");
  }
}

// 409-equivalent — the request conflicts with current state (duplicate,
// stale version, business invariant). The project response envelope has no
// dedicated CONFLICT code yet, so this maps to DUPLICATE_FIELD / INVALID_FIELD
// in the handler depending on whether a field is known.
export class ConflictError extends AppError {
  constructor(message: string, field?: string) {
    super("ConflictError", message, field);
  }
}

// 400 — the request payload is structurally valid but semantically wrong for
// one specific field (e.g. enum value out of range, ID does not resolve to a
// referenced entity). Use class-validator + validateBody for generic DTO
// shape errors — this is for business-rule field errors discovered later in
// the controller.
export class BadRequestError extends AppError {
  constructor(field: string, message?: string) {
    super("BadRequestError", message ?? `Invalid field: ${field}`, field);
  }
}
