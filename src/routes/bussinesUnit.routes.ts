import { Router } from "express";
import { validateAuth } from "src/middlewares/auth.middleware";
import * as businessController from "@controllers/businessUnit.controller"

const router = Router()

router.get('/getAllBusinessUnit', validateAuth, businessController.getAllBusinessUnit);
router.get('/geBusinessUnitsBy', validateAuth, businessController.getBusinessUnitBy);

export default router;