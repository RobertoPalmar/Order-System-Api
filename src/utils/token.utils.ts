import jwt from "jsonwebtoken";
import { SECRET_KEY_TOKEN } from "../global/config";
import { IUser } from "@models/database/user.model";
import { TokenData } from "@models/helpers/tokenData.model"
import { Request } from "express";
import { IBusinessUnit } from "@models/database/businessUnit.model";
import { UserRole } from "@global/definitions";

export default class TokenUtils{

    /** Verify if is a valid token */
    static verifyToken = (token: string) => {
      try {
        const decoded = jwt.verify(token, SECRET_KEY_TOKEN);
        return {
          valid: true,
          expired: false,
          decoded,
        };
      } catch (e: any) {
        return {
          valid: false,
          expired: e.message === "jwt expired",
          decoded: null,
        };
      }
    }
    
    /** Generate a token to user */
    static generateUserToken = (user: IUser) =>{
      return jwt.sign(
        {
          userID: user._id, 
          role: user.role,
        }, 
        SECRET_KEY_TOKEN, 
        { expiresIn: "1d" })
    }

    /** Generate a token to user with BusinessUnit data **/
    static generateBusinessToken = (userID:string, role:UserRole, businessUnit:IBusinessUnit) => {
      return jwt.sign(
        {
          userID, 
          role,
          businessUnitID: businessUnit != undefined ? businessUnit._id : null
        }, 
        SECRET_KEY_TOKEN, 
        { expiresIn: "1d" })
    }

    /** Get the tokenData from a header **/
    static getTokenDataFromHeaders = (req:Request):TokenData => {
      const tokenData = new TokenData();
    
      const role = req.headers["role"];
      const userID = req.headers["userID"];
      if(role != null && userID != null){
        tokenData.role = parseInt(role.toString());
        tokenData.userID = userID.toString();
      }
    
      return tokenData;
    }

}

