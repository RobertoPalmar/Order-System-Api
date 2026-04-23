import { Router } from "express";
import { validateBusinessAuth } from "src/middlewares/auth.middleware";
import * as ComponentController from "@controllers/component.controller"
import { validateBody } from "src/middlewares/validation.middleware";
import { ComponentDTOIn, PartialComponentDTOIn } from "@models/DTOs/component.DTO";
import { requireRole } from "src/middlewares/requireRole.middleware";
import { UserRole } from "@global/definitions";

const router = Router()

router.get('/getAllComponents', validateBusinessAuth, ComponentController.getAllComponents);
router.get('/getComponentByID/:componentID', validateBusinessAuth, ComponentController.getComponentByID);
router.get('/getComponentsBy', validateBusinessAuth, ComponentController.getComponentBy);
router.post('/createComponent', validateBusinessAuth, requireRole(UserRole.ADMIN), validateBody(ComponentDTOIn), ComponentController.createComponent);
router.put('/updateComponent/:componentID', validateBusinessAuth, requireRole(UserRole.ADMIN), validateBody(PartialComponentDTOIn), ComponentController.updateComponent);
router.delete('/deleteComponent/:componentID', validateBusinessAuth, requireRole(UserRole.ADMIN), ComponentController.deleteComponent);

export default router;
