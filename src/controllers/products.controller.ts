import { Product, IProduct } from "@models/database/product.model";
import { ErrorResponse, SuccessResponse } from "@utils/responseHandler.utils";
import { Request, Response } from "express";
import { repositoryHub } from "src/repositories/repositoryHub";

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await repositoryHub.productRepository.findAll();
    SuccessResponse.GET(res, products);
  } catch (ex: any) {
    console.log("❌ Error in getAllProducts:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const getProductBy = async (req: Request, res: Response) => {
  try {
    // Implementation pending
    throw new Error("Method not implemented");
  } catch (ex: any) {
    console.log("❌ Error in getProductBy:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const getProductByID = async (req: Request, res: Response) => {
  try {
    const { productID } = req.params;
    const productByID = await repositoryHub.productRepository.findById(productID);

    if (productByID == null) {
      ErrorResponse.NOT_FOUND(res, "Product");
      return;
    }

    SuccessResponse.GET(res, productByID);
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
      bussinesUnit,
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
      bussinesUnit,
    });

    const newProduct = await repositoryHub.productRepository.create(product);
    SuccessResponse.CREATION(res, newProduct);
  } catch (ex: any) {
    console.log("❌ Error in createProduct:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const updateProduct = await repositoryHub.productRepository.updateById(
      req.params.productID,
      req.body
    );

    if (updateProduct == null) {
      ErrorResponse.NOT_FOUND(res, "Product");
      return;
    }

    SuccessResponse.UPDATE(res, updateProduct);
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

    if (deleteEntity == null) {
      ErrorResponse.NOT_FOUND(res, "Product");
      return;
    }

    SuccessResponse.DELETE(res);
  } catch (ex: any) {
    console.log("❌ Error in deleteProduct:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};
