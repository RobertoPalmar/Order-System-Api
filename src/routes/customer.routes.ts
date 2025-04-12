import { Router } from "express";
import { validateBusinessAuth } from "src/middlewares/auth.middleware";
import * as CustomerController from "@controllers/customer.controller"
import { validateBody } from "src/middlewares/validation.middleware";
import { CustomerDTOIn, PartialCustomerDTOIn } from "@models/DTOs/customer.DTO";


const router = Router();

router.get('/getAllCustomers', validateBusinessAuth, CustomerController.getAllCustomers);
router.get('/getCustomerByID/:customerID', validateBusinessAuth, CustomerController.getCustomerByID);
router.get('/getCustomersBy', validateBusinessAuth, CustomerController.getCustomerBy);
router.post('/createCustomer', validateBusinessAuth, validateBody(CustomerDTOIn), CustomerController.createCustomer);
router.put('/updateCustomer/:customerID', validateBusinessAuth,  validateBody(PartialCustomerDTOIn), CustomerController.updateCustomer);
router.delete('/deleteCustomer/:customerID', validateBusinessAuth, CustomerController.deleteCustomer);

export default router;