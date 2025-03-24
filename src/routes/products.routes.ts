import { PartialProductDTOIn, ProductDTOIn } from "@models/DTOs/product.DTO";
import {Router} from "express";
import * as productController from "src/controllers/products.controller";
import { validateBusinessAuth } from "src/middlewares/auth.middleware";
import { validateBody } from "src/middlewares/validation.middleware";

const router = Router();

router.get('/getAllProducts', validateBusinessAuth, productController.getAllProducts);
router.get('/getProductByID/:productID', validateBusinessAuth, productController.getProductByID);
router.get('/getProductsBy', validateBusinessAuth, productController.getProductBy);
router.post('/createProduct', validateBusinessAuth, validateBody(ProductDTOIn), productController.createProduct);
router.put('/updateProduct/:productID', validateBusinessAuth,  validateBody(PartialProductDTOIn), productController.updateProduct);
router.delete('/deleteProduct/:productID', validateBusinessAuth, productController.deleteProduct);

export default router;
