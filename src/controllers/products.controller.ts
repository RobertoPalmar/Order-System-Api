import { Product } from "@models/Database/product.model";
import { Request, Response } from "express";

export const getAllProducts = async (req : Request, res: Response) => {
  const products = await Product.find();

  res.status(200).json(products);
};

export const getProductBy = async (req: Request, res: Response) => {
  
};

export const getProductByID = async (req: Request, res: Response) => {
  const { productID } = req.params;

  const productByID = await Product.findById(productID);

  res.status(200).json(productByID);
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
  res.status(201).json(newProduct);
};

export const updateProduct = async (req: Request, res: Response) => {
  const updateProduct = await Product.findByIdAndUpdate(req.params.productID, req.body, {new: true});
  
  res.status(200).json(updateProduct);
};

export const deleteProduct = async (req: Request, res: Response) => {
  await Product.findByIdAndDelete(req.params.productID);
  res.status(200).json();
};