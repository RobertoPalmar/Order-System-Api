import { productBasicPopulate, productTotalPopulate } from "@global/definitions";
import { Product } from "@models/database/product.model";
import { ProductDTOOut } from "@models/DTOs/product.DTO";
import { Pagination } from "@models/response/pagination.model";
import { ProductMapper } from "@utils/mappers/product.mapper";
import { ErrorResponse, SuccessResponse } from "@utils/responseHandler.utils";
import TokenUtils from "@utils/token.utils";
import { Request, Response } from "express";
import { repositoryHub } from "src/repositories/repositoryHub";

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const tokenData = TokenUtils.getTokenDataFromHeaders(req);
    console.log(tokenData);

    const page = parseInt(req.query.page as string);
    const limit = parseInt(req.query.limit as string);

    if (page < 1 || limit < 1) {
      ErrorResponse.INVALID_FIELD(
        res,
        "page and limit",
        "The paginations params must be a positive value"
      );
      return;
    }

    const { data, total, totalPages } =
      await repositoryHub.productRepository.findAllPaginated(page, limit, productBasicPopulate);
    const productDTOList = ProductMapper.toDTOList(data);

    const pagination: Pagination<ProductDTOOut[]> = {
      data: productDTOList,
      pagination: {
        limit,
        page,
        total,
        totalPages,
      },
    };

    SuccessResponse.GET(res, pagination);
  } catch (ex: any) {
    console.log("❌ Error in getAllProducts:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const getProductBy = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string);
    const limit = parseInt(req.query.limit as string);

    if (page < 1 || limit < 1) {
      ErrorResponse.INVALID_FIELD(
        res,
        "page and limit",
        "The paginations params must be a positive value"
      );
      return;
    }

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
      createAt,
      updateAt,
    } = req.query;
    let filter: any = {};

    //FILTER PROPERTY
    if (name) filter.name = { $regex: name as string, $options: "i" };
    if (description) filter.description = { $regex: description as string, $options: "i" };
    if (category) filter.category = category;
    if (components) filter.components = { $all: (components as string).split(",") };
    if (price) filter.price = price;
    if (cost) filter.cost = cost;
    if (currency) filter.currency = currency;
    if (status) filter.status = status;
    if (productArea) filter.productArea = productArea;

    const { data, total, totalPages } =
      await repositoryHub.productRepository.findByFilter(filter, productBasicPopulate, undefined, page, limit, );
    const productDTOList = ProductMapper.toDTOList(data);

    const pagination: Pagination<ProductDTOOut[]> = {
      data:productDTOList,
      pagination: {
        limit,
        page,
        total,
        totalPages,
      },
    };

    SuccessResponse.GET(res, pagination);
  } catch (ex: any) {
    console.log("❌ Error in getProductBy:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const getProductByID = async (req: Request, res: Response) => {
  try {
    const { productID } = req.params;
    const productByID = await repositoryHub.productRepository.findById(productID,productTotalPopulate);

    if (productByID == null) {
      ErrorResponse.NOT_FOUND(res, "Product");
      return;
    }

    const productDTO = ProductMapper.toDTO(productByID);

    SuccessResponse.GET(res, productDTO);
  } catch (ex: any) {
    console.log("❌ Error in getProductByID:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
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

    const newProduct = await repositoryHub.productRepository.create(product, productTotalPopulate);
    const productDTO = ProductMapper.toDTO(newProduct);

    SuccessResponse.CREATION(res, productDTO);
  } catch (ex: any) {
    console.log("❌ Error in createProduct:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const updateProduct = await repositoryHub.productRepository.updateById(
      req.params.productID,
      req.body,
      productTotalPopulate
    );

    if (updateProduct == null) {
      ErrorResponse.NOT_FOUND(res, "Product");
      return;
    }
    const productDTO = ProductMapper.toDTO(updateProduct);

    SuccessResponse.UPDATE(res, productDTO);
  } catch (ex: any) {
    console.log("❌ Error in updateProduct:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const deleteEntity = await repositoryHub.productRepository.deleteById(
      req.params.productID
    );

    if (deleteEntity == false) {
      ErrorResponse.NOT_FOUND(res, "Product");
      return;
    }

    SuccessResponse.DELETE(res);
  } catch (ex: any) {
    console.log("❌ Error in deleteProduct:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};
