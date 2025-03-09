import { ErrorResponse } from "@utils/responseHandler.utils";
import TokenUtils from "@utils/Token.utils";
import { NextFunction, Request, Response } from "express";

export const validateAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeaders = req.headers.authorization;
  const authToken = authHeaders?.split(' ')[1];

  if(authToken == null){
    ErrorResponse.MISSING_TOKEN(res);
    return;
  }

  const {decoded, expired} = TokenUtils.verifyToken(authToken);
  
  if(expired){
    ErrorResponse.EXPIRED_TOKEN(res);
    return;
  }

  if(decoded == null){
    ErrorResponse.INVALID_TOKEN(res);
    return;
  }

  console.log({decoded});

  //TODO, VALIDATE ROL TYPE AND DECODE DATA

  next();
}
