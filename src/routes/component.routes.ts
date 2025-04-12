import { Router } from "express";
import { validateBusinessAuth } from "src/middlewares/auth.middleware";
import * as ComponentController from "@controllers/component.controller"
import { validateBody } from "src/middlewares/validation.middleware";
import { ComponentDTOIn, PartialComponentDTOIn } from "@models/DTOs/component.DTO";

const router = Router()

router.get('/getAllComponents', validateBusinessAuth, ComponentController.getAllComponents);
router.get('/getComponentByID/:componentID', validateBusinessAuth, ComponentController.getComponentByID);
router.get('/getComponentsBy', validateBusinessAuth, ComponentController.getComponentBy);
router.post('/createComponent', validateBusinessAuth, validateBody(ComponentDTOIn), ComponentController.createComponent);
router.put('/updateComponent/:componentID', validateBusinessAuth,  validateBody(PartialComponentDTOIn), ComponentController.updateComponent);
router.delete('/deleteComponent/:componentID', validateBusinessAuth, ComponentController.deleteComponent);

export default router;