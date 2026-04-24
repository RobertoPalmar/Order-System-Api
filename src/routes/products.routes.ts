import { PartialProductDTOIn, ProductDTOIn } from "@models/DTOs/product.DTO";
import {Router} from "express";
import * as productController from "src/controllers/products.controller";
import { validateBusinessAuth } from "src/middlewares/auth.middleware";
import { validateBody, validateObjectIdParams } from "src/middlewares/validation.middleware";
import { requireRole } from "src/middlewares/requireRole.middleware";
import { UserRole } from "@global/definitions";
import { uploadImage, validateImageMagicBytes } from "src/middlewares/upload.middleware";

const router = Router();

router.get('/getAllProducts', validateBusinessAuth, productController.getAllProducts);
router.get('/getProductByID/:productID', validateBusinessAuth, validateObjectIdParams(["productID"]), productController.getProductByID);
router.get('/getProductsBy', validateBusinessAuth, productController.getProductBy);
router.post('/createProduct', validateBusinessAuth, requireRole(UserRole.ADMIN), validateBody(ProductDTOIn), productController.createProduct);
router.put('/updateProduct/:productID', validateBusinessAuth, requireRole(UserRole.ADMIN), validateObjectIdParams(["productID"]), validateBody(PartialProductDTOIn), productController.updateProduct);
router.delete('/deleteProduct/:productID', validateBusinessAuth, requireRole(UserRole.ADMIN), validateObjectIdParams(["productID"]), productController.deleteProduct);
router.patch('/toggleAvailability/:productID', validateBusinessAuth, requireRole(UserRole.ADMIN), validateObjectIdParams(["productID"]), productController.toggleAvailability);
router.post('/uploadImage/:productID', validateBusinessAuth, requireRole(UserRole.ADMIN), validateObjectIdParams(["productID"]), uploadImage("image"), validateImageMagicBytes, productController.uploadProductImage);

export default router;
