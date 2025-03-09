import { UserRole } from "@global/definitions";
import { User } from "@models/Database/user.model";
import { Request, Response } from "express";
import EncryptUtils from "@utils/encrypt.utils";
import TokenUtils from "@utils/Token.utils";
import { ErrorResponse, SuccessResponse } from "@utils/responseHandler.utils";

export const signUp = async (req: Request, res: Response) => {
  const { name, email, password, role, status } = req.body;

  const newUser = new User({
    name,
    email,
    password: await EncryptUtils.encryptString(password),
    role: role as UserRole,
    status
  })

  const saveUser = await newUser.save();

  //GENERATE TOKEN
  const token = TokenUtils.generateToken(saveUser);

  SuccessResponse.CREATION(res, {token});
};

export const signIn = async (req: Request, res: Response) : Promise<void> => {
  const {email, password} = req.body;

  //VALIDATE EMAIL
  const validUser = await User.findOne({email:email});
  if(validUser == null) {
    ErrorResponse.NOT_FOUND(res, "User");
    return;
  }

  //VALIDATE PASSWORD
  const validPassword = await EncryptUtils.compareStringEncrypt(password, validUser!!.password)
  if(!validPassword){
    ErrorResponse.INVALID_FIELD(res, "password");
    return;
  }

  //GENERATE TOKEN
  const token = TokenUtils.generateToken(validUser);

  SuccessResponse.GET(res, {token});
};
