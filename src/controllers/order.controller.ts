import { orderPopulate } from "@global/definitions";
import { getCurrentContext } from "@global/requestContext";
import {
  IOrder,
  IOrderDetail,
  Order,
  OrderDetail,
} from "@models/database/order.model";
import { OrderDetailDTOIn, OrderDTOOut } from "@models/DTOs/order.DTO";
import { Pagination } from "@models/response/pagination.model";
import { repositoryHub } from "@repositories/repositoryHub";
import { distinctBy, getPaginationParams } from "@utils/functions.utils";
import { mapperHub } from "@utils/mappers/mapperHub";
import { ErrorResponse, SuccessResponse } from "@utils/responseHandler.utils";
import { plainToInstance } from "class-transformer";
import { Request, Response } from "express";
import { Types } from "mongoose";

export const getAllOrders = async (req: Request, res: Response) => {
  try {
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
