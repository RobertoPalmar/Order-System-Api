import {Router} from "express";
import * as authController from "@controllers/auth.controller"
import { validateAuth } from "src/middlewares/auth.middleware";
import { validateBody, validateObjectIdParams } from "src/middlewares/validation.middleware";
import { LogoutRequestDTOIn, RefreshTokenRequestDTOIn, SignInDTO, SignUpDTO } from "@models/DTOs/auth.DTO";

const router = Router();

router.post('/signIn', validateBody(SignInDTO), authController.signIn);
router.post('/signUp', validateBody(SignUpDTO), authController.signUp);
router.get('/signInBussinesUnit/:businessUnitID', validateAuth, validateObjectIdParams(["businessUnitID"]), authController.signInBussinesUnit)
router.get('/myMemberships', validateAuth, authController.getMyMemberships);
router.post('/refresh', validateBody(RefreshTokenRequestDTOIn), authController.refresh);
router.post('/logout', validateBody(LogoutRequestDTOIn), authController.logout);

export default router;
