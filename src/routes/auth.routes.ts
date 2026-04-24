import {Router} from "express";
import * as authController from "@controllers/auth.controller"
import { validateAuth } from "src/middlewares/auth.middleware";
import { validateBody } from "src/middlewares/validation.middleware";
import { LogoutRequestDTOIn, RefreshTokenRequestDTOIn } from "@models/DTOs/auth.DTO";

const router = Router();

router.post('/signIn', authController.signIn);
router.post('/signUp', authController.signUp);
router.get('/signInBussinesUnit/:businessUnitID', validateAuth, authController.signInBussinesUnit)
router.post('/refresh', validateBody(RefreshTokenRequestDTOIn), authController.refresh);
router.post('/logout', validateBody(LogoutRequestDTOIn), authController.logout);

export default router;
