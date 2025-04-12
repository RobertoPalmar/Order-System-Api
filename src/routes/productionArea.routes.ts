import { Router } from "express";
import { validateBusinessAuth } from "src/middlewares/auth.middleware";
import * as ProductionAreaController from "@controllers/productionArea.controller"
import { validateBody } from "src/middlewares/validation.middleware";
import { ProductionAreaDTOIn, PartialProductionAreaDTOIn } from "@models/DTOs/productionArea.DTO";

const router = Router();

router.get('/getAllProductionAreas', validateBusinessAuth, ProductionAreaController.getAllProductionAreas);
router.get('/getProductionAreaByID/:productionAreaID', validateBusinessAuth, ProductionAreaController.getProductionAreaByID);
router.get('/getProductionAreasBy', validateBusinessAuth, ProductionAreaController.getProductionAreasBy);
router.post('/createProductionArea', validateBusinessAuth, validateBody(ProductionAreaDTOIn), ProductionAreaController.createProductionArea);
router.put('/updateProductionArea/:productionAreaID', validateBusinessAuth, validateBody(PartialProductionAreaDTOIn), ProductionAreaController.updateProductionArea);
router.delete('/deleteProductionArea/:productionAreaID', validateBusinessAuth, ProductionAreaController.deleteProductionArea);

export default router;
