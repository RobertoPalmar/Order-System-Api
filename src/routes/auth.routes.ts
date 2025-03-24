import {Router} from "express";
import * as authController from "@controllers/auth.controller"
import { validateAuth } from "src/middlewares/auth.middleware";

const router = Router();

router.post('/signIn', authController.signIn);
router.post('/signUp', authController.signUp);
router.post('/signInWithBusinessUnit', validateAuth, authController.signInWithBusinessUnit)

export default router;
