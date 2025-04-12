import { userBasicPopulate } from "@global/definitions";
import { User } from "@models/database/user.model";
import { UserDTOOut } from "@models/DTOs/user.DTO";
import { Pagination } from "@models/response/pagination.model";
import { repositoryHub } from "@repositories/repositoryHub";
import { getPaginationParams } from "@utils/functions.utils";
import { mapperHub } from "@utils/mappers/mapperHub";
import { ErrorResponse, SuccessResponse } from "@utils/responseHandler.utils";
import TokenUtils from "@utils/token.utils";
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

    //GET USER LIST
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

    //FIND USER
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

    //GET FILTER BY PARAMS
    let filter = createFilterByQueryParams(req);

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
  const { name, email, role, status } = req.query;
  let filter: any = {};

  //FILTER PROPERTY
  if (name) filter.name = { $regex: name as string, $options: "i" };
  if (email) filter.email = { $regex: email as string, $options: "i" };
  if (role) filter.role = role;
  if (status) filter.status = status;

  return filter;
};

export const createUser = async (req: Request, res: Response) => {
  try {
    //GET PARAMS
    const { name, email, password, role, status } = req.body;

    //FORMAT USER
    const user = new User({
      name,
      email,
      password: await EncryptUtils.encryptString(password),
      role,
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

export const updateUser = async (req: Request, res: Response) => {
  try {
    // Handle password encryption if it's being updated
    if (req.body.password) {
      req.body.password = await EncryptUtils.encryptString(req.body.password);
    }

    //UPDATE USER
    const updatedUser = await repositoryHub.userRepository.updateById(
      req.params.userID,
      req.body,
      userBasicPopulate
    );

    //VALIDATE IF EXIST
    if (updatedUser == null) {
      ErrorResponse.NOT_FOUND(res, "User");
      return;
    }
    //MAP DTO
    const userDTO = mapperHub.userMapper.toDTO(updatedUser);

    //RETURN RESPONSE
    SuccessResponse.UPDATE(res, userDTO);
  } catch (ex: any) {
    console.log("❌ Error in updateUser:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const deleteUser = async (req:Request, res:Response) => {
  try {
    //GET AND DELETE THE ENTITY
    const deleteEntity = await repositoryHub.userRepository.deleteById(
      req.params.userID
    );

    //VALIDATE IF EXIST
    if (deleteEntity == false) {
      ErrorResponse.NOT_FOUND(res, "User");
      return;
    }

    //RETURN THE RESPONSE
    SuccessResponse.DELETE(res);
  } catch (ex: any) {
    console.log("❌ Error in deleteUser:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
}
