import { customerBasicPopulate } from "@global/definitions";
import { Customer } from "@models/database/customer.model";
import { CustomerDTOOut } from "@models/DTOs/customer.DTO";
import { Pagination } from "@models/response/pagination.model";
import { repositoryHub } from "@repositories/repositoryHub";
import { getPaginationParams } from "@utils/functions.utils";
import { mapperHub } from "@utils/mappers/mapperHub";
import { ErrorResponse, SuccessResponse } from "@utils/responseHandler.utils";
import TokenUtils from "@utils/token.utils";
import { Request, Response } from "express";

export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    //GET TOKEN DATA
    const tokenData = TokenUtils.getTokenBussinesDataFromHeaders(req);

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

    //SET BUSINESSUNIT FILTER
    repositoryHub.customerRepository.setBusinessUnitFilter(
      tokenData.businessUnitID
    );

    //GET CUSTOMER LIST
    const { data, total, totalPages } =
      await repositoryHub.customerRepository.findAllPaginated(
        page,
        limit,
        customerBasicPopulate
      );

    //MAP THE LIST DATA
    const customerDTOList = mapperHub.customerMapper.toDTOList(data);

    //PAGINATE THE DATA
    const pagination: Pagination<CustomerDTOOut[]> = {
      data: customerDTOList,
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
    console.log("❌ Error in getAllCustomers:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const getCustomerByID = async (req: Request, res: Response) => {
  try {
    //GET PARAMS
    const { customerID } = req.params;

    //FIND CUSTOMER
    const customerByID = await repositoryHub.customerRepository.findById(
      customerID,
      customerBasicPopulate
    );

    //VALIDATE IS CUSTOMER EXIST
    if (customerByID == null) {
      ErrorResponse.NOT_FOUND(res, "Customer");
      return;
    }

    //MAP THE DATA
    const customerDTO = mapperHub.customerMapper.toDTO(customerByID);

    //RETURN THE RESPONSE
    SuccessResponse.GET(res, customerDTO);
  } catch (ex: any) {
    console.log("❌ Error in getCustomerByID:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const getCustomerBy = async (req: Request, res: Response) => {
  try {
    //GET TOKEN DATA
    const tokenData = TokenUtils.getTokenBussinesDataFromHeaders(req);

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

    //SET BUSINESSUNIT FILTER
    repositoryHub.customerRepository.setBusinessUnitFilter(
      tokenData.businessUnitID
    );

    //GET FILTER BY PARAMS
    let filter = createFilterByQueryParams(req);

    //GET CUSTOMER LIST
    const { data, total, totalPages } =
      await repositoryHub.customerRepository.findByFilter(
        filter,
        customerBasicPopulate,
        undefined,
        page,
        limit
      );

    //MAP THE LIST DATA
    const customerDTOList = mapperHub.customerMapper.toDTOList(data);

    //PAGINATE THE DATA
    const pagination: Pagination<CustomerDTOOut[]> = {
      data: customerDTOList,
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
    console.log("❌ Error in getCustomerBy:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

const createFilterByQueryParams = (req: Request) => {
  const { firstName, lastName, documentID, email, phone } = req.query;
  let filter: any = {};

  //FILTER PROPERTY
  if (firstName) filter.firstName = { $regex: firstName as string, $options: "i" };
  if (lastName) filter.lastName = { $regex: lastName as string, $options: "i" };
  if (documentID) filter.documentID = { $regex: documentID as string, $options: "i" };
  if (email) filter.email = { $regex: email as string, $options: "i" };
  if (phone) filter.phone = { $regex: phone as string, $options: "i" };

  return filter;
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    //GET PARAMS
    const { firstName, lastName, documentID, email, phone, businessUnit } = req.body;

    //FORMAT CUSTOMER
    const customer = new Customer({
      firstName,
      lastName,
      documentID,
      email,
      phone,
      businessUnit,
    });

    //VALIDATE EXISTING CUSTOMER
    const existingCustomer = await repositoryHub.customerRepository.findByFilter({documentID});
    if(existingCustomer.data.length > 0){
      ErrorResponse.INVALID_FIELD(res,"documentID","This document ID is already in use")
      return;
    }

    //CREATE CUSTOMER
    const newCustomer = await repositoryHub.customerRepository.create(
      customer,
      customerBasicPopulate
    );

    //MAP ENTITY
    const customerDTO = mapperHub.customerMapper.toDTO(newCustomer);

    //RETURN THE RESPONSE
    SuccessResponse.CREATION(res, customerDTO);
  } catch (ex: any) {
    console.log("❌ Error in createCustomer:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    //UPDATE CUSTOMER
    const updatedCustomer = await repositoryHub.customerRepository.updateById(
      req.params.customerID,
      req.body,
      customerBasicPopulate
    );

    //VALIDATE IF EXIST
    if (updatedCustomer == null) {
      ErrorResponse.NOT_FOUND(res, "Customer");
      return;
    }
    //MAP DTO
    const customerDTO = mapperHub.customerMapper.toDTO(updatedCustomer);

    //RETURN RESPONSE
    SuccessResponse.UPDATE(res, customerDTO);
  } catch (ex: any) {
    console.log("❌ Error in updateCustomer:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const deleteCustomer = async (req:Request, res:Response) => {
  try {
    //GET AND DELETE THE ENTITY
    const deleteEntity = await repositoryHub.customerRepository.deleteById(
      req.params.customerID
    );

    //VALIDATE IF EXIST
    if (deleteEntity == false) {
      ErrorResponse.NOT_FOUND(res, "Customer");
      return;
    }

    //RETURN THE RESPONSE
    SuccessResponse.DELETE(res);
  } catch (ex: any) {
    console.log("❌ Error in deleteCustomer:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
}