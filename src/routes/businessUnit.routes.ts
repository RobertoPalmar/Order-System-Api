import { Router } from "express";
import { validateAuth, validateBusinessAuth } from "src/middlewares/auth.middleware";
import * as BusinessUnitController from "@controllers/businessUnit.controller"
import { validateBody } from "src/middlewares/validation.middleware";
import { BusinessUnitDTOIn, PartialBusinessUnitDTOIn } from "@models/DTOs/businessUnit.DTO";

const router = Router()

router.get('/getAllBusinessUnit', validateAuth, BusinessUnitController.getAllBusinessUnit);
router.get('/getBusinessUnitByID/:businessUnitID', validateAuth, BusinessUnitController.getBusinessUnitByID);
router.get('/getBusinessUnitsBy', validateAuth, BusinessUnitController.getBusinessUnitBy);
router.post('/createBusinessUnit', validateAuth, validateBody(BusinessUnitDTOIn), BusinessUnitController.createBusinessUnit);
router.put('/updateBusinessUnit/:businessUnitID', validateAuth,  validateBody(PartialBusinessUnitDTOIn), BusinessUnitController.updateBusinessUnit);
router.delete('/deleteBusinessUnit/:businessUnitID', validateAuth, BusinessUnitController.deleteBusinessUnit);

export default router;