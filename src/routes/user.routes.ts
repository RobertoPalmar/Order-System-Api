import { Router } from "express";
import { validateAuth, validateBusinessAuth } from "src/middlewares/auth.middleware";
import * as UserController from "@controllers/user.controller"
import { validateBody } from "src/middlewares/validation.middleware";
import { UserDTOIn, PartialUserDTOIn } from "@models/DTOs/user.DTO";
import { requireRole } from "src/middlewares/requireRole.middleware";
import { UserRole } from "@global/definitions";

const router = Router();

router.get('/getAllUsers', validateAuth, UserController.getAllUsers);
router.get('/getUserByID/:userID', validateAuth, UserController.getUserByID);
router.get('/getUsersBy', validateAuth, UserController.getUsersBy);
// router.post('/createUser', validateAuth, validateBody(UserDTOIn), UserController.createUser);
// router.put('/updateUser/:userID', validateAuth, validateBody(PartialUserDTOIn), UserController.updateUser);
router.delete('/deleteUser/:userID', validateBusinessAuth, requireRole(UserRole.ADMIN), UserController.deleteUser);

export default router;
