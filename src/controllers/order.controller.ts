import { ItemStatus, orderPopulate, OrderStatus } from "@global/definitions";
import { NotFoundError, BadRequestError } from "@global/errors";
import { assertOrderTransition, assertItemTransition } from "@global/orderStateMachine";
import { getCurrentContext } from "@global/requestContext";
import {
  IOrder,
  IOrderDetail,
  Order,
  OrderDetail,
} from "@models/database/order.model";
import {
  emitOrderCreated,
  emitOrderStatusChanged,
  emitOrderItemAdded,
  emitOrderItemRemoved,
  emitOrderItemStatusChanged,
} from "@realtime/orderEvents";
import {
  AddOrderItemDTOIn,
  ApplyDiscountDTOIn,
  ChangeOrderStatusDTOIn,
  CloseOrderDTOIn,
  OrderDetailDTOIn,
  OrderDTOOut,
  UpdateItemStatusDTOIn,
} from "@models/DTOs/order.DTO";
import { Pagination } from "@models/response/pagination.model";
import { repositoryHub } from "@repositories/repositoryHub";
import { asyncHandler } from "@utils/asyncHandler.utils";
import { distinctBy, getPaginationParams } from "@utils/functions.utils";
import { mapperHub } from "@utils/mappers/mapperHub";
import { ErrorResponse, SuccessResponse } from "@utils/responseHandler.utils";
import { plainToInstance } from "class-transformer";
import { Request, Response } from "express";
import mongoose, { Types } from "mongoose";

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    //GET TOKEN DATA
    const ctx = getCurrentContext();

    //GET PAGINATION PARAMS
    const { invalid, page, limit } = getPaginationParams(req);

    //VALIDATE PAGINATION
    if (invalid) {
      ErrorResponse.INVALID_FIELD(
        res,
        "page and limit",
        "The paginations params must be a positive value"
      );
      return;
    }

    //GET ORDERS LIST
    const { data, total, totalPages } =
      await repositoryHub.orderRepository.findAllPaginated(
        page,
        limit,
        orderPopulate
      );

    //MAP THE LIST DATA
    const orderDTOList = data.map((order) =>
      mapperHub.orderMapper.toDTO(order)
    );

    //PAGINATE THE DATA
    const pagination: Pagination<OrderDTOOut[]> = {
      data: orderDTOList,
      pagination: {
        limit,
        page,
        total,
        totalPages,
      },
    };

    //RETURN THE RESPONSE
    SuccessResponse.GET(res, pagination);
  } catch (ex: any) {
    console.log("❌ Error in getAllOrders:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const getOrdersBy = async (req: Request, res: Response) => {
  try {
    //GET TOKEN DATA
    const ctx = getCurrentContext();

    //GET PAGINATION PARAMS
    const { invalid, page, limit } = getPaginationParams(req);

    //VALIDATE PAGINATION
    if (invalid) {
      ErrorResponse.INVALID_FIELD(
        res,
        "page and limit",
        "The paginations params must be a positive value"
      );
      return;
    }

    //GET FILTER BY PARAMS
    let filter = createFilterByQueryParams(req);

    //GET ORDERS LIST
    const { data, total, totalPages } =
      await repositoryHub.orderRepository.findByFilter(
        filter,
        orderPopulate,
        undefined,
        page,
        limit
      );

    //MAP THE LIST DATA
    const orderDTOList = data.map((order) =>
      mapperHub.orderMapper.toDTO(order)
    );

    //PAGINATE THE DATA
    const pagination: Pagination<OrderDTOOut[]> = {
      data: orderDTOList,
      pagination: {
        limit,
        page,
        total,
        totalPages,
      },
    };

    //RETURN THE RESPONSE
    SuccessResponse.GET(res, pagination);
  } catch (ex: any) {
    console.log("❌ Error in getOrdersBy:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const getOrderByID = async (req: Request, res: Response) => {
  try {
    //GET TOKEN DATA
    const ctx = getCurrentContext();

    //GET PARAMS
    const { orderID } = req.params;

    //FIND ORDER
    const orderByID = await repositoryHub.orderRepository.findById(
      orderID,
      orderPopulate
    );

    //VALIDATE IS ORDER EXIST
    if (orderByID == null) {
      ErrorResponse.NOT_FOUND(res, "Order");
      return;
    }

    //MAP THE DATA
    const orderDTO = mapperHub.orderMapper.toDTO(orderByID);

    //RETURN THE RESPONSE
    SuccessResponse.GET(res, orderDTO);
  } catch (ex: any) {
    console.log("❌ Error in getOrderByID:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    //GET TOKEN DATA
    const ctx = getCurrentContext();

    //CREATE ORDER
    const [success, orderToCreate] = await MapOrderDTOInToOrderEntity(
      req,
      res,
      ctx.businessUnitID!
    );

    //VALIDATE ERROR
    if (!success) return;

    //CREATE ORDER
    const newOrder = await repositoryHub.orderRepository.create(
      orderToCreate as IOrder,
      orderPopulate
    );

    //MAP ENTITY
    const orderDTO = mapperHub.orderMapper.toDTO(newOrder);

    //RETURN THE RESPONSE
    SuccessResponse.CREATION(res, orderDTO);
    emitOrderCreated(orderDTO, ctx.businessUnitID!);
  } catch (ex: any) {
    console.log("❌ Error in createOrder:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

const MapOrderDTOInToOrderEntity = async (
  req: Request,
  res: Response,
  businessUnitID: String
): Promise<[boolean, IOrder | null]> => {
  //GET PARAMS
  const {
    code,
    description,
    status,
    type,
    customer,
    owner,
    amount,
    currency,
    details,
  } = req.body;

  //VALIDATE EXISTING ORDER
  const existingOrder = await repositoryHub.orderRepository.findByFilter({
    code,
  });
  if (existingOrder.data.length > 0) {
    ErrorResponse.INVALID_FIELD(
      res,
      "code",
      "This order code is already in use"
    );
    return [false, null];
  }
  const formatedDetails = plainToInstance(OrderDetailDTOIn, details as []);

  //GET PRODUCTS
  const productIDList = formatedDetails.map(
    (d) => new Types.ObjectId(d.product)
  );
  const { data: productFind } =
    await repositoryHub.productRepository.findByFilter({
      _id: { $in: productIDList },
    });

  //VALIDATE DETAILS PRODUCT CODES
  if (productIDList.length > productFind.length) {
    const validCodeList = productFind.filter((d) => d.id).map((p) => p.id);
    const invalidCodeList = productIDList.filter(
      (p) => !validCodeList.includes(p)
    );
    ErrorResponse.PRODUCT_CODE_INVALID_IN_ORDER_DETAIL(
      res,
      invalidCodeList[0].toString()
    );
    return [false, null];
  }

  //GET CUSTOMER
  const customerReference = await repositoryHub.customerRepository.findById(
    customer
  );
  if (!customerReference) {
    ErrorResponse.INVALID_FIELD(res, "customer", "Not found");
    return [false, null];
  }

  //GET USER
  const userReference = await repositoryHub.userRepository.findById(owner);
  if (!userReference) {
    ErrorResponse.INVALID_FIELD(res, "owner", "Not found");
    return [false, null];
  }

  //GET CURRENCY
  const currencyReference = await repositoryHub.currencyRepository.findById(currency);
  if (!currencyReference) {
    ErrorResponse.INVALID_FIELD(res, "currency", "Not found");
    return [false, null];
  }

  //GET EXTRAS AND REMOVED LIST
  const extrasAndRemovedIDList = distinctBy(
    formatedDetails.flatMap((d) => d.extras.concat(d.removed)),
    (d) => d
  );
  const extrasAndRemovedList = (
    await repositoryHub.componentRepository.findByFilter({
      _id: { $in: extrasAndRemovedIDList },
    })
  ).data;

  //FORMAT DETAILS DTO IN DETAIL MODEL
  const orderDetailsList: OrderDetail[] = formatedDetails.map((d) => {
    const relatedProduct = productFind.find((p) => p.id == d.product);
    const unitPrice = relatedProduct!!.price;
    const totalPrice = unitPrice * d.quantity;

    //GET EXTRAS
    const extrasList = extrasAndRemovedList.filter((c) =>
      d.extras.includes(c.id)
    );
    const removedList = extrasAndRemovedList.filter((c) =>
      d.removed.includes(c.id)
    );

    const newDetail: OrderDetail = {
      product: relatedProduct!!,
      quantity: d.quantity,
      unitPrice,
      totalPrice,
      extras: extrasList,
      removed: removedList,
    };

    return newDetail;
  });

  //FORMAT ORDER
  const order = new Order({
    code,
    description,
    status,
    type,
    customer: customerReference,
    owner: userReference,
    amount,
    currency: currencyReference,
    details: orderDetailsList,
    businessUnit: businessUnitID,
  });

  return [true, order];
};

export const updateOrder = async (req: Request, res: Response) => {
  try {
    //GET TOKEN DATA
    const ctx = getCurrentContext();

    //VALIDATE IF EXIST
    const existOrder = await repositoryHub.orderRepository.findById(
      req.params.orderID
    );
    if (existOrder == null) {
      ErrorResponse.NOT_FOUND(res, "Order");
      return;
    }

    //UPDATE ORDER
    const updatedOrder = await repositoryHub.orderRepository.updateById(
      req.params.orderID,
      req.body,
      orderPopulate
    );

    //MAP DTO
    const orderDTO = mapperHub.orderMapper.toDTO(updatedOrder!!);

    //RETURN RESPONSE
    SuccessResponse.UPDATE(res, orderDTO);
  } catch (ex: any) {
    console.log("❌ Error in updateOrder:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    //GET TOKEN DATA
    const ctx = getCurrentContext();

    //VALIDATE IF EXIST
    const existOrder = await repositoryHub.orderRepository.findById(
      req.params.orderID
    );
    if (existOrder == null) {
      ErrorResponse.NOT_FOUND(res, "Order");
      return;
    }

    //GET AND DELETE THE ENTITY
    await repositoryHub.orderRepository.deleteById(req.params.orderID);

    //RETURN THE RESPONSE
    SuccessResponse.DELETE(res);
  } catch (ex: any) {
    console.log("❌ Error in deleteOrder:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

// ─── HELPER: resolve a single order item from body ───────────────────────────
// Used by createOrder (via MapOrderDTOInToOrderEntity) AND addItem.
// Returns the hydrated OrderDetail or throws a typed error.
const resolveOrderItem = async (
  body: AddOrderItemDTOIn,
  businessUnitID: string
): Promise<OrderDetail> => {
  //GET PRODUCT
  const product = await repositoryHub.productRepository.findById(body.productID);
  if (!product) throw new NotFoundError("Product");

  const unitPrice = product.price;
  const totalPrice = unitPrice * body.quantity;

  //GET EXTRAS AND REMOVED COMPONENTS
  const componentIDs = [
    ...(body.extras ?? []),
    ...(body.removed ?? []),
  ];

  const componentsList =
    componentIDs.length > 0
      ? (
          await repositoryHub.componentRepository.findByFilter({
            _id: { $in: componentIDs },
          })
        ).data
      : [];

  const extrasList = componentsList.filter((c) =>
    (body.extras ?? []).includes(c.id)
  );
  const removedList = componentsList.filter((c) =>
    (body.removed ?? []).includes(c.id)
  );

  //RESOLVE PRODUCTION AREA SNAPSHOT
  let productionArea: { _id: string; name: string } | undefined;
  if (body.productionArea) {
    const area = await repositoryHub.productionAreaRepository.findById(
      body.productionArea
    );
    if (area) productionArea = { _id: area.id, name: area.name };
  }

  const newDetail: OrderDetail = {
    product,
    quantity: body.quantity,
    unitPrice,
    totalPrice,
    extras: extrasList,
    removed: removedList,
    notes: body.notes,
    itemStatus: ItemStatus.PENDING,
    productionArea,
  };

  return newDetail;
};

// ─── 1. CHANGE ORDER STATUS ───────────────────────────────────────────────────
export const changeOrderStatus = asyncHandler(
  async (req: Request, res: Response) => {
    //GET TOKEN DATA
    const ctx = getCurrentContext();

    //GET PARAMS
    const { orderID } = req.params;
    const body = req.body as ChangeOrderStatusDTOIn;

    //FIND ORDER
    const order = await repositoryHub.orderRepository.findById(orderID);
    if (!order) throw new NotFoundError("Order");

    //VALIDATE TRANSITION
    const prevStatus = order.status;
    assertOrderTransition(order.status, body.status);

    //BUILD UPDATE
    const update: Partial<IOrder> = { status: body.status };
    if (body.status === OrderStatus.CLOSED && !order.closedAt) {
      update.closedAt = new Date();
    }

    //UPDATE ORDER
    const updated = await repositoryHub.orderRepository.updateById(
      orderID,
      update,
      orderPopulate
    );

    //MAP DTO
    const orderDTO = mapperHub.orderMapper.toDTO(updated!);

    //RETURN RESPONSE
    SuccessResponse.UPDATE(res, orderDTO);
    emitOrderStatusChanged(orderDTO, prevStatus, ctx.businessUnitID!);
  }
);

// ─── 2. ADD ITEM TO ORDER ─────────────────────────────────────────────────────
export const addItem = asyncHandler(async (req: Request, res: Response) => {
  //GET TOKEN DATA
  const ctx = getCurrentContext();

  //GET PARAMS
  const { orderID } = req.params;
  const body = req.body as AddOrderItemDTOIn;

  //FIND ORDER
  const order = await repositoryHub.orderRepository.findById(orderID);
  if (!order) throw new NotFoundError("Order");

  //VALIDATE ORDER IS NOT TERMINAL
  if (
    order.status === OrderStatus.CLOSED ||
    order.status === OrderStatus.CANCELLED
  ) {
    throw new BadRequestError(
      "status",
      "Cannot add items to a closed or cancelled order"
    );
  }

  //RESOLVE NEW ITEM
  const newDetail = await resolveOrderItem(body, ctx.businessUnitID!);

  //PUSH ITEM AND RECALCULATE AMOUNT
  const updatedDetails = [...order.details, newDetail] as any;
  const newAmount = updatedDetails.reduce(
    (sum: number, d: any) => sum + (d.totalPrice ?? 0),
    0
  );

  //PERSIST
  const updated = await repositoryHub.orderRepository.updateById(
    orderID,
    { details: updatedDetails, amount: newAmount } as any,
    orderPopulate
  );

  //MAP DTO
  const orderDTO = mapperHub.orderMapper.toDTO(updated!);

  //RETURN RESPONSE
  SuccessResponse.UPDATE(res, orderDTO);

  //EMIT ITEM ADDED EVENT
  const savedDetailRaw = updated!.details[updated!.details.length - 1];
  const detailID = (savedDetailRaw as any)._id?.toString() ?? "";
  const detailDTO = orderDTO.details[orderDTO.details.length - 1];
  emitOrderItemAdded(orderDTO, detailID, detailDTO, ctx.businessUnitID!);
});

// ─── 3. REMOVE ITEM FROM ORDER ────────────────────────────────────────────────
export const removeItem = asyncHandler(async (req: Request, res: Response) => {
  //GET TOKEN DATA
  const ctx = getCurrentContext();

  //GET PARAMS
  const { orderID, detailID } = req.params;

  //FIND ORDER
  const order = await repositoryHub.orderRepository.findById(orderID);
  if (!order) throw new NotFoundError("Order");

  //FIND DETAIL
  const detail = order.details.find((d) => d.id === detailID || (d as any)._id?.toString() === detailID);
  if (!detail) throw new NotFoundError("OrderDetail");
  const areaID = (detail as any).productionArea?._id?.toString();

  //VALIDATE DETAIL IS REMOVABLE
  if (
    detail.itemStatus === ItemStatus.DELIVERED ||
    detail.itemStatus === ItemStatus.CANCELLED
  ) {
    throw new BadRequestError(
      "itemStatus",
      "Cannot remove a delivered or cancelled item"
    );
  }

  //REMOVE DETAIL AND RECALCULATE AMOUNT
  const updatedDetails = order.details.filter(
    (d) => d.id !== detailID && (d as any)._id?.toString() !== detailID
  ) as any;
  const newAmount = updatedDetails.reduce(
    (sum: number, d: any) => sum + (d.totalPrice ?? 0),
    0
  );

  //PERSIST
  await repositoryHub.orderRepository.updateById(
    orderID,
    { details: updatedDetails, amount: newAmount } as any
  );

  //RETURN RESPONSE
  SuccessResponse.DELETE(res);
  emitOrderItemRemoved(orderID, detailID, ctx.businessUnitID!, areaID);
});

// ─── 4. UPDATE ITEM STATUS ────────────────────────────────────────────────────
export const updateItemStatus = asyncHandler(
  async (req: Request, res: Response) => {
    //GET TOKEN DATA
    const ctx = getCurrentContext();

    //GET PARAMS
    const { orderID, detailID } = req.params;
    const body = req.body as UpdateItemStatusDTOIn;

    //FIND ORDER
    const order = await repositoryHub.orderRepository.findById(orderID);
    if (!order) throw new NotFoundError("Order");

    //FIND DETAIL
    const detailIndex = order.details.findIndex(
      (d) => d.id === detailID || (d as any)._id?.toString() === detailID
    );
    if (detailIndex === -1) throw new NotFoundError("OrderDetail");

    const detail = order.details[detailIndex];
    const prevItemStatus = detail.itemStatus;

    //VALIDATE TRANSITION
    assertItemTransition(detail.itemStatus, body.status);

    //MUTATE DETAIL IN ARRAY
    const updatedDetails = order.details.map((d, i) =>
      i === detailIndex ? { ...d.toObject(), itemStatus: body.status } : d.toObject()
    );

    //PERSIST
    const updated = await repositoryHub.orderRepository.updateById(
      orderID,
      { details: updatedDetails } as any,
      orderPopulate
    );

    //MAP DTO
    const orderDTO = mapperHub.orderMapper.toDTO(updated!);

    //RETURN RESPONSE
    SuccessResponse.UPDATE(res, orderDTO);

    //EMIT ITEM STATUS CHANGED EVENT
    const updatedDetailDTO = orderDTO.details.find(
      (_, i) => i === detailIndex
    );
    if (updatedDetailDTO) {
      emitOrderItemStatusChanged(orderDTO, detailID, updatedDetailDTO, prevItemStatus, ctx.businessUnitID!);
    }
  }
);

// ─── 5. APPLY DISCOUNT ────────────────────────────────────────────────────────
export const applyDiscount = asyncHandler(
  async (req: Request, res: Response) => {
    //GET TOKEN DATA
    const ctx = getCurrentContext();

    //GET PARAMS
    const { orderID } = req.params;
    const body = req.body as ApplyDiscountDTOIn;

    //FIND ORDER
    const order = await repositoryHub.orderRepository.findById(orderID);
    if (!order) throw new NotFoundError("Order");

    //VALIDATE ORDER IS IN DISCOUNTABLE STATE
    const discountableStatuses: OrderStatus[] = [
      OrderStatus.PENDING,
      OrderStatus.CREATED,
      OrderStatus.IN_PROGRESS,
    ];
    if (!discountableStatuses.includes(order.status)) {
      throw new BadRequestError(
        "status",
        "Discount can only be applied to orders in PENDING, CREATED, or IN_PROGRESS status"
      );
    }

    //PERSIST DISCOUNT
    const updated = await repositoryHub.orderRepository.updateById(
      orderID,
      { discountAmount: body.discountAmount } as any,
      orderPopulate
    );

    //MAP DTO
    const orderDTO = mapperHub.orderMapper.toDTO(updated!);

    //RETURN RESPONSE
    SuccessResponse.UPDATE(res, orderDTO);
  }
);

// ─── 6. CLOSE ORDER ───────────────────────────────────────────────────────────
export const closeOrder = asyncHandler(async (req: Request, res: Response) => {
  //GET TOKEN DATA
  const ctx = getCurrentContext();

  //GET PARAMS
  const { orderID } = req.params;
  const body = req.body as CloseOrderDTOIn;

  //FIND ORDER
  const order = await repositoryHub.orderRepository.findById(orderID);
  if (!order) throw new NotFoundError("Order");

  const prevStatus = order.status;

  //VALIDATE TRANSITION TO CLOSED
  assertOrderTransition(order.status, OrderStatus.CLOSED);

  const now = new Date();

  //PERSIST CLOSURE
  const updated = await repositoryHub.orderRepository.updateById(
    orderID,
    {
      status: OrderStatus.CLOSED,
      paymentMethod: body.paymentMethod,
      tipAmount: body.tipAmount ?? 0,
      paidAt: now,
      closedAt: now,
    } as any,
    orderPopulate
  );

  //MAP DTO
  const orderDTO = mapperHub.orderMapper.toDTO(updated!);

  //RETURN RESPONSE
  SuccessResponse.UPDATE(res, orderDTO);
  emitOrderStatusChanged(orderDTO, prevStatus, ctx.businessUnitID!);
});

// ─── 7. GET ORDERS BY TABLE NUMBER ───────────────────────────────────────────
export const getOrdersByTable = asyncHandler(
  async (req: Request, res: Response) => {
    //GET TOKEN DATA
    const ctx = getCurrentContext();

    //GET PARAMS
    const { tableNumber } = req.params;

    //FIND ACTIVE ORDERS FOR TABLE
    const activeStatuses = [
      OrderStatus.PENDING,
      OrderStatus.CREATED,
      OrderStatus.IN_PROGRESS,
    ];
    const { data } = await repositoryHub.orderRepository.findByFilter(
      { tableNumber, status: { $in: activeStatuses } },
      orderPopulate
    );

    //MAP DTO LIST
    const orderDTOList = data.map((o) => mapperHub.orderMapper.toDTO(o));

    //RETURN RESPONSE
    SuccessResponse.GET(res, orderDTOList);
  }
);

// ─── 8. GET ORDERS BY PRODUCTION AREA ────────────────────────────────────────
// Uses aggregation because BaseRepository.findByFilter cannot deep-filter on
// embedded array elements. The pipeline explicitly includes businessUnit in
// $match because aggregation bypasses the scoped-repository automatic filter.
export const getOrdersByProductionArea = asyncHandler(
  async (req: Request, res: Response) => {
    //GET TOKEN DATA
    const ctx = getCurrentContext();

    //GET PARAMS
    const { areaID } = req.params;

    //AGGREGATE: unwind details, filter by area and non-terminal item status
    const pipeline: any[] = [
      {
        $match: {
          businessUnit: new Types.ObjectId(ctx.businessUnitID!),
        },
      },
      { $unwind: "$details" },
      {
        $match: {
          "details.productionArea._id": areaID,
          "details.itemStatus": {
            $nin: [ItemStatus.READY, ItemStatus.DELIVERED],
          },
        },
      },
      {
        $project: {
          _id: 0,
          orderID: "$_id",
          orderCode: "$code",
          tableNumber: "$tableNumber",
          detail: {
            _id: "$details._id",
            product: "$details.product",
            itemStatus: "$details.itemStatus",
            quantity: "$details.quantity",
            extras: "$details.extras",
            removed: "$details.removed",
            notes: "$details.notes",
          },
        },
      },
    ];

    //RUN AGGREGATION DIRECTLY ON MODEL (BaseRepository does not expose aggregate)
    const results = await Order.aggregate(pipeline);

    //RETURN RESPONSE
    SuccessResponse.GET(res, results);
  }
);

const createFilterByQueryParams = (req: Request) => {
  const { code, status, type, customer, owner, currency } = req.query;
  let filter: any = {};

  //FILTER PROPERTY
  if (code) filter.code = { $regex: code as string, $options: "i" };
  if (status) filter.status = status;
  if (type) filter.type = type;
  if (customer) filter.customer = customer;
  if (owner) filter.owner = owner;
  if (currency) filter.currency = currency;

  return filter;
};
