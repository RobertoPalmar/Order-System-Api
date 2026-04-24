import mongoose from "mongoose";
import {
  BusinessUnit,
  IBusinessUnit,
} from "@models/database/businessUnit.model";
import { Membership } from "@models/database/membership.model";
import { Order } from "@models/database/order.model";
import { Pagination } from "@models/response/pagination.model";
import { getPaginationParams } from "@utils/functions.utils";
import { ErrorResponse, SuccessResponse } from "@utils/responseHandler.utils";
import { Request, Response } from "express";
import { repositoryHub } from "@repositories/repositoryHub";
import { mapperHub } from "@utils/mappers/mapperHub";
import { BusinessUnitDTOOut } from "@models/DTOs/businessUnit.DTO";
import {
  businessUnitBasicPopulate,
  OrderStatus,
  UserRole,
} from "@global/definitions";
import { getCurrentContext } from "@global/requestContext";

const ACTIVE_ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CREATED,
  OrderStatus.IN_PROGRESS,
];

export const getAllBusinessUnit = async (req: Request, res: Response) => {
  try {
    //GET TOKEN DATA
    const ctx = getCurrentContext();

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

    //GET ACTIVE MEMBERSHIPS FOR CURRENT USER
    const memberships = await Membership.find({
      user: ctx.userID,
      status: true,
    }).select("businessUnit");
    const memberBUIDs = memberships.map((m) => m.businessUnit);

    //SHORT-CIRCUIT IF NO MEMBERSHIPS
    if (memberBUIDs.length === 0) {
      const emptyPagination: Pagination<BusinessUnitDTOOut[]> = {
        data: [],
        pagination: {
          limit,
          page,
          total: 0,
          totalPages: 0,
        },
      };
      SuccessResponse.GET(res, emptyPagination);
      return;
    }

    //GET BUSINESS UNIT LIST SCOPED TO MEMBERSHIPS
    const { data, total, totalPages } =
      await repositoryHub.businessUnitRepository.findByFilter(
        { _id: { $in: memberBUIDs } },
        businessUnitBasicPopulate,
        undefined,
        page,
        limit
      );

    //MAP THE LIST DATA
    const businessUnitDTOList = mapperHub.businessUnitMapper.toDTOList(data);

    //PAGINATE DATA
    const pagination: Pagination<BusinessUnitDTOOut[]> = {
      data: businessUnitDTOList,
      pagination: {
        limit,
        page,
        total,
        totalPages,
      },
    };

    //FORMAT RESPONSE
    SuccessResponse.GET(res, pagination);
  } catch (ex: any) {
    console.log("❌ Error in getAllBusinessUnit:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const getBusinessUnitByID = async (req: Request, res: Response) => {
  try {
    //GET TOKEN DATA
    const ctx = getCurrentContext();

    //GET PARAMS
    const { businessUnitID } = req.params;

    //FIND BUSINESS UNIT
    const BusinessUnitByID =
      await repositoryHub.businessUnitRepository.findById(
        businessUnitID,
        businessUnitBasicPopulate
      );

    //VALIDATE IS BUSINESS UNIT EXIST
    if (BusinessUnitByID == null) {
      ErrorResponse.NOT_FOUND(res, "BusinessUnit");
      return;
    }

    //VALIDATE MEMBERSHIP
    const membership = await Membership.findOne({
      user: ctx.userID,
      businessUnit: businessUnitID,
      status: true,
    });
    if (membership == null) {
      ErrorResponse.NOT_FOUND(res, "BusinessUnit");
      return;
    }

    //MAP THE DATA
    const BusinessUnitDTO =
      mapperHub.businessUnitMapper.toDTO(BusinessUnitByID);

    //RETURN THE RESPONSE
    SuccessResponse.GET(res, BusinessUnitDTO);
  } catch (ex: any) {
    console.log("❌ Error in getBusinessUnitsByID:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const getBusinessUnitBy = async (req: Request, res: Response) => {
  try {
    //GET TOKEN DATA
    const ctx = getCurrentContext();

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

    //GET ACTIVE MEMBERSHIPS FOR CURRENT USER
    const memberships = await Membership.find({
      user: ctx.userID,
      status: true,
    }).select("businessUnit");
    const memberBUIDs = memberships.map((m) => m.businessUnit);

    //SHORT-CIRCUIT IF NO MEMBERSHIPS
    if (memberBUIDs.length === 0) {
      const emptyPagination: Pagination<BusinessUnitDTOOut[]> = {
        data: [],
        pagination: {
          limit,
          page,
          total: 0,
          totalPages: 0,
        },
      };
      SuccessResponse.GET(res, emptyPagination);
      return;
    }

    //GET FILTER BY PARAMS
    let filter = {
      ...createFilterByQueryParams(req),
      _id: { $in: memberBUIDs },
    };

    //GET BUSINESS UNIT LIST
    const { data, total, totalPages } =
      await repositoryHub.businessUnitRepository.findByFilter(
        filter,
        businessUnitBasicPopulate,
        undefined,
        page,
        limit
      );

    //MAP THE LIST DATA
    const businessUnitDTOList = mapperHub.businessUnitMapper.toDTOList(data);

    //PAGINATE THE DATA
    const pagination: Pagination<BusinessUnitDTOOut[]> = {
      data: businessUnitDTOList,
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
    console.log("❌ Error in getProductBy:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

const createFilterByQueryParams = (req: Request) => {
  const { name, description, owner } = req.query;
  let filter: any = {};

  //FILTER PROPERTY
  if (name) filter.name = { $regex: name as string, $options: "i" };
  if (description)
    filter.description = { $regex: description as string, $options: "i" };
  if (owner) filter.owner = owner;

  return filter;
};

export const createBusinessUnit = async (req: Request, res: Response) => {
  try {
    //GET TOKEN DATA
    const ctx = getCurrentContext();

    const currentUser = await repositoryHub.userRepository.findById(ctx.userID);

    //VALIDATE USER
    if(currentUser == null){
      ErrorResponse.INVALID_USER_REQUEST(res);
      return;
    }

    const businessUnitPerUser = await repositoryHub.businessUnitRepository.findByFilter({owner:currentUser.id});

    //VALIDATE BUSINESS COUNT
    if(currentUser.validBusinessUnit <= businessUnitPerUser.total){
      ErrorResponse.USER_EXCEEDS_THE_BUSINESS_UNIT_VALID(res, currentUser.validBusinessUnit);
      return;
    }

    //GET PARAMS
    const { name, description } = req.body;

    //VALIDATE EXISTING BUSINESS UNIT
    const existingBusinessUnit =
      await repositoryHub.businessUnitRepository.findByFilter({ name });
    if (existingBusinessUnit.data.length > 0) {
      ErrorResponse.INVALID_FIELD(
        res,
        "name",
        "this BusinessUnitName is already in use"
      );
      return;
    }

    //CREATE BUSINESS UNIT + AUTO-GRANT ADMIN MEMBERSHIP (TRANSACTIONAL)
    const session = await mongoose.startSession();
    let newBusinessUnitID: mongoose.Types.ObjectId;
    try {
      session.startTransaction();

      const newBU = await new BusinessUnit({
        name,
        description,
        owner: ctx.userID,
      }).save({ session });

      await new Membership({
        user: ctx.userID,
        businessUnit: newBU._id,
        role: UserRole.ADMIN,
        status: true,
      }).save({ session });

      await session.commitTransaction();
      newBusinessUnitID = newBU._id as mongoose.Types.ObjectId;
    } catch (ex) {
      await session.abortTransaction();
      throw ex;
    } finally {
      session.endSession();
    }

    //POPULATE AND MAP ENTITY
    const populatedBusinessUnit = await BusinessUnit.findById(newBusinessUnitID)
      .populate(businessUnitBasicPopulate)
      .exec();

    const BusinessUnitDTO = mapperHub.businessUnitMapper.toDTO(populatedBusinessUnit as IBusinessUnit);

    //RETURN THE RESPONSE
    SuccessResponse.CREATION(res, BusinessUnitDTO);
  } catch (ex: any) {
    console.log("❌ Error in createBusinessUnit:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const updateBusinessUnit = async (req: Request, res: Response) => {
  try {
    //GET TOKEN DATA
    const ctx = getCurrentContext();

    //CROSS-BU GUARD
    if (req.params.businessUnitID !== ctx.businessUnitID) {
      ErrorResponse.FORBIDDEN(res, "BusinessUnit scope mismatch");
      return;
    }

    //UPDATE BusinessUnit
    const updateBusinessUnit =
      await repositoryHub.businessUnitRepository.updateById(
        req.params.businessUnitID,
        req.body,
        businessUnitBasicPopulate
      );

    //VALIDATE IF EXIST
    if (updateBusinessUnit == null) {
      ErrorResponse.NOT_FOUND(res, "BusinessUnit");
      return;
    }
    //MAP DTO
    const businessUnitDTO =
      mapperHub.businessUnitMapper.toDTO(updateBusinessUnit);

    //RETURN RESPOSNE
    SuccessResponse.UPDATE(res, businessUnitDTO);
  } catch (ex: any) {
    console.log("❌ Error in updateBusinessUnit:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const deleteBusinessUnit = async (req: Request, res: Response) => {
  try {
    //GET TOKEN DATA
    const ctx = getCurrentContext();

    //CROSS-BU GUARD
    if (req.params.businessUnitID !== ctx.businessUnitID) {
      ErrorResponse.FORBIDDEN(res, "BusinessUnit scope mismatch");
      return;
    }

    //GET PARAMS
    const { businessUnitID } = req.params;

    //CHECK OTHER ACTIVE MEMBERS
    const otherActiveMembers = await Membership.countDocuments({
      businessUnit: businessUnitID,
      status: true,
      user: { $ne: ctx.userID },
    });
    if (otherActiveMembers > 0) {
      ErrorResponse.FORBIDDEN(res, "Business unit has active members");
      return;
    }

    //CHECK ACTIVE ORDERS
    const activeOrders = await Order.countDocuments({
      businessUnit: businessUnitID,
      status: { $in: ACTIVE_ORDER_STATUSES },
    });
    if (activeOrders > 0) {
      ErrorResponse.FORBIDDEN(res, "Business unit has active orders");
      return;
    }

    //GET AND DELETE THE ENTITY
    const deleteEntity = await repositoryHub.businessUnitRepository.deleteById(
      businessUnitID
    );

    //VALIDATE IF EXIST
    if (deleteEntity == false) {
      ErrorResponse.NOT_FOUND(res, "BusinessUnit");
      return;
    }

    //CLEANUP MEMBERSHIPS
    await Membership.deleteMany({ businessUnit: businessUnitID });

    //RETURN THE RESPONSE
    SuccessResponse.DELETE(res);
  } catch (ex: any) {
    console.log("❌ Error in deleteBusinessUnit:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};
