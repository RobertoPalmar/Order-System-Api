import {
  productBasicPopulate,
  productTotalPopulate,
} from "@global/definitions";
import { Product } from "@models/database/product.model";
import { ProductDTOOut } from "@models/DTOs/product.DTO";
import { Pagination } from "@models/response/pagination.model";
import { getPaginationParams, isNullOrEmpty } from "@utils/functions.utils";
import { mapperHub } from "@utils/mappers/mapperHub";
import { ErrorResponse, SuccessResponse } from "@utils/responseHandler.utils";
import TokenUtils from "@utils/token.utils";
import { Request, Response } from "express";
import { repositoryHub } from "src/repositories/repositoryHub";

export const getAllProducts = async (req: Request, res: Response) => {
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
    repositoryHub.productRepository.setBusinessUnitFilter(
      tokenData.businessUnitID
    );

    //GET PRODUCT LIST
    const { data, total, totalPages } =
      await repositoryHub.productRepository.findAllPaginated(
        page,
        limit,
        productBasicPopulate
      );

    //MAP THE LIST DATA
    const productDTOList = mapperHub.productMapper.toDTOList(data);

    //PAGINATE DATA
    const pagination: Pagination<ProductDTOOut[]> = {
      data: productDTOList,
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

export const getProductBy = async (req: Request, res: Response) => {
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
    repositoryHub.productRepository.setBusinessUnitFilter(
      tokenData.businessUnitID
    );

    //GET FILTER BY PARAMS
    let filter = createFilterByQueryParams(req);

    //GET PRODUCT LIST
    const { data, total, totalPages } =
      await repositoryHub.productRepository.findByFilter(
        filter,
        productBasicPopulate,
        undefined,
        page,
        limit
      );

    //MAP THE LIST DATA
    const productDTOList = mapperHub.productMapper.toDTOList(data);

    //PAGINATE THE DATA
    const pagination: Pagination<ProductDTOOut[]> = {
      data: productDTOList,
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

/** Obtain the product filter by the query params in request */
const createFilterByQueryParams = (req: Request): any => {
  const {
    name,
    description,
    category,
    components,
    price,
    cost,
    currency,
    status,
    productArea,
  } = req.query;
  let filter: any = {};

  //FILTER PROPERTY
  if (name) filter.name = { $regex: name as string, $options: "i" };
  if (description)
    filter.description = { $regex: description as string, $options: "i" };
  if (category) filter.category = category;
  if (components)
    filter.components = { $all: (components as string).split(",") };
  if (price) filter.price = price;
  if (cost) filter.cost = cost;
  if (currency) filter.currency = currency;
  if (status) filter.status = status;
  if (productArea) filter.productArea = productArea;

  return filter;
};

export const getProductByID = async (req: Request, res: Response) => {
  try {
    //GET PARAMS
    const { productID } = req.params;

    //FIND PRODUCT
    const productByID = await repositoryHub.productRepository.findById(
      productID,
      productTotalPopulate
    );

    //VALIDATE IS PRODUCT EXIST
    if (productByID == null) {
      ErrorResponse.NOT_FOUND(res, "Product");
      return;
    }

    //MAP THE DATA
    const productDTO = mapperHub.productMapper.toDTO(productByID);

    //RETURN THE RESPONSE
    SuccessResponse.GET(res, productDTO);
  } catch (ex: any) {
    console.log("❌ Error in getProductByID:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    //GET PARAMS
    const {
      name,
      description,
      image,
      category,
      components,
      price,
      cost,
      currency,
      status,
      productArea,
      businessUnit,
    } = req.body;

    //FORMAT PRODUCT
    const product = new Product({
      name,
      description,
      image,
      category,
      components,
      price,
      cost,
      currency,
      status,
      productArea,
      businessUnit,
    });

    //CREATE PRODUCT
    const newProduct = await repositoryHub.productRepository.create(
      product,
      productTotalPopulate
    );

    //MAP ENTITY
    const productDTO = mapperHub.productMapper.toDTO(newProduct);

    //RETURN THE RESPONSE
    SuccessResponse.CREATION(res, productDTO);
  } catch (ex: any) {
    console.log("❌ Error in createProduct:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    if(isNullOrEmpty(req.params.productID)){
      ErrorResponse.INVALID_FIELD(res,"productID","The value cannot be null or empty")
      return;
    }

    //UPDATE PRODUCT
    const updateProduct = await repositoryHub.productRepository.updateById(
      req.params.productID,
      req.body,
      productTotalPopulate
    );

    //VALIDATE IF EXIST
    if (updateProduct == null) {
      ErrorResponse.NOT_FOUND(res, "Product");
      return;
    }
    //MAP DTO
    const productDTO = mapperHub.productMapper.toDTO(updateProduct);

    //RETURN RESPOSNE
    SuccessResponse.UPDATE(res, productDTO);
  } catch (ex: any) {
    console.log("❌ Error in updateProduct:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    //GET AND DELETE THE ENTITY
    const deleteEntity = await repositoryHub.productRepository.deleteById(
      req.params.productID
    );

    //VALIDATE IF EXIST
    if (deleteEntity == false) {
      ErrorResponse.NOT_FOUND(res, "Product");
      return;
    }

    //RETURN THE RESPONSE
    SuccessResponse.DELETE(res);
  } catch (ex: any) {
    console.log("❌ Error in deleteProduct:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};
