import { Router } from "express";
import { validateAuth } from "src/middlewares/auth.middleware";

const router = Router()

router.get('/getAllBusinessUnit', validateAuth, )