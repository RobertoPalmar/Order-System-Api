import { AsyncLocalStorage } from "node:async_hooks";
import { UserRole } from "./definitions";

export type RequestContext = {
  userID: string;
  role?: UserRole;
  businessUnitID?: string;
};

export const requestContext = new AsyncLocalStorage<RequestContext>();

export const getCurrentContext = (): RequestContext => {
  const ctx = requestContext.getStore();
  if (!ctx) throw new Error("No request context active");
  return ctx;
};

export const requireBusinessUnitID = (): string => {
  const ctx = getCurrentContext();
  if (!ctx.businessUnitID) throw new Error("BusinessUnitID missing in context");
  return ctx.businessUnitID;
};
