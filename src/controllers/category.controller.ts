import { categoryBasicPopulate } from "@global/definitions";
import { Category } from "@models/database/category.model";
import { CategoryDTOOut } from "@models/DTOs/category.DTO";
import { Pagination } from "@models/response/pagination.model";
import { repositoryHub } from "@repositories/repositoryHub";
import { getPaginationParams } from "@utils/functions.utils";
import { mapperHub } from "@utils/mappers/mapperHub";
import { ErrorResponse, SuccessResponse } from "@utils/responseHandler.utils";
import TokenUtils from "@utils/token.utils";
import { Request, Response } from "express";

export const getAllCategories = async (req: Request, res: Response) => {
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
    repositoryHub.categoryRepository.setBusinessUnitFilter(
      tokenData.businessUnitID
    );

    //GET CATEGORY LIST
    const { data, total, totalPages } =
      await repositoryHub.categoryRepository.findAllPaginated(
        page,
        limit,
        categoryBasicPopulate
      );

    //MAP THE LIST DATA
    const categoryDTOList = mapperHub.categoryMapper.toDTOList(data);

    //PAGINATE DATA
    const pagination: Pagination<CategoryDTOOut[]> = {
      data: categoryDTOList,
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
    console.log("❌ Error in getAllCategories:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const getCategoryByID = async (req: Request, res: Response) => {
  try {
    //GET PARAMS
    const { categoryID } = req.params;

    //FIND CATEGORY
    const categoryByID = await repositoryHub.categoryRepository.findById(
      categoryID,
      categoryBasicPopulate
    );

    //VALIDATE IS CATEGORY EXIST
    if (categoryByID == null) {
      ErrorResponse.NOT_FOUND(res, "Category");
      return;
    }

    //MAP THE DATA
    const categoryDTO = mapperHub.categoryMapper.toDTO(categoryByID);

    //RETURN THE RESPONSE
    SuccessResponse.GET(res, categoryDTO);
  } catch (ex: any) {
    console.log("❌ Error in getCategoriesByID:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const getCategoryBy = async (req: Request, res: Response) => {
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
    repositoryHub.categoryRepository.setBusinessUnitFilter(
      tokenData.businessUnitID
    );

    //GET FILTER BY PARAMS
    let filter = createFilterByQueryParams(req);

    //GET CATEGORY LIST
    const { data, total, totalPages } =
      await repositoryHub.categoryRepository.findByFilter(
        filter,
        categoryBasicPopulate,
        undefined,
        page,
        limit
      );

    //MAP THE LIST DATA
    const categoryDTOList = mapperHub.categoryMapper.toDTOList(data);

    //PAGINATE THE DATA
    const pagination: Pagination<CategoryDTOOut[]> = {
      data: categoryDTOList,
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
    console.log("❌ Error in getCategoryBy:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

const createFilterByQueryParams = (req: Request) => {
  const { name, description } = req.query;
  let filter: any = {};

  //FILTER PROPERTY
  if (name) filter.name = { $regex: name as string, $options: "i" };
  if (description)
    filter.description = { $regex: description as string, $options: "i" };

  return filter;
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    //GET PARAMS
    const { name, description, businessUnit } = req.body;

    //FORMAT CATEGORY
    const category = new Category({
      name,
      description,
      businessUnit,
    });

    //VALIDATE EXISTING CATEGORY
    const existingCategory = await repositoryHub.categoryRepository.findByFilter({name});
    if(existingCategory.data.length > 0){
      ErrorResponse.INVALID_FIELD(res,"name","this categoryName is already in use")
      return;
    }

    //CREATE CATEGORY
    const newCategory = await repositoryHub.categoryRepository.create(
      category,
      categoryBasicPopulate
    );

    //MAP ENTITY
    const categoryDTO = mapperHub.categoryMapper.toDTO(newCategory);

    //RETURN THE RESPONSE
    SuccessResponse.CREATION(res, categoryDTO);
  } catch (ex: any) {
    console.log("❌ Error in createCategory:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    //UPDATE CATEGORY
    const updatecategory = await repositoryHub.categoryRepository.updateById(
      req.params.categoryID,
      req.body,
      categoryBasicPopulate
    );

    //VALIDATE IF EXIST
    if (updatecategory == null) {
      ErrorResponse.NOT_FOUND(res, "category");
      return;
    }
    //MAP DTO
    const categoryDTO = mapperHub.categoryMapper.toDTO(updatecategory);

    //RETURN RESPOSNE
    SuccessResponse.UPDATE(res, categoryDTO);
  } catch (ex: any) {
    console.log("❌ Error in updatecategory:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const deleteCategory = async (req:Request, res:Response) => {
  try {
    //GET AND DELETE THE ENTITY
    const deleteEntity = await repositoryHub.categoryRepository.deleteById(
      req.params.categoryID
    );

    //VALIDATE IF EXIST
    if (deleteEntity == false) {
      ErrorResponse.NOT_FOUND(res, "category");
      return;
    }

    //RETURN THE RESPONSE
    SuccessResponse.DELETE(res);
  } catch (ex: any) {
    console.log("❌ Error in deleteCategory:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
}
