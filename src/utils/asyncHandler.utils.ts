import { Request, Response, NextFunction, RequestHandler } from "express";

// ASYNC HANDLER
// Wraps an async Express handler so any rejected promise (or synchronous
// throw) is forwarded to `next(err)` and caught by the global error handler
// middleware. Lets new controllers skip the boilerplate try/catch block and
// just throw typed errors from @global/errors.
//
// Usage:
//   router.get("/foo", asyncHandler(async (req, res) => {
//     const entity = await repo.findById(req.params.id);
//     if (!entity) throw new NotFoundError("Foo");
//     SuccessResponse.GET(res, mapperHub.fooMapper.toDTO(entity));
//   }));
export const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
