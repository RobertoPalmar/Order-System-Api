import { BusinessUnit, IBusinessUnit } from "@models/database/businessUnit.model";
import { Pagination } from "@models/response/pagination.model";
import { getPaginationParams } from "@utils/functions.utils";
import { ErrorResponse, SuccessResponse } from "@utils/responseHandler.utils";
import TokenUtils from "@utils/token.utils";
import { Request, Response } from "express";
import { repositoryHub } from "@repositories/repositoryHub";
import { mapperHub } from "@utils/mappers/mapperHub";
import { BusinessUnitDTOOut } from "@models/DTOs/businessUnit.DTO";
import { businessUnitBasicPopulate } from "@global/definitions";

export const getAllBusinessUnit = async (req: Request, res: Response) => {
  try {
    //GET TOKEN DATA
    const tokenData = TokenUtils.getTokenDataFromHeaders(req);

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

    //GET BUSINESS UNIT LIST
    const { data, total, totalPages } =
      await repositoryHub.businessUnitRepository.findAllPaginated(page, limit, businessUnitBasicPopulate);

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
    console.log("❌ Error in getAllProducts:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const getBusinessUnitByID = async (req: Request, res: Response) => {
  try {
    //GET PARAMS
    const { businessUnitID } = req.params;

    //FIND BUSINESS UNIT
    const BusinessUnitByID = await repositoryHub.businessUnitRepository.findById(
      businessUnitID,
      businessUnitBasicPopulate
    );

    //VALIDATE IS BUSINESS UNIT EXIST
    if (BusinessUnitByID == null) {
      ErrorResponse.NOT_FOUND(res, "BusinessUnit");
      return;
    }

    //MAP THE DATA
    const BusinessUnitDTO = mapperHub.businessUnitMapper.toDTO(BusinessUnitByID);

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
    const tokenData = TokenUtils.getTokenDataFromHeaders(req);

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

    //GET PRODUCT LIST
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
  const {
    name,
    description,
    owner
  } = req.query;
  let filter: any = {};

  //FILTER PROPERTY
  if (name) filter.name = { $regex: name as string, $options: "i" };
  if (description) filter.description = { $regex: description as string, $options: "i" };
  if(owner) filter.owner = owner;

  return filter;
};

export const createBusinessUnit = async (req: Request, res: Response) => {
  try {
     //GET TOKEN DATA
     const tokenData = TokenUtils.getTokenDataFromHeaders(req);

    //GET PARAMS
    const { 
      name, 
      description } = req.body;

    //FORMAT BUSINESS UNIT
    const businessUnit = new BusinessUnit({
      name,
      description,
      owner: tokenData.userID
    });

    //VALIDATE EXISTING BUSINESS UNIT
    const existingBusinessUnit = await repositoryHub.businessUnitRepository.findByFilter({name});
    if(existingBusinessUnit.data.length > 0){
      ErrorResponse.INVALID_FIELD(res,"name","this BusinessUnitName is already in use")
      return;
    }

    //CREATE BUSINESS UNIT
    const newBusinessUnit = await repositoryHub.businessUnitRepository.create(
      businessUnit,
      businessUnitBasicPopulate
    );

    //MAP ENTITY
    const BusinessUnitDTO = mapperHub.businessUnitMapper.toDTO(newBusinessUnit);

    //RETURN THE RESPONSE
    SuccessResponse.CREATION(res, BusinessUnitDTO);
  } catch (ex: any) {
    console.log("❌ Error in createBusinessUnit:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const updateBusinessUnit = async (req: Request, res: Response) => {
  try {
    //UPDATE BusinessUnit
    const updateBusinessUnit = await repositoryHub.businessUnitRepository.updateById(
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
    const businessUnitDTO = mapperHub.businessUnitMapper.toDTO(updateBusinessUnit);

    //RETURN RESPOSNE
    SuccessResponse.UPDATE(res, businessUnitDTO);
  } catch (ex: any) {
    console.log("❌ Error in updateBusinessUnit:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const deleteBusinessUnit = async (req:Request, res:Response) => {
  try {
    //GET AND DELETE THE ENTITY
    const deleteEntity = await repositoryHub.businessUnitRepository.deleteById(
      req.params.businessUnitID
    );

    //VALIDATE IF EXIST
    if (deleteEntity == false) {
      ErrorResponse.NOT_FOUND(res, "BusinessUnit");
      return;
    }

    //RETURN THE RESPONSE
    SuccessResponse.DELETE(res);
  } catch (ex: any) {
    console.log("❌ Error in deleteBusinessUnit:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
}

