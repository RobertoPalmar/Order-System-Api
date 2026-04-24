import { ErrorResponse } from "@utils/responseHandler.utils";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";
import { isValidObjectId } from "mongoose";

export const validateBody = (dtoIn:any) => {
  return async (req: Request, res:Response, next:NextFunction) =>{
    const dtoToBody = plainToInstance(dtoIn, req.body);
    const errors = await validate(dtoToBody as object);

    if(errors.length > 0){
      const errorList = errors.map(e => Object.values(e.constraints || {})).flat();
      ErrorResponse.VALIDATION_ERROR(res, errorList);
      return;
    }

    req.body = dtoToBody;
    next();
  }
}

export const validateObjectIdParams = (paramNames: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    for (const name of paramNames) {
      const value = req.params[name];
      if (value && !isValidObjectId(value)) {
        ErrorResponse.INVALID_FIELD(res, name, "must be a valid ObjectId");
        return;
      }
    }
    next();
  };
};
