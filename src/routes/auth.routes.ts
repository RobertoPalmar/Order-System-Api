import {Router} from "express";
import * as authController from "@controllers/auth.controller"
import { validateAuth } from "src/middlewares/auth.middleware";

const router = Router();

router.post('/signIn', authController.signIn);
router.post('/signUp', authController.signUp);
router.get('/signInBussinesUnit/:businessUnitID', validateAuth, authController.signInBussinesUnit)

export default router;
