import { getCurrentContext } from "@global/requestContext";
import { User } from "@models/database/user.model";
import { Request, Response } from "express";
import EncryptUtils from "@utils/encrypt.utils";
import TokenUtils from "@utils/token.utils";
import { ErrorResponse, SuccessResponse } from "@utils/responseHandler.utils";
import { repositoryHub } from "src/repositories/repositoryHub";

export const signUp = async (req: Request, res: Response) => {
  try {
    const { name, email, password, status } = req.body;

    const newUser = new User({
      name,
      email,
      password: await EncryptUtils.encryptString(password),
      status
    });

    const existEmailUser = await repositoryHub.userRepository.findByFilter({email});
    if(existEmailUser.data.length > 0){
      ErrorResponse.INVALID_FIELD(res,"email","this email is already in use")
      return;
    }

    const existNameUser = await repositoryHub.userRepository.findByFilter({name});
    if(existNameUser.data.length > 0){
      ErrorResponse.INVALID_FIELD(res,"name","this username is already in use")
      return;
    }

    const saveUser = await newUser.save();
    const token = TokenUtils.generateUserToken(saveUser);
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

    const token = TokenUtils.generateUserToken(validUser);
    SuccessResponse.GET(res, {token});
  } catch (ex: any) {
    console.log("❌ Error in signIn:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const signInBussinesUnit = async (req:Request, res:Response): Promise<void> => {
  try{
    const ctx = getCurrentContext();
    const {businessUnitID} = req.params;

    const validBusinessUnit = await repositoryHub.businessUnitRepository.findById(businessUnitID);
    if(validBusinessUnit == null){
      ErrorResponse.NOT_FOUND(res, "BusinessUnit");
      return;
    }

    //LOOK UP MEMBERSHIP FOR THIS USER + TARGET BUSINESS UNIT
    //NOTE: membershipRepository is { scoped: true }, so getBusinessFilter() would
    //inject { businessUnit: ctx.businessUnitID }. However, this route uses
    //validateAuth (not validateBusinessAuth), so ctx.businessUnitID is undefined
    //at this point and the scoped filter collapses to {}. The explicit
    //businessUnit filter below is the only BU constraint applied.
    const membership = await repositoryHub.membershipRepository.findOne({
      user: ctx.userID,
      businessUnit: businessUnitID,
      status: true,
    });

    if(membership == null){
      ErrorResponse.NOT_MEMBER_OF_BUSINESS(res);
      return;
    }

    const businessToken = TokenUtils.generateBusinessToken(ctx.userID, membership.role, validBusinessUnit)
    SuccessResponse.GET(res, {businessToken})
  } catch (ex: any) {
    console.log("❌ Error in signIn:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
}
