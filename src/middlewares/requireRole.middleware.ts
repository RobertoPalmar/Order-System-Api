import { UserRole } from "@global/definitions";
import { requestContext } from "@global/requestContext";
import { ErrorResponse } from "@utils/responseHandler.utils";
import { NextFunction, Request, Response } from "express";

export const requireRole = (...allowed: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ctx = requestContext.getStore();
    if (!ctx || ctx.role === undefined) {
      ErrorResponse.UNAUTHORIZED(res);
      return;
    }
    if (!allowed.includes(ctx.role)) {
      ErrorResponse.FORBIDDEN(res);
      return;
    }
    next();
  };
};
