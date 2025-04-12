import { Router } from "express";
import { validateAuth } from "src/middlewares/auth.middleware";
import * as UserController from "@controllers/user.controller"
import { validateBody } from "src/middlewares/validation.middleware";
import { UserDTOIn, PartialUserDTOIn } from "@models/DTOs/user.DTO";

const router = Router();

router.get('/getAllUsers', validateAuth, UserController.getAllUsers);
router.get('/getUserByID/:userID', validateAuth, UserController.getUserByID);
router.get('/getUsersBy', validateAuth, UserController.getUsersBy);
// router.post('/createUser', validateAuth, validateBody(UserDTOIn), UserController.createUser);
// router.put('/updateUser/:userID', validateAuth, validateBody(PartialUserDTOIn), UserController.updateUser);
router.delete('/deleteUser/:userID', validateAuth, UserController.deleteUser);

export default router;
