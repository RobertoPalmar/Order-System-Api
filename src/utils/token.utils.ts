import jwt from "jsonwebtoken";
import { SECRET_KEY_TOKEN } from "../global/config";
import { IUser } from "@models/Database/user.model";

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
    
    /** Generate a token from a user data */
    static generateToken = (user: IUser) =>{
      return jwt.sign({userID: user._id, role: user.role}, SECRET_KEY_TOKEN, { expiresIn: "1d" })
    }

}

