import { Router } from "express";
import { validateBusinessAuth } from "src/middlewares/auth.middleware";
import * as CategoryController from "@controllers/category.controller"
import { validateBody, validateObjectIdParams } from "src/middlewares/validation.middleware";
import { CategoryDTOIn, PartialCategoryDTOIn } from "@models/DTOs/category.DTO";
import { requireRole } from "src/middlewares/requireRole.middleware";
import { UserRole } from "@global/definitions";

const router = Router()

router.get('/getAllCategories', validateBusinessAuth, CategoryController.getAllCategories);
router.get('/getCategoryByID/:categoryID', validateBusinessAuth, validateObjectIdParams(["categoryID"]), CategoryController.getCategoryByID);
router.get('/getCategoriesBy', validateBusinessAuth, CategoryController.getCategoryBy);
router.post('/createCategory', validateBusinessAuth, requireRole(UserRole.ADMIN), validateBody(CategoryDTOIn), CategoryController.createCategory);
router.put('/updateCategory/:categoryID', validateBusinessAuth, requireRole(UserRole.ADMIN), validateObjectIdParams(["categoryID"]), validateBody(PartialCategoryDTOIn), CategoryController.updateCategory);
router.delete('/deleteCategory/:categoryID', validateBusinessAuth, requireRole(UserRole.ADMIN), validateObjectIdParams(["categoryID"]), CategoryController.deleteCategory);

export default router;
