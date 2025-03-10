import { UserRole } from "@global/definitions";
import { User } from "@models/database/user.model";
import { Request, Response } from "express";
import EncryptUtils from "@utils/encrypt.utils";
import TokenUtils from "@utils/token.utils";
import { ErrorResponse, SuccessResponse } from "@utils/responseHandler.utils";

export const signUp = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, status } = req.body;

    const newUser = new User({
      name,
      email,
      password: await EncryptUtils.encryptString(password),
      role: role as UserRole,
      status
    });

    const saveUser = await newUser.save();
    const token = TokenUtils.generateToken(saveUser);
    SuccessResponse.CREATION(res, {token});
  } catch (ex: any) {
    console.log("❌ Error in signUp:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const signIn = async (req: Request, res: Response) : Promise<void> => {
  try {
    const {email, password} = req.body;

    const validUser = await User.findOne({email:email});
    if(validUser == null) {
      ErrorResponse.NOT_FOUND(res, "User");
      return;
    }

    const validPassword = await EncryptUtils.compareStringEncrypt(password, validUser!!.password);
    if(!validPassword){
      ErrorResponse.INVALID_FIELD(res, "password");
      return;
    }

    const token = TokenUtils.generateToken(validUser);
    SuccessResponse.GET(res, {token});
  } catch (ex: any) {
    console.log("❌ Error in signIn:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};
