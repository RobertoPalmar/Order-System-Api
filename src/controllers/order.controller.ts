import { ItemStatus, orderPopulate, OrderStatus, OrderType } from "@global/definitions";
import { nextOrderCode } from "@models/database/counter.model";
import { getMainCurrency, toMain } from "@utils/currency.utils";
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
  businessUnitID: string
): Promise<[boolean, IOrder | null]> => {
  //GET TOKEN DATA — owner falls back to logged-in user when not provided
  const ctx = getCurrentContext();

  //GET PARAMS
  const {
    description,
    status,
    type,
    customer,
    owner,
    details,
    tableNumber,
    partySize,
    notes,
  } = req.body;

  //RESOLVE BU MAIN CURRENCY — every price stored on the order is normalized
  //to this currency via the conversion helpers in @utils/currency.utils.
  let mainCurrency;
  try {
    mainCurrency = await getMainCurrency(businessUnitID);
  } catch (err: any) {
    ErrorResponse.INVALID_FIELD(res, "currency", err.message);
    return [false, null];
  }

  const formatedDetails = plainToInstance(OrderDetailDTOIn, details as []);

  //GET PRODUCTS — populate productArea (for cocina snapshot) and currency
  //(for FX conversion to main).
  const productIDList = formatedDetails.map(
    (d) => new Types.ObjectId(d.product)
  );
  const { data: productFind } =
    await repositoryHub.productRepository.findByFilter(
      { _id: { $in: productIDList } },
      [
        { path: "productArea", select: "id name" },
        { path: "currency", select: "id ISO symbol exchangeRate main" },
      ]
    );

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

  //GET USER — fallback to logged-in user when owner not sent
  const ownerID = owner ?? ctx.userID;
  const userReference = await repositoryHub.userRepository.findById(ownerID);
  if (!userReference) {
    ErrorResponse.INVALID_FIELD(res, "owner", "Not found");
    return [false, null];
  }

  //GET EXTRAS AND REMOVED LIST — populate extra.currency for FX conversion
  const extrasAndRemovedIDList = distinctBy(
    formatedDetails.flatMap((d) => d.extras.concat(d.removed)),
    (d) => d
  );
  const extrasAndRemovedList = (
    await repositoryHub.componentRepository.findByFilter(
      { _id: { $in: extrasAndRemovedIDList } },
      [{ path: "extra.currency", select: "id ISO symbol exchangeRate main" }]
    )
  ).data;

  //VALIDATE EXTRAS — every component used as extra must have extra=true
  const requestedExtraIDs = distinctBy(
    formatedDetails.flatMap((d) => d.extras),
    (d) => d
  );
  for (const extraID of requestedExtraIDs) {
    const component = extrasAndRemovedList.find((c) => c.id == extraID);
    if (!component || !component.extra) {
      ErrorResponse.INVALID_FIELD(
        res,
        "extras",
        `Component ${extraID} is not allowed as extra`
      );
      return [false, null];
    }
  }

  //FORMAT DETAILS DTO IN DETAIL MODEL — productionArea is derived from the
  //product (snapshot at order time) so clients never send it explicitly.
  //Every monetary value is converted to BU's main currency before storage.
  const orderDetailsList: OrderDetail[] = formatedDetails.map((d) => {
    const relatedProduct = productFind.find((p) => p.id == d.product);
    const productCurrency = (relatedProduct as any)?.currency;
    const productRate = productCurrency?.exchangeRate ?? 1;

    const unitPrice = toMain(relatedProduct!!.price, productRate);

    //GET EXTRAS — wrap in {component, quantity:1}; quantity is reserved for
    //future per-extra qty support (today only IDs are accepted from the API).
    //Extra prices live in their own component currency; convert to main.
    const extrasList = extrasAndRemovedList
      .filter((c) => d.extras.includes(c.id))
      .map((c) => ({ component: c, quantity: 1 }));
    const removedList = extrasAndRemovedList.filter((c) =>
      d.removed.includes(c.id)
    );

    const extrasTotal = extrasList.reduce((sum, e) => {
      const extraCurrency = (e.component as any)?.extra?.currency;
      const extraRate = extraCurrency?.exchangeRate ?? 1;
      const priceMain = toMain(e.component.extra?.price ?? 0, extraRate);
      return sum + priceMain * e.quantity;
    }, 0);

    const totalPrice = unitPrice * d.quantity + extrasTotal;

    //SNAPSHOT PRODUCTION AREA FROM PRODUCT
    const productAreaRef = (relatedProduct as any)?.productArea;
    const productionArea = productAreaRef && productAreaRef._id
      ? { _id: productAreaRef._id.toString(), name: productAreaRef.name }
      : undefined;

    const newDetail: OrderDetail = {
      product: relatedProduct!!,
      quantity: d.quantity,
      unitPrice,
      totalPrice,
      extras: extrasList,
      removed: removedList,
      notes: d.notes,
      itemStatus: d.itemStatus ?? ItemStatus.PENDING,
      productionArea,
    };

    return newDetail;
  });

  //COMPUTE AMOUNT FROM DETAILS — clients no longer send it (already in main)
  const amount = orderDetailsList.reduce((sum, d) => sum + d.totalPrice, 0);

  //GENERATE 8-DIGIT PADDED, PER-BU AUTOINCREMENT CODE
  const code = await nextOrderCode(businessUnitID);

  //FORMAT ORDER — defaults: status=CREATED, type=DINE_IN. Currency is
  //always the BU's main currency (resolved above); FX conversion already
  //applied to unit/total prices and amount.
  const order = new Order({
    code,
    description,
    status: status ?? OrderStatus.CREATED,
    type: type ?? OrderType.DINE_IN,
    customer: customerReference,
    owner: userReference,
    amount,
    currency: mainCurrency,
    details: orderDetailsList,
    businessUnit: businessUnitID,
    tableNumber,
    partySize,
    notes,
  });

  return [true, order];
};

// Build a partial update payload for an Order, resolving any incoming
// reference IDs (customer, owner) into the embedded snapshot shape that the
// Order schema expects. Pass-through fields are scalars only — money values
// (amount, tipAmount), the immutable code, and lifecycle timestamps go
// through their dedicated endpoints (close/discount/items), not here.
// Returns [ok, payload | errorMessage]; caller surfaces the error.
const buildOrderUpdatePayload = async (
  body: any
): Promise<[true, any] | [false, { field: string; message: string }]> => {
  const update: any = {};

  const scalarKeys = [
    "description",
    "status",
    "type",
    "tableNumber",
    "partySize",
    "notes",
  ] as const;
  for (const k of scalarKeys) {
    if (body[k] !== undefined) update[k] = body[k];
  }

  if (body.customer) {
    const customer = await repositoryHub.customerRepository.findById(body.customer);
    if (!customer) return [false, { field: "customer", message: "Not found" }];
    update.customer = customer;
  }

  if (body.owner) {
    const user = await repositoryHub.userRepository.findById(body.owner);
    if (!user) return [false, { field: "owner", message: "Not found" }];
    update.owner = user;
  }

  if (body.details !== undefined) {
    return [
      false,
      {
        field: "details",
        message:
          "Use /Orders/:id/items endpoints to mutate order details (FX, snapshots, and amount are recomputed there)",
      },
    ];
  }

  return [true, update];
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

    //BUILD PAYLOAD — resolve refs into embedded snapshots
    const [ok, payloadOrError] = await buildOrderUpdatePayload(req.body);
    if (!ok) {
      ErrorResponse.INVALID_FIELD(
        res,
        payloadOrError.field,
        payloadOrError.message
      );
      return;
    }

    //UPDATE ORDER
    const updatedOrder = await repositoryHub.orderRepository.updateById(
      req.params.orderID,
      payloadOrError,
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
  //GET PRODUCT — populate productArea (snapshot) and currency (FX)
  const product = await repositoryHub.productRepository.findById(
    body.productID,
    [
      { path: "productArea", select: "id name" },
      { path: "currency", select: "id ISO symbol exchangeRate main" },
    ]
  );
  if (!product) throw new NotFoundError("Product");

  //CONVERT UNIT PRICE TO BU MAIN CURRENCY
  const productCurrency = (product as any).currency;
  const productRate = productCurrency?.exchangeRate ?? 1;
  const unitPrice = toMain(product.price, productRate);

  //GET EXTRAS AND REMOVED COMPONENTS — populate extra.currency for FX
  const componentIDs = [
    ...(body.extras ?? []),
    ...(body.removed ?? []),
  ];

  const componentsList =
    componentIDs.length > 0
      ? (
          await repositoryHub.componentRepository.findByFilter(
            { _id: { $in: componentIDs } },
            [{ path: "extra.currency", select: "id ISO symbol exchangeRate main" }]
          )
        ).data
      : [];

  //VALIDATE EXTRAS — every component used as extra must have extra=true
  for (const extraID of body.extras ?? []) {
    const component = componentsList.find((c) => c.id == extraID);
    if (!component || !component.extra) {
      throw new BadRequestError(
        "extras",
        `Component ${extraID} is not allowed as extra`
      );
    }
  }

  //WRAP EXTRAS in {component, quantity:1}; reserved for future per-extra qty
  const extrasList = componentsList
    .filter((c) => (body.extras ?? []).includes(c.id))
    .map((c) => ({ component: c, quantity: 1 }));
  const removedList = componentsList.filter((c) =>
    (body.removed ?? []).includes(c.id)
  );

  //ADD CONVERTED EXTRAS PRICE TO TOTAL
  const extrasTotal = extrasList.reduce((sum, e) => {
    const extraCurrency = (e.component as any)?.extra?.currency;
    const extraRate = extraCurrency?.exchangeRate ?? 1;
    const priceMain = toMain(e.component.extra?.price ?? 0, extraRate);
    return sum + priceMain * e.quantity;
  }, 0);
  const totalPrice = unitPrice * body.quantity + extrasTotal;

  //SNAPSHOT PRODUCTION AREA FROM PRODUCT
  const productAreaRef = (product as any).productArea;
  const productionArea = productAreaRef && productAreaRef._id
    ? { _id: productAreaRef._id.toString(), name: productAreaRef.name }
    : undefined;

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

// ─── 5. CLOSE ORDER ───────────────────────────────────────────────────────────
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
