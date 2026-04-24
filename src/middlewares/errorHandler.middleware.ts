import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { ValidationError as ClassValidatorError } from "class-validator";
import {
  AppError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "@global/errors";
import { ErrorResponse } from "@utils/responseHandler.utils";

// MONGO DUPLICATE KEY ERROR
// mongoose wraps the native driver's E11000. Node's mongodb driver exposes
// `code === 11000` and a `keyPattern` map of the offending index fields.
type MongoDuplicateKeyError = Error & {
  code: number;
  keyPattern?: Record<string, number>;
  keyValue?: Record<string, unknown>;
};

const isDuplicateKeyError = (err: unknown): err is MongoDuplicateKeyError =>
  typeof err === "object" &&
  err !== null &&
  (err as { code?: number }).code === 11000;

// CLASS-VALIDATOR ERROR ARRAY
// `validateBody` catches these before they reach here, but if a controller
// runs `validate()` inline on a nested DTO and throws the result, we still
// recognise the shape.
const isClassValidatorErrorArray = (
  err: unknown
): err is ClassValidatorError[] =>
  Array.isArray(err) &&
  err.length > 0 &&
  err[0] instanceof ClassValidatorError;

// RESPONSE ALREADY SENT GUARD
// If a downstream handler already wrote the response before throwing, we
// cannot overwrite headers — just delegate to Express's default finaliser so
// the socket is closed cleanly.
const headersAlreadySent = (res: Response, err: unknown): boolean => {
  if (!res.headersSent) return false;
  console.log("❌ Error handler (headers already sent):", err);
  return true;
};

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  // next kept for Express to recognise this as the 4-arg error middleware.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  if (headersAlreadySent(res, err)) return;

  //STRUCTURED LOG
  const logPayload = {
    method: req.method,
    path: req.path,
    name: err instanceof Error ? err.name : typeof err,
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
    userID: req.headers["userID"],
    businessUnitID: req.headers["businessUnitID"],
  };
  console.log("❌ Error handler:", logPayload);

  //APP ERRORS (typed hierarchy from @global/errors)
  if (err instanceof NotFoundError) {
    ErrorResponse.NOT_FOUND(res, err.resource);
    return;
  }
  if (err instanceof ForbiddenError) {
    ErrorResponse.FORBIDDEN(res, err.message);
    return;
  }
  if (err instanceof BadRequestError) {
    // BadRequestError always carries a `field`.
    ErrorResponse.INVALID_FIELD(res, err.field ?? "unknown", err.message);
    return;
  }
  if (err instanceof ConflictError) {
    // NOTE: responseHandler has no dedicated CONFLICT code. We approximate:
    //   - if the conflict is about a specific field → DUPLICATE_FIELD (4005)
    //   - otherwise → INVALID_FIELD (4003) with the conflict message
    if (err.field) {
      ErrorResponse.DUPLICATE_FIELD(res, err.field);
    } else {
      ErrorResponse.INVALID_FIELD(res, "request", err.message);
    }
    return;
  }
  if (err instanceof AppError) {
    // Any future AppError subclass not handled above falls back here.
    ErrorResponse.UNEXPECTED_ERROR(res);
    return;
  }

  //MONGOOSE CAST ERROR (bad ObjectId, type coercion fail)
  if (err instanceof mongoose.Error.CastError) {
    ErrorResponse.INVALID_FIELD(res, err.path, `invalid ${err.kind}`);
    return;
  }

  //MONGOOSE VALIDATION ERROR (schema-level validators)
  if (err instanceof mongoose.Error.ValidationError) {
    const firstField = Object.keys(err.errors)[0] ?? "unknown";
    const firstMessage = err.errors[firstField]?.message;
    ErrorResponse.INVALID_FIELD(res, firstField, firstMessage);
    return;
  }

  //MONGOOSE DOCUMENT NOT FOUND (e.g. findOneAndUpdate with orFail())
  if (err instanceof mongoose.Error.DocumentNotFoundError) {
    ErrorResponse.NOT_FOUND(res, "Entity");
    return;
  }

  //MONGO DUPLICATE KEY (unique index violation)
  if (isDuplicateKeyError(err)) {
    const field = err.keyPattern ? Object.keys(err.keyPattern)[0] : undefined;
    if (field) {
      ErrorResponse.DUPLICATE_FIELD(res, field);
    } else {
      ErrorResponse.INVALID_FIELD(res, "unknown", "duplicate key");
    }
    return;
  }

  //CLASS-VALIDATOR ERRORS LEAKED PAST validateBody
  if (isClassValidatorErrorArray(err)) {
    const errorList = err
      .map((e) => Object.values(e.constraints || {}))
      .flat();
    ErrorResponse.VALIDATION_ERROR(res, errorList);
    return;
  }

  //DEFAULT — unknown error
  ErrorResponse.UNEXPECTED_ERROR(res);
};
