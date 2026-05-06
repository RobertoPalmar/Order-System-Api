import { Router } from "express";
import { validateAuth, validateSuperAdmin } from "src/middlewares/auth.middleware";
import * as UserController from "@controllers/user.controller"
import { validateBody, validateObjectIdParams } from "src/middlewares/validation.middleware";
import { UserDTOIn, PartialUserDTOIn } from "@models/DTOs/user.DTO";

const router = Router();

router.get('/getAllUsers', validateSuperAdmin, UserController.getAllUsers);
router.get('/getUserByID/:userID', validateSuperAdmin, validateObjectIdParams(["userID"]), UserController.getUserByID);
router.get('/getUsersBy', validateSuperAdmin, UserController.getUsersBy);
router.post('/createUser', validateAuth, validateBody(UserDTOIn), UserController.createUser);
router.put('/updateUser/:userID', validateSuperAdmin, validateObjectIdParams(["userID"]), validateBody(PartialUserDTOIn), UserController.updateUser);
router.put('/editProfile/:userID', validateAuth, validateObjectIdParams(["userID"]), validateBody(PartialUserDTOIn), UserController.editProfile);
router.delete('/deleteUser/:userID', validateSuperAdmin, validateObjectIdParams(["userID"]), UserController.deleteUser);

export default router;
