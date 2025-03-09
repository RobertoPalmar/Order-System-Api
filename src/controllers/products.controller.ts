import { Product } from "@models/Database/product.model";
import { ErrorResponse, SuccessResponse } from "@utils/responseHandler.utils";
import { Request, Response } from "express";

export const getAllProducts = async (req : Request, res: Response) => {
  const products = await Product.find();
  SuccessResponse.GET(res, products);
};

export const getProductBy = async (req: Request, res: Response) => {
  
};

export const getProductByID = async (req: Request, res: Response) => {
  const { productID } = req.params;

  const productByID = await Product.findById(productID);

  if(productByID == null){
    ErrorResponse.NOT_FOUND(res, "Product");
    return;
  }

  SuccessResponse.GET(res, productByID);
};

export const createProduct = async (req: Request, res: Response) => {

  const { name, description, image, category, components, price, cost, currency, status, productArea, bussinesUnit } = req.body;

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
    bussinesUnit
  });

  const newProduct = await product.save();
  SuccessResponse.CREATION(res,newProduct);
};

export const updateProduct = async (req: Request, res: Response) => {
  const updateProduct = await Product.findByIdAndUpdate(req.params.productID, req.body, {new: true});

  if(updateProduct == null){
    ErrorResponse.NOT_FOUND(res,"Product");
    return;
  }

  SuccessResponse.UPDATE(res,updateProduct);
};

export const deleteProduct = async (req: Request, res: Response) => {
  const deleteEntity = await Product.findByIdAndDelete(req.params.productID);

  if(deleteEntity == null){
    ErrorResponse.NOT_FOUND(res,"Product")
    return;
  }

  SuccessResponse.DELETE(res);
};