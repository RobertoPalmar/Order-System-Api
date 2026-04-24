import { TokenType } from "@global/definitions";
import { requestContext } from "@global/requestContext";
import { TokenBussinesData, TokenData } from "@models/helpers/tokenData.model";
import { ErrorResponse } from "@utils/responseHandler.utils";
import TokenUtils, {
  TOKEN_TYPE_BUSINESS_ACCESS,
  TOKEN_TYPE_REFRESH,
  TOKEN_TYPE_USER_ACCESS,
} from "@utils/token.utils";
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

  //REJECT REFRESH TOKENS — THIS MIDDLEWARE IS FOR ACCESS TOKENS ONLY
  const decodedType = (decoded as any).type;
  if(decodedType === TOKEN_TYPE_REFRESH){
    ErrorResponse.INVALID_TOKEN_TYPE(res, TokenType.USER_ACCESS);
    return;
  }

  //ACCEPT BOTH user-access AND business-access HERE
  if(
    decodedType !== undefined &&
    decodedType !== TOKEN_TYPE_USER_ACCESS &&
    decodedType !== TOKEN_TYPE_BUSINESS_ACCESS
  ){
    ErrorResponse.INVALID_TOKEN_TYPE(res, TokenType.USER_ACCESS);
    return;
  }

  const tokenData = plainToInstance(TokenData,decoded,{excludeExtraneousValues: true});

  requestContext.run(
    { userID: tokenData.userID },
    () => next()
  );
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

  //REQUIRE business-access EXPLICITLY — REJECT refresh AND user-access
  const decodedType = (decoded as any).type;
  if(
    decodedType !== undefined &&
    decodedType !== TOKEN_TYPE_BUSINESS_ACCESS
  ){
    ErrorResponse.INVALID_TOKEN_TYPE(res, TokenType.BUSINESS_ACCESS);
    return;
  }

  const tokenBussinesData = plainToInstance(TokenBussinesData,decoded,{excludeExtraneousValues: true});

  if(tokenBussinesData.businessUnitID == undefined){
    ErrorResponse.INVALID_TOKEN_TYPE(res,TokenType.BUSINESS_ACCESS);
    return;
  }

  requestContext.run(
    {
      userID: tokenBussinesData.userID,
      role: tokenBussinesData.role,
      businessUnitID: tokenBussinesData.businessUnitID,
    },
    () => next()
  );
}
