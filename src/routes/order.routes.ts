import { Router } from "express";
import {
  AddOrderItemDTOIn,
  ApplyDiscountDTOIn,
  ChangeOrderStatusDTOIn,
  CloseOrderDTOIn,
  OrderDTOIn,
  PartialOrderDTOIn,
  UpdateItemStatusDTOIn,
} from "@models/DTOs/order.DTO";
import * as OrderController from "@controllers/order.controller";
import { validateBusinessAuth } from "src/middlewares/auth.middleware";
import { validateBody, validateObjectIdParams } from "src/middlewares/validation.middleware";
import { requireRole } from "src/middlewares/requireRole.middleware";
import { UserRole } from "@global/definitions";

const router = Router();

//EXISTING ROUTES
router.get('/getAllOrders', validateBusinessAuth, OrderController.getAllOrders);
router.get('/getOrderByID/:orderID', validateBusinessAuth, validateObjectIdParams(["orderID"]), OrderController.getOrderByID);
router.get('/getOrdersBy', validateBusinessAuth, OrderController.getOrdersBy);
router.post('/createOrder', validateBusinessAuth, requireRole(UserRole.ADMIN, UserRole.ANFITRION, UserRole.WAITER), validateBody(OrderDTOIn), OrderController.createOrder);
router.put('/updateOrder/:orderID', validateBusinessAuth, requireRole(UserRole.ADMIN, UserRole.ANFITRION, UserRole.WAITER), validateObjectIdParams(["orderID"]), validateBody(PartialOrderDTOIn), OrderController.updateOrder);
router.delete('/deleteOrder/:orderID', validateBusinessAuth, requireRole(UserRole.ADMIN, UserRole.ANFITRION), validateObjectIdParams(["orderID"]), OrderController.deleteOrder);

//NEW ACTION ROUTES (S5)
router.patch('/changeOrderStatus/:orderID', validateBusinessAuth, requireRole(UserRole.ADMIN, UserRole.ANFITRION, UserRole.WAITER), validateObjectIdParams(["orderID"]), validateBody(ChangeOrderStatusDTOIn), OrderController.changeOrderStatus);
router.post('/addItem/:orderID', validateBusinessAuth, requireRole(UserRole.ADMIN, UserRole.ANFITRION, UserRole.WAITER), validateObjectIdParams(["orderID"]), validateBody(AddOrderItemDTOIn), OrderController.addItem);
router.delete('/removeItem/:orderID/:detailID', validateBusinessAuth, requireRole(UserRole.ADMIN, UserRole.ANFITRION, UserRole.WAITER), validateObjectIdParams(["orderID", "detailID"]), OrderController.removeItem);
router.patch('/updateItemStatus/:orderID/:detailID', validateBusinessAuth, validateObjectIdParams(["orderID", "detailID"]), validateBody(UpdateItemStatusDTOIn), OrderController.updateItemStatus);
router.patch('/applyDiscount/:orderID', validateBusinessAuth, requireRole(UserRole.ADMIN, UserRole.ANFITRION), validateObjectIdParams(["orderID"]), validateBody(ApplyDiscountDTOIn), OrderController.applyDiscount);
router.patch('/closeOrder/:orderID', validateBusinessAuth, requireRole(UserRole.ADMIN, UserRole.ANFITRION), validateObjectIdParams(["orderID"]), validateBody(CloseOrderDTOIn), OrderController.closeOrder);
router.get('/byTable/:tableNumber', validateBusinessAuth, OrderController.getOrdersByTable);
router.get('/byProductionArea/:areaID', validateBusinessAuth, validateObjectIdParams(["areaID"]), OrderController.getOrdersByProductionArea);

export default router;
