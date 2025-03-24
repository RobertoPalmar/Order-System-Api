import { TokenType } from "@global/definitions";
import { TokenBussinesData, TokenData } from "@models/helpers/tokenData.model";
import { ErrorResponse } from "@utils/responseHandler.utils";
import TokenUtils from "@utils/token.utils";
import { plainToInstance } from "class-transformer";
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

  const tokenData = plainToInstance(TokenData,decoded,{excludeExtraneousValues: true});
  req.headers["userID"] = tokenData.userID;
  req.headers["role"] = tokenData.role?.toString();

  next();
}

export const validateBusinessAuth = async (req: Request, res: Response, next: NextFunction) => {
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

  const tokenBussinesData = plainToInstance(TokenBussinesData,decoded,{excludeExtraneousValues: true});

  if(tokenBussinesData.businessUnitID == undefined){
    ErrorResponse.INVALID_TOKEN_TYPE(res,TokenType.BUSINESS_TOKEN);
    return;
  }

  req.headers["userID"] = tokenBussinesData.userID;
  req.headers["role"] = tokenBussinesData.role.toString();
  req.headers["businessUnitID"] = tokenBussinesData.businessUnitID;

  next();
}