import { componentBasicPopulate, componentTotalPopulate } from "@global/definitions";
import { ComponentDTOOut } from "@models/DTOs/component.DTO";
import { Pagination } from "@models/response/pagination.model";
import { repositoryHub } from "@repositories/repositoryHub";
import { getPaginationParams } from "@utils/functions.utils";
import { mapperHub } from "@utils/mappers/mapperHub";
import { ErrorResponse, SuccessResponse } from "@utils/responseHandler.utils";
import {Request, Response} from "express"
import TokenUtils from "@utils/token.utils";
import { Component } from "@models/database/component.model";

export const getAllComponents = async (req: Request, res: Response) => {
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
    repositoryHub.componentRepository.setBusinessUnitFilter(
      tokenData.businessUnitID
    );

    //GET COMPONENT LIST
    const { data, total, totalPages } =
      await repositoryHub.componentRepository.findAllPaginated(
        page,
        limit,
        componentBasicPopulate
      );

    //MAP THE LIST DATA
    const componentDTOList = mapperHub.componentMapper.toDTOList(data);

    //PAGINATE DATA
    const pagination: Pagination<ComponentDTOOut[]> = {
      data: componentDTOList,
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
    console.log("❌ Error in getAllComponents:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const getComponentByID = async (req: Request, res: Response) => {
  try {
    //GET TOKEN DATA
    const tokenData = TokenUtils.getTokenBussinesDataFromHeaders(req);

    //GET PARAMS
    const { componentID } = req.params;

    //SET BUSINESSUNIT FILTER
    repositoryHub.componentRepository.setBusinessUnitFilter(
      tokenData.businessUnitID
    );

    //FIND Component
    const ComponentByID = await repositoryHub.componentRepository.findById(
      componentID,
      componentTotalPopulate
    );

    //VALIDATE IS Component EXIST
    if (ComponentByID == null) {
      ErrorResponse.NOT_FOUND(res, "Component");
      return;
    }

    //MAP THE DATA
    const ComponentDTO = mapperHub.componentMapper.toDTO(ComponentByID);

    //RETURN THE RESPONSE
    SuccessResponse.GET(res, ComponentDTO);
  } catch (ex: any) {
    console.log("❌ Error in getComponentsByID:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const getComponentBy = async (req: Request, res: Response) => {
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
    repositoryHub.componentRepository.setBusinessUnitFilter(
      tokenData.businessUnitID
    );

    //GET FILTER BY PARAMS
    let filter = createFilterByQueryParams(req);

    //GET Component LIST
    const { data, total, totalPages } =
      await repositoryHub.componentRepository.findByFilter(
        filter,
        componentBasicPopulate,
        undefined,
        page,
        limit
      );

    //MAP THE LIST DATA
    const componentDTOList = mapperHub.componentMapper.toDTOList(data);

    //PAGINATE THE DATA
    const pagination: Pagination<ComponentDTOOut[]> = {
      data: componentDTOList,
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
    console.log("❌ Error in getComponentBy:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

const createFilterByQueryParams = (req: Request) => {
  const {
    name,
    description,
    image,
    type,
    status,
    priceAsExtra,
    currency
  } = req.query;
  let filter: any = {};

  //FILTER PROPERTY
  if (name) filter.name = { $regex: name as string, $options: "i" };
  if (description) filter.description = { $regex: description as string, $options: "i" };
  if (image) filter.image = { $regex: image as string, $options: "i" };
  if (type !== undefined) filter.type = type;
  if (status !== undefined) filter.status = status;
  if (priceAsExtra !== undefined) filter.priceAsExtra = priceAsExtra;
  if (currency) filter.currency = currency;

  return filter;
};

export const createComponent = async (req: Request, res: Response) => {
  try {
    //GET TOKEN DATA
    const tokenData = TokenUtils.getTokenBussinesDataFromHeaders(req);

    //GET PARAMS
    const {
      name,
      description,
      image,
      type,
      status,
      priceAsExtra,
      currency } = req.body;

    //FORMAT COMPONENT
    const component = new Component({
      name,
      description,
      image,
      type,
      status,
      priceAsExtra,
      currency,
      businessUnit: tokenData.businessUnitID,
    });

    //SET BUSINESSUNIT FILTER
    repositoryHub.componentRepository.setBusinessUnitFilter(
      tokenData.businessUnitID
    );

    //VALIDATE EXISTING COMPONENT
    const existingComponent = await repositoryHub.componentRepository.findByFilter({name});
    if(existingComponent.data.length > 0){
      ErrorResponse.INVALID_FIELD(res,"name","this ComponentName is already in use")
      return;
    }

    //CREATE COMPONENT
    const newComponent = await repositoryHub.componentRepository.create(
      component,
      componentBasicPopulate
    );

    //MAP ENTITY
    const ComponentDTO = mapperHub.componentMapper.toDTO(newComponent);

    //RETURN THE RESPONSE
    SuccessResponse.CREATION(res, ComponentDTO);
  } catch (ex: any) {
    console.log("❌ Error in createComponent:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const updateComponent = async (req: Request, res: Response) => {
  try {
    //GET TOKEN DATA
    const tokenData = TokenUtils.getTokenBussinesDataFromHeaders(req);

    //SET BUSINESSUNIT FILTER
    repositoryHub.componentRepository.setBusinessUnitFilter(
      tokenData.businessUnitID
    );

    //VALIDATE IF EXIST
    const existComponent = await repositoryHub.componentRepository.findById(req.params.componentID);
    if(existComponent == null){
      ErrorResponse.NOT_FOUND(res, "Component");
      return;
    }

    //UPDATE Component
    const updateComponent = await repositoryHub.componentRepository.updateById(
      req.params.componentID,
      req.body,
      componentBasicPopulate
    );

    //MAP DTO
    const componentDTO = mapperHub.componentMapper.toDTO(updateComponent!!);

    //RETURN RESPOSNE
    SuccessResponse.UPDATE(res, componentDTO);
  } catch (ex: any) {
    console.log("❌ Error in updateComponent:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const deleteComponent = async (req:Request, res:Response) => {
  try {
    //GET TOKEN DATA
    const tokenData = TokenUtils.getTokenBussinesDataFromHeaders(req);

    //SET BUSINESSUNIT FILTER
    repositoryHub.componentRepository.setBusinessUnitFilter(
      tokenData.businessUnitID
    );

    //VALIDATE IF EXIST
    const existComponent = await repositoryHub.componentRepository.findById(req.params.componentID);
    if(existComponent == null){
      ErrorResponse.NOT_FOUND(res, "Component");
      return;
    }

    //GET AND DELETE THE ENTITY
    await repositoryHub.componentRepository.deleteById(
      req.params.componentID
    );

    //RETURN THE RESPONSE
    SuccessResponse.DELETE(res);
  } catch (ex: any) {
    console.log("❌ Error in deleteComponent:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
}
