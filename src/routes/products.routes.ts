import {Router} from "express";
import * as productController from "src/controllers/products.controller";

const router = Router();

router.get(`/getAllProducts`, productController.getAllProducts);
router.get(`/getProductByID/:productID`, productController.getProductByID);
router.post(`/createProduct`, productController.createProduct);
router.put(`/updateProduct/:productID`, productController.updateProduct);
router.delete(`/deleteProduct/:productID`, productController.deleteProduct);

export default router;