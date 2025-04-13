import { productionAreaBasicPopulate } from "@global/definitions";
import { ProductionArea } from "@models/database/productionArea.model";
import { ProductionAreaDTOOut } from "@models/DTOs/productionArea.DTO";
import { Pagination } from "@models/response/pagination.model";
import { repositoryHub } from "@repositories/repositoryHub";
import { getPaginationParams } from "@utils/functions.utils";
import { mapperHub } from "@utils/mappers/mapperHub";
import { ErrorResponse, SuccessResponse } from "@utils/responseHandler.utils";
import TokenUtils from "@utils/token.utils";
import { Request, Response } from "express";

export const getAllProductionAreas = async (req: Request, res: Response) => {
  try {
    //GET TOKEN DATA
    const tokenData = TokenUtils.getTokenBussinesDataFromHeaders(req);

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

    //SET BUSINESSUNIT FILTER
    repositoryHub.productionAreaRepository.setBusinessUnitFilter(
      tokenData.businessUnitID
    );

    //GET PRODUCTION AREA LIST
    const { data, total, totalPages } =
      await repositoryHub.productionAreaRepository.findAllPaginated(
        page,
        limit,
        productionAreaBasicPopulate
      );

    //MAP THE LIST DATA
    const productionAreaDTOList = mapperHub.productionAreaMapper.toDTOList(data);

    //PAGINATE THE DATA
    const pagination: Pagination<ProductionAreaDTOOut[]> = {
      data: productionAreaDTOList,
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
    console.log("❌ Error in getAllProductionAreas:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const getProductionAreaByID = async (req: Request, res: Response) => {
  try {
    //GET TOKEN DATA
    const tokenData = TokenUtils.getTokenBussinesDataFromHeaders(req);

    //GET PARAMS
    const { productionAreaID } = req.params;

    //SET BUSINESSUNIT FILTER
    repositoryHub.productionAreaRepository.setBusinessUnitFilter(
      tokenData.businessUnitID
    );

    //FIND PRODUCTION AREA
    const productionAreaByID = await repositoryHub.productionAreaRepository.findById(
      productionAreaID,
      productionAreaBasicPopulate
    );

    //VALIDATE IS PRODUCTION AREA EXIST
    if (productionAreaByID == null) {
      ErrorResponse.NOT_FOUND(res, "Production Area");
      return;
    }

    //MAP THE DATA
    const productionAreaDTO = mapperHub.productionAreaMapper.toDTO(productionAreaByID);

    //RETURN THE RESPONSE
    SuccessResponse.GET(res, productionAreaDTO);
  } catch (ex: any) {
    console.log("❌ Error in getProductionAreaByID:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const getProductionAreasBy = async (req: Request, res: Response) => {
  try {
    //GET TOKEN DATA
    const tokenData = TokenUtils.getTokenBussinesDataFromHeaders(req);

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

    //SET BUSINESSUNIT FILTER
    repositoryHub.productionAreaRepository.setBusinessUnitFilter(
      tokenData.businessUnitID
    );

    //GET FILTER BY PARAMS
    let filter = createFilterByQueryParams(req);

    //GET PRODUCTION AREA LIST
    const { data, total, totalPages } =
      await repositoryHub.productionAreaRepository.findByFilter(
        filter,
        productionAreaBasicPopulate,
        undefined,
        page,
        limit
      );

    //MAP THE LIST DATA
    const productionAreaDTOList = mapperHub.productionAreaMapper.toDTOList(data);

    //PAGINATE THE DATA
    const pagination: Pagination<ProductionAreaDTOOut[]> = {
      data: productionAreaDTOList,
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
    console.log("❌ Error in getProductionAreasBy:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

const createFilterByQueryParams = (req: Request) => {
  const { name, description, status, priority, preferredCategory } = req.query;
  let filter: any = {};

  //FILTER PROPERTY
  if (name) filter.name = { $regex: name as string, $options: "i" };
  if (description) filter.description = { $regex: description as string, $options: "i" };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (preferredCategory) filter.preferredCategory = {$in: [preferredCategory] }

  return filter;
};

export const createProductionArea = async (req: Request, res: Response) => {
  try {
    //GET TOKEN DATA
    const tokenData = TokenUtils.getTokenBussinesDataFromHeaders(req);

    //GET PARAMS
    const { name, description, status, preferredCategory, priority } = req.body;

    //FORMAT PRODUCTION AREA
    const productionArea = new ProductionArea({
      name,
      description,
      status,
      preferredCategory,
      priority,
      businessUnit: tokenData.businessUnitID,
    });

    //SET BUSINESSUNIT FILTER
    repositoryHub.productionAreaRepository.setBusinessUnitFilter(
      tokenData.businessUnitID
    );

    //VALIDATE EXISTING PRODUCTION AREA
    const existingProductionArea = await repositoryHub.productionAreaRepository.findByFilter({name});
    if(existingProductionArea.data.length > 0){
      ErrorResponse.INVALID_FIELD(res,"name","This production area name is already in use")
      return;
    }

    //CREATE PRODUCTION AREA
    const newProductionArea = await repositoryHub.productionAreaRepository.create(
      productionArea,
      productionAreaBasicPopulate
    );

    //MAP ENTITY
    const productionAreaDTO = mapperHub.productionAreaMapper.toDTO(newProductionArea);

    //RETURN THE RESPONSE
    SuccessResponse.CREATION(res, productionAreaDTO);
  } catch (ex: any) {
    console.log("❌ Error in createProductionArea:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const updateProductionArea = async (req: Request, res: Response) => {
  try {
    //GET TOKEN DATA
    const tokenData = TokenUtils.getTokenBussinesDataFromHeaders(req);

    //SET BUSINESSUNIT FILTER
    repositoryHub.productionAreaRepository.setBusinessUnitFilter(
      tokenData.businessUnitID
    );

    //VALIDATE IF EXIST
    const existProductionArea = await repositoryHub.productionAreaRepository.findById(req.params.productionAreaID);
    if(existProductionArea == null){
      ErrorResponse.NOT_FOUND(res, "Production Area");
      return;
    }

    //UPDATE PRODUCTION AREA
    const updatedProductionArea = await repositoryHub.productionAreaRepository.updateById(
      req.params.productionAreaID,
      req.body,
      productionAreaBasicPopulate
    );

    //MAP DTO
    const productionAreaDTO = mapperHub.productionAreaMapper.toDTO(updatedProductionArea!!);

    //RETURN RESPONSE
    SuccessResponse.UPDATE(res, productionAreaDTO);
  } catch (ex: any) {
    console.log("❌ Error in updateProductionArea:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const deleteProductionArea = async (req:Request, res:Response) => {
  try {
    //GET TOKEN DATA
    const tokenData = TokenUtils.getTokenBussinesDataFromHeaders(req);

    //SET BUSINESSUNIT FILTER
    repositoryHub.productionAreaRepository.setBusinessUnitFilter(
      tokenData.businessUnitID
    );

    //VALIDATE IF EXIST
    const existProductionArea = await repositoryHub.productionAreaRepository.findById(req.params.productionAreaID);
    if(existProductionArea == null){
      ErrorResponse.NOT_FOUND(res, "Production Area");
      return;
    }

    //GET AND DELETE THE ENTITY
    await repositoryHub.productionAreaRepository.deleteById(
      req.params.productionAreaID
    );

    //RETURN THE RESPONSE
    SuccessResponse.DELETE(res);
  } catch (ex: any) {
    console.log("❌ Error in deleteProductionArea:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
}
