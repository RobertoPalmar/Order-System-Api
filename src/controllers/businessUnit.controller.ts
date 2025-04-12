import { IBusinessUnit } from "@models/database/businessUnit.model";
import { Pagination } from "@models/response/pagination.model";
import { getPaginationParams } from "@utils/functions.utils";
import { ErrorResponse, SuccessResponse } from "@utils/responseHandler.utils";
import TokenUtils from "@utils/token.utils";
import { Request, Response } from "express";
import { repositoryHub } from "@repositories/repositoryHub";
import { mapperHub } from "@utils/mappers/mapperHub";
import { BusinessUnitDTOOut } from "@models/DTOs/businessUnit.DTO";

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
      await repositoryHub.businessUnitRepository.findAllPaginated(page, limit);

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

    //GET PRODUCT PARAMS
    const {
      name,
      description,
    } = req.query;
    let filter: any = {};

    //FILTER PROPERTY
    if (name) filter.name = { $regex: name as string, $options: "i" };
    if (description) filter.description = { $regex: description as string, $options: "i" };

    //GET PRODUCT LIST
    const { data, total, totalPages } =
      await repositoryHub.businessUnitRepository.findByFilter(
        filter,
        undefined,
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
