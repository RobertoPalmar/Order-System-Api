import { getCurrentContext } from "@global/requestContext";
import { User } from "@models/database/user.model";
import { RefreshToken } from "@models/database/refreshToken.model";
import { Membership } from "@models/database/membership.model";
import { Request, Response } from "express";
import EncryptUtils from "@utils/encrypt.utils";
import TokenUtils from "@utils/token.utils";
import { ErrorResponse, SuccessResponse } from "@utils/responseHandler.utils";
import { repositoryHub } from "src/repositories/repositoryHub";

//HELPER: ISSUE A NEW REFRESH TOKEN, PERSIST HASH AND METADATA
const issueAndStoreRefreshToken = async (
  userID: string,
  req: Request
): Promise<string> => {
  const { token, expiresAt } = TokenUtils.generateRefreshToken(userID);
  const tokenHash = TokenUtils.hashToken(token);

  await repositoryHub.refreshTokenRepository.create({
    tokenHash,
    user: userID as any,
    expiresAt,
    userAgent: req.headers["user-agent"] as string | undefined,
    ip: req.ip,
  } as any);

  return token;
};

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
    const token = TokenUtils.generateUserAccessToken(saveUser);
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

    //GENERATE ACCESS + REFRESH
    const accessToken = TokenUtils.generateUserAccessToken(validUser);
    const refreshToken = await issueAndStoreRefreshToken(
      (validUser._id as any).toString(),
      req
    );

    SuccessResponse.GET(res, { accessToken, refreshToken });
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

    //BUSINESS ACCESS ONLY — REFRESH STAYS USER-LEVEL
    const businessAccessToken = TokenUtils.generateBusinessAccessToken(ctx.userID, membership.role, validBusinessUnit)
    SuccessResponse.GET(res, { businessAccessToken })
  } catch (ex: any) {
    console.log("❌ Error in signIn:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
}

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body as { refreshToken: string };

    //VERIFY JWT SIGNATURE + TYPE === 'refresh'
    const { decoded, expired } = TokenUtils.verifyRefreshToken(refreshToken);

    if (expired) {
      ErrorResponse.EXPIRED_TOKEN(res);
      return;
    }

    if (decoded == null) {
      ErrorResponse.INVALID_TOKEN(res);
      return;
    }

    const payload = decoded as any;
    const userID = payload.userID as string;

    //HASH + LOOKUP
    const incomingHash = TokenUtils.hashToken(refreshToken);
    const stored = await RefreshToken.findOne({ tokenHash: incomingHash });

    //NOT FOUND: TAMPERED OR NEVER ISSUED (OR TTL-SWEPT AFTER EXPIRY)
    if (stored == null) {
      ErrorResponse.INVALID_TOKEN(res);
      return;
    }

    //REUSE DETECTED — REVOKE ALL REFRESH TOKENS FOR THIS USER
    if (stored.revokedAt != null) {
      await RefreshToken.updateMany(
        { user: userID, revokedAt: { $exists: false } },
        { $set: { revokedAt: new Date() } }
      );
      ErrorResponse.INVALID_TOKEN(res);
      return;
    }

    //EXPIRED BY STORED DATE (DEFENSE-IN-DEPTH ALONGSIDE JWT exp)
    if (stored.expiresAt.getTime() < Date.now()) {
      ErrorResponse.EXPIRED_TOKEN(res);
      return;
    }

    //ISSUE NEW PAIR
    const user = await repositoryHub.userRepository.findById(userID);
    if (user == null) {
      ErrorResponse.INVALID_USER_REQUEST(res);
      return;
    }

    const newAccessToken = TokenUtils.generateUserAccessToken(user);
    const newRefreshTokenData = TokenUtils.generateRefreshToken(userID);
    const newRefreshHash = TokenUtils.hashToken(newRefreshTokenData.token);

    //INSERT NEW REFRESH HASH
    await repositoryHub.refreshTokenRepository.create({
      tokenHash: newRefreshHash,
      user: userID as any,
      expiresAt: newRefreshTokenData.expiresAt,
      userAgent: req.headers["user-agent"] as string | undefined,
      ip: req.ip,
    } as any);

    //ROTATE — MARK OLD AS REVOKED AND LINK FORWARD
    stored.revokedAt = new Date();
    stored.replacedByTokenHash = newRefreshHash;
    await stored.save();

    SuccessResponse.GET(res, {
      accessToken: newAccessToken,
      refreshToken: newRefreshTokenData.token,
    });
  } catch (ex: any) {
    console.log("❌ Error in refresh:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const getMyMemberships = async (req: Request, res: Response) => {
  try {
    //GET TOKEN DATA
    const ctx = getCurrentContext();

    //FIND USER'S ACTIVE MEMBERSHIPS
    const memberships = await Membership.find({ user: ctx.userID, status: true })
      .populate({ path: "businessUnit", select: "_id name description" })
      .exec();

    //SHAPE RESPONSE (compact, for BU selector)
    const response = memberships.map((m) => {
      const bu: any = m.businessUnit;
      return {
        businessUnitID: bu?._id?.toString?.() ?? String(bu?._id),
        name: bu?.name,
        role: m.role,
      };
    });

    //RETURN
    SuccessResponse.GET(res, response);
  } catch (ex: any) {
    console.log("❌ Error in getMyMemberships:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body as { refreshToken: string };

    //IDEMPOTENT — HASH LOOKUP AND REVOKE IF PRESENT
    const incomingHash = TokenUtils.hashToken(refreshToken);
    const stored = await RefreshToken.findOne({ tokenHash: incomingHash });

    if (stored != null && stored.revokedAt == null) {
      stored.revokedAt = new Date();
      await stored.save();
    }

    SuccessResponse.GET(res, { message: "Logged out" });
  } catch (ex: any) {
    console.log("❌ Error in logout:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};
