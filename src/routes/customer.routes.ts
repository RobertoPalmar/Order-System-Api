import { Router } from "express";
import { validateBusinessAuth } from "src/middlewares/auth.middleware";
import * as CustomerController from "@controllers/customer.controller"
import { validateBody, validateObjectIdParams } from "src/middlewares/validation.middleware";
import { CustomerDTOIn, PartialCustomerDTOIn } from "@models/DTOs/customer.DTO";
import { requireRole } from "src/middlewares/requireRole.middleware";
import { UserRole } from "@global/definitions";


const router = Router();

router.get('/getAllCustomers', validateBusinessAuth, CustomerController.getAllCustomers);
router.get('/getCustomerByID/:customerID', validateBusinessAuth, validateObjectIdParams(["customerID"]), CustomerController.getCustomerByID);
router.get('/getCustomersBy', validateBusinessAuth, CustomerController.getCustomerBy);
router.post('/createCustomer', validateBusinessAuth, requireRole(UserRole.ADMIN), validateBody(CustomerDTOIn), CustomerController.createCustomer);
router.put('/updateCustomer/:customerID', validateBusinessAuth, requireRole(UserRole.ADMIN, UserRole.ANFITRION), validateObjectIdParams(["customerID"]), validateBody(PartialCustomerDTOIn), CustomerController.updateCustomer);
router.delete('/deleteCustomer/:customerID', validateBusinessAuth, requireRole(UserRole.ADMIN), validateObjectIdParams(["customerID"]), CustomerController.deleteCustomer);

export default router;
