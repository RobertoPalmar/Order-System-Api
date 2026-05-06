import mongoose from "mongoose";
import { userBasicPopulate } from "@global/definitions";
import { getCurrentContext } from "@global/requestContext";
import { Membership } from "@models/database/membership.model";
import { RefreshToken } from "@models/database/refreshToken.model";
import { User } from "@models/database/user.model";
import { UserDTOOut } from "@models/DTOs/user.DTO";
import { Pagination } from "@models/response/pagination.model";
import { repositoryHub } from "@repositories/repositoryHub";
import { getPaginationParams } from "@utils/functions.utils";
import { mapperHub } from "@utils/mappers/mapperHub";
import { ErrorResponse, SuccessResponse } from "@utils/responseHandler.utils";
import EncryptUtils from "@utils/encrypt.utils";
import { Request, Response } from "express";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    //GET PAGINATION PARAMS
    const { invalid, page, limit } = getPaginationParams(req);

    //VALIDATE PAGINATION
    if (invalid) {
      ErrorResponse.INVALID_FIELD(
        res,
        "page and limit",
        "The paginations params must be a positive value"
      );
      return;
    }

    //GLOBAL USER LIST — SUPER-ADMIN SCOPE, NO BU FILTER
    const { data, total, totalPages } =
      await repositoryHub.userRepository.findAllPaginated(
        page,
        limit,
        userBasicPopulate
      );

    //MAP THE LIST DATA
    const userDTOList = mapperHub.userMapper.toDTOList(data);

    //PAGINATE THE DATA
    const pagination: Pagination<UserDTOOut[]> = {
      data: userDTOList,
      pagination: {
        limit,
        page,
        total,
        totalPages,
      },
    };

    //RETURN THE RESPONSE
    SuccessResponse.GET(res, pagination);
  } catch (ex: any) {
    console.log("❌ Error in getAllUsers:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const getUserByID = async (req: Request, res: Response) => {
  try {
    //GET PARAMS
    const { userID } = req.params;

    //FIND USER (GLOBAL — SUPER-ADMIN SCOPE)
    const userByID = await repositoryHub.userRepository.findById(
      userID,
      userBasicPopulate
    );

    //VALIDATE IS USER EXIST
    if (userByID == null) {
      ErrorResponse.NOT_FOUND(res, "User");
      return;
    }

    //MAP THE DATA
    const userDTO = mapperHub.userMapper.toDTO(userByID);

    //RETURN THE RESPONSE
    SuccessResponse.GET(res, userDTO);
  } catch (ex: any) {
    console.log("❌ Error in getUserByID:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const getUsersBy = async (req: Request, res: Response) => {
  try {
    //GET PAGINATION PARAMS
    const { invalid, page, limit } = getPaginationParams(req);

    //VALIDATE PAGINATION
    if (invalid) {
      ErrorResponse.INVALID_FIELD(
        res,
        "page and limit",
        "The paginations params must be a positive value"
      );
      return;
    }

    //GLOBAL FILTER — NO BU INTERSECTION
    const filter = createFilterByQueryParams(req);

    //GET USER LIST
    const { data, total, totalPages } =
      await repositoryHub.userRepository.findByFilter(
        filter,
        userBasicPopulate,
        undefined,
        page,
        limit
      );

    //MAP THE LIST DATA
    const userDTOList = mapperHub.userMapper.toDTOList(data);

    //PAGINATE THE DATA
    const pagination: Pagination<UserDTOOut[]> = {
      data: userDTOList,
      pagination: {
        limit,
        page,
        total,
        totalPages,
      },
    };

    //RETURN THE RESPONSE
    SuccessResponse.GET(res, pagination);
  } catch (ex: any) {
    console.log("❌ Error in getUsersBy:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

const createFilterByQueryParams = (req: Request) => {
  const { name, email, status } = req.query;
  let filter: any = {};

  //FILTER PROPERTY
  if (name) filter.name = { $regex: name as string, $options: "i" };
  if (email) filter.email = { $regex: email as string, $options: "i" };
  if (status) filter.status = status;

  return filter;
};

export const createUser = async (req: Request, res: Response) => {
  try {
    //GET PARAMS
    const { name, email, password, status } = req.body;

    //FORMAT USER
    const user = new User({
      name,
      email,
      password: await EncryptUtils.encryptString(password),
      status,
    });

    //VALIDATE EXISTING USER
    const existingEmail = await repositoryHub.userRepository.findByFilter({email});
    if(existingEmail.data.length > 0){
      ErrorResponse.INVALID_FIELD(res,"email","This email is already in use")
      return;
    }

    const existingName = await repositoryHub.userRepository.findByFilter({name});
    if(existingName.data.length > 0){
      ErrorResponse.INVALID_FIELD(res,"name","This username is already in use")
      return;
    }

    //CREATE USER
    const newUser = await repositoryHub.userRepository.create(
      user,
      userBasicPopulate
    );

    //MAP ENTITY
    const userDTO = mapperHub.userMapper.toDTO(newUser);

    //RETURN THE RESPONSE
    SuccessResponse.CREATION(res, userDTO);
  } catch (ex: any) {
    console.log("❌ Error in createUser:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

// Performs the user update with security-sensitive side effects:
// password is hashed, and tokenVersion bumps + refresh-token revocation
// trigger when password changes or status flips active->inactive.
const performUserUpdate = async (userID: string, body: any, res: Response) => {
  //LOAD CURRENT USER STATE FOR DELTA DETECTION
  const currentUser = await User.findById(userID).select("status");
  if (currentUser == null) {
    ErrorResponse.NOT_FOUND(res, "User");
    return;
  }

  //SECURITY-SENSITIVE FIELDS — TRIGGER GLOBAL TOKEN INVALIDATION
  const passwordChanged = !!body.password;
  const statusFlippedFalse =
    body.status === false && currentUser.status === true;
  const mustInvalidateAllSessions = passwordChanged || statusFlippedFalse;

  //ENCRYPT PASSWORD IF PRESENT
  if (passwordChanged) {
    body.password = await EncryptUtils.encryptString(body.password);
  }

  //UPDATE USER
  const updatedUser = await repositoryHub.userRepository.updateById(
    userID,
    body,
    userBasicPopulate
  );

  if (updatedUser == null) {
    ErrorResponse.NOT_FOUND(res, "User");
    return;
  }

  //BUMP tokenVersion + REVOKE REFRESH TOKENS ON SECURITY CHANGES
  if (mustInvalidateAllSessions) {
    await User.updateOne({ _id: userID }, { $inc: { tokenVersion: 1 } });
    await RefreshToken.updateMany(
      { user: userID, revokedAt: { $exists: false } },
      { $set: { revokedAt: new Date() } }
    );
  }

  //MAP DTO
  const userDTO = mapperHub.userMapper.toDTO(updatedUser);
  SuccessResponse.UPDATE(res, userDTO);
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { userID } = req.params;
    await performUserUpdate(userID, req.body, res);
  } catch (ex: any) {
    console.log("❌ Error in updateUser:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

// Self-service or super-admin profile edit. Allowed when the requester is
// either the target user or a super-admin. Self callers cannot escalate to
// super-admin (isSuperAdmin is not in the DTO) and cannot promote/demote
// global roles via this endpoint.
export const editProfile = async (req: Request, res: Response) => {
  try {
    const ctx = getCurrentContext();
    const { userID: targetUserID } = req.params;

    //ACCESS GUARD — SELF OR SUPER-ADMIN
    if (ctx.userID !== targetUserID) {
      const me = await User.findById(ctx.userID).select("isSuperAdmin").lean();
      if (me?.isSuperAdmin !== true) {
        ErrorResponse.FORBIDDEN(res, "You can only edit your own profile");
        return;
      }
    }

    await performUserUpdate(targetUserID, req.body, res);
  } catch (ex: any) {
    console.log("❌ Error in editProfile:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { userID } = req.params;
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      //LOAD TARGET USER WITHIN TRANSACTION
      const user = await User.findById(userID).session(session);
      if (!user) throw new Error("USER_NOT_FOUND");

      //LAST SUPER-ADMIN GUARD — MIRRORS LAST-ADMIN-OF-BU GUARD IN MEMBERSHIPS
      if (user.isSuperAdmin) {
        const remaining = await User.countDocuments({
          _id: { $ne: userID },
          isSuperAdmin: true,
          status: true,
        }).session(session);
        if (remaining === 0) throw new Error("LAST_SUPERADMIN");
      }

      //CASCADE — REFRESH TOKENS → MEMBERSHIPS → USER
      await RefreshToken.deleteMany({ user: userID }, { session });
      await Membership.deleteMany({ user: userID }, { session });
      await User.deleteOne({ _id: userID }, { session });
    });
    SuccessResponse.DELETE(res);
  } catch (ex: any) {
    if (ex?.message === "USER_NOT_FOUND") {
      ErrorResponse.NOT_FOUND(res, "User");
      return;
    }
    if (ex?.message === "LAST_SUPERADMIN") {
      ErrorResponse.FORBIDDEN(res, "Cannot delete the last active super-admin");
      return;
    }
    console.log("❌ Error in deleteUser:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  } finally {
    await session.endSession();
  }
};
