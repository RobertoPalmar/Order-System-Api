import { Router } from "express";
import { validateAuth, validateBusinessAuth } from "src/middlewares/auth.middleware";
import * as BusinessUnitController from "@controllers/businessUnit.controller"
import { validateBody, validateObjectIdParams } from "src/middlewares/validation.middleware";
import { BusinessUnitDTOIn, PartialBusinessUnitDTOIn } from "@models/DTOs/businessUnit.DTO";
import { requireRole } from "src/middlewares/requireRole.middleware";
import { UserRole } from "@global/definitions";
import membershipRoutes from "./membership.routes";

const router = Router()

router.get('/getAllBusinessUnit', validateAuth, BusinessUnitController.getAllBusinessUnit);
router.get('/getBusinessUnitByID/:businessUnitID', validateAuth, validateObjectIdParams(["businessUnitID"]), BusinessUnitController.getBusinessUnitByID);
router.get('/getBusinessUnitsBy', validateAuth, BusinessUnitController.getBusinessUnitBy);
router.post('/createBusinessUnit', validateAuth, validateBody(BusinessUnitDTOIn), BusinessUnitController.createBusinessUnit);
router.put('/updateBusinessUnit/:businessUnitID', validateBusinessAuth, requireRole(UserRole.ADMIN), validateObjectIdParams(["businessUnitID"]), validateBody(PartialBusinessUnitDTOIn), BusinessUnitController.updateBusinessUnit);
router.delete('/deleteBusinessUnit/:businessUnitID', validateBusinessAuth, requireRole(UserRole.ADMIN), validateObjectIdParams(["businessUnitID"]), BusinessUnitController.deleteBusinessUnit);

router.use("/:businessUnitID/members", membershipRoutes);

export default router;
