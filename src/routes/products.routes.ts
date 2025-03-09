import {Router} from "express";
import * as productController from "src/controllers/products.controller";
import { validateAuth } from "src/middlewares/auth.middleware";

const router = Router();

router.get(`/getAllProducts`, validateAuth, productController.getAllProducts);
router.get(`/getProductByID/:productID`, validateAuth, productController.getProductByID);
router.post(`/createProduct`, validateAuth, productController.createProduct);
router.put(`/updateProduct/:productID`, validateAuth, productController.updateProduct);
router.delete(`/deleteProduct/:productID`, validateAuth, productController.deleteProduct);

export default router;
