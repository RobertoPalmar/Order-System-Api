import { Router } from "express";
import { OrderDTOIn, PartialOrderDTOIn } from "@models/DTOs/order.DTO";
import * as OrderController from "@controllers/order.controller";
import { validateBusinessAuth } from "src/middlewares/auth.middleware";
import { validateBody } from "src/middlewares/validation.middleware";
import { requireRole } from "src/middlewares/requireRole.middleware";
import { UserRole } from "@global/definitions";

const router = Router();

router.get('/getAllOrders', validateBusinessAuth, OrderController.getAllOrders);
router.get('/getOrderByID/:orderID', validateBusinessAuth, OrderController.getOrderByID);
router.get('/getOrdersBy', validateBusinessAuth, OrderController.getOrdersBy);
router.post('/createOrder', validateBusinessAuth, requireRole(UserRole.ADMIN, UserRole.ANFITRION, UserRole.WAITER), validateBody(OrderDTOIn), OrderController.createOrder);
router.put('/updateOrder/:orderID', validateBusinessAuth, requireRole(UserRole.ADMIN, UserRole.ANFITRION, UserRole.WAITER), validateBody(PartialOrderDTOIn), OrderController.updateOrder);
router.delete('/deleteOrder/:orderID', validateBusinessAuth, requireRole(UserRole.ADMIN, UserRole.ANFITRION), OrderController.deleteOrder);

export default router;
