import { Router } from "express";
import { validateBusinessAuth } from "src/middlewares/auth.middleware";
import * as ProductionAreaController from "@controllers/productionArea.controller"
import { validateBody, validateObjectIdParams } from "src/middlewares/validation.middleware";
import { ProductionAreaDTOIn, PartialProductionAreaDTOIn } from "@models/DTOs/productionArea.DTO";
import { requireRole } from "src/middlewares/requireRole.middleware";
import { UserRole } from "@global/definitions";

const router = Router();

router.get('/getAllProductionAreas', validateBusinessAuth, ProductionAreaController.getAllProductionAreas);
router.get('/getProductionAreaByID/:productionAreaID', validateBusinessAuth, validateObjectIdParams(["productionAreaID"]), ProductionAreaController.getProductionAreaByID);
router.get('/getProductionAreasBy', validateBusinessAuth, ProductionAreaController.getProductionAreasBy);
router.post('/createProductionArea', validateBusinessAuth, requireRole(UserRole.ADMIN), validateBody(ProductionAreaDTOIn), ProductionAreaController.createProductionArea);
router.put('/updateProductionArea/:productionAreaID', validateBusinessAuth, requireRole(UserRole.ADMIN), validateObjectIdParams(["productionAreaID"]), validateBody(PartialProductionAreaDTOIn), ProductionAreaController.updateProductionArea);
router.delete('/deleteProductionArea/:productionAreaID', validateBusinessAuth, requireRole(UserRole.ADMIN), validateObjectIdParams(["productionAreaID"]), ProductionAreaController.deleteProductionArea);

export default router;
