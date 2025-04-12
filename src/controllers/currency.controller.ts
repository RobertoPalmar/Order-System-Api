import { currencyBasicPopulate } from "@global/definitions";
import { Currency } from "@models/database/currency.model";
import { CurrencyDTOOut } from "@models/DTOs/currency.DTO";
import { Pagination } from "@models/response/pagination.model";
import { repositoryHub } from "@repositories/repositoryHub";
import { getPaginationParams } from "@utils/functions.utils";
import { mapperHub } from "@utils/mappers/mapperHub";
import { ErrorResponse, SuccessResponse } from "@utils/responseHandler.utils";
import TokenUtils from "@utils/token.utils";
import {Request, Response} from "express"


export const getAllCurrencies = async (req: Request, res: Response) => {
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
    repositoryHub.currencyRepository.setBusinessUnitFilter(
      tokenData.businessUnitID
    );

    //GET CURRENCY LIST
    const { data, total, totalPages } =
      await repositoryHub.currencyRepository.findAllPaginated(
        page,
        limit,
        currencyBasicPopulate
      );

    //MAP THE LIST DATA
    const CurrencyDTOList = mapperHub.currencyMapper.toDTOList(data);

    //PAGINATE DATA
    const pagination: Pagination<CurrencyDTOOut[]> = {
      data: CurrencyDTOList,
      pagination: {
        limit,
        page,
        total,
        totalPages,
      },
    };

    //FORMAT RESPONSE
    SuccessResponse.GET(res, pagination);
  } catch (ex: any) {
    console.log("❌ Error in getAllCurrencies:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const getCurrencyByID = async (req: Request, res: Response) => {
  try {
    //GET PARAMS
    const { CurrencyID } = req.params;

    //FIND Currency
    const CurrencyByID = await repositoryHub.currencyRepository.findById(
      CurrencyID,
      currencyBasicPopulate
    );

    //VALIDATE IS Currency EXIST
    if (CurrencyByID == null) {
      ErrorResponse.NOT_FOUND(res, "Currency");
      return;
    }

    //MAP THE DATA
    const CurrencyDTO = mapperHub.currencyMapper.toDTO(CurrencyByID);

    //RETURN THE RESPONSE
    SuccessResponse.GET(res, CurrencyDTO);
  } catch (ex: any) {
    console.log("❌ Error in getCurrenciesByID:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const getCurrencyBy = async (req: Request, res: Response) => {
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
    repositoryHub.currencyRepository.setBusinessUnitFilter(
      tokenData.businessUnitID
    );

    //GET FILTER BY PARAMS
    let filter = createFilterByQueryParams(req);

    //GET Currency LIST
    const { data, total, totalPages } =
      await repositoryHub.currencyRepository.findByFilter(
        filter,
        currencyBasicPopulate,
        undefined,
        page,
        limit
      );

    //MAP THE LIST DATA
    const currencyDTOList = mapperHub.currencyMapper.toDTOList(data);

    //PAGINATE THE DATA
    const pagination: Pagination<CurrencyDTOOut[]> = {
      data: currencyDTOList,
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
    console.log("❌ Error in getCurrencyBy:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

const createFilterByQueryParams = (req: Request) => {
  const { 
    name,  
    ISO,
    symbol,
    exchangeRate,
    main,
  } = req.query;
  let filter: any = {};

  //FILTER PROPERTY
  if (name) filter.name = { $regex: name as string, $options: "i" };
  if (ISO) filter.ISO = { $regex: ISO as string, $options: "i" };
  if (symbol) filter.symbol = symbol
  if (exchangeRate) filter.exchangeRate = exchangeRate;
  if (main) filter.main = main;

  return filter;
};

export const createCurrency = async (req: Request, res: Response) => {
  try {
    //GET PARAMS
    const { 
      name, 
      ISO,
      symbol,
      exchangeRate,
      main,
      businessUnit } = req.body;

    //FORMAT CURRENCY
    const currency = new Currency({
      name,
      ISO,
      symbol,
      exchangeRate,
      main,
      businessUnit,
    });

    //VALIDATE EXISTING CURRENCY
    const existingCurrency = await repositoryHub.currencyRepository.findByFilter({name});
    if(existingCurrency.data.length > 0){
      ErrorResponse.INVALID_FIELD(res,"name","this CurrencyName is already in use")
      return;
    }

    //CREATE CURRENCY
    const newCurrency = await repositoryHub.currencyRepository.create(
      currency,
      currencyBasicPopulate
    );

    //MAP ENTITY
    const CurrencyDTO = mapperHub.currencyMapper.toDTO(newCurrency);

    //RETURN THE RESPONSE
    SuccessResponse.CREATION(res, CurrencyDTO);
  } catch (ex: any) {
    console.log("❌ Error in createCurrency:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const updateCurrency = async (req: Request, res: Response) => {
  try {
    //UPDATE Currency
    const updateCurrency = await repositoryHub.currencyRepository.updateById(
      req.params.currencyID,
      req.body,
      currencyBasicPopulate
    );

    //VALIDATE IF EXIST
    if (updateCurrency == null) {
      ErrorResponse.NOT_FOUND(res, "Currency");
      return;
    }
    //MAP DTO
    const currencyDTO = mapperHub.currencyMapper.toDTO(updateCurrency);

    //RETURN RESPOSNE
    SuccessResponse.UPDATE(res, currencyDTO);
  } catch (ex: any) {
    console.log("❌ Error in updateCurrency:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
};

export const deleteCurrency = async (req:Request, res:Response) => {
  try {
    //GET AND DELETE THE ENTITY
    const deleteEntity = await repositoryHub.currencyRepository.deleteById(
      req.params.currencyID
    );

    //VALIDATE IF EXIST
    if (deleteEntity == false) {
      ErrorResponse.NOT_FOUND(res, "Currency");
      return;
    }

    //RETURN THE RESPONSE
    SuccessResponse.DELETE(res);
  } catch (ex: any) {
    console.log("❌ Error in deleteCurrency:", ex);
    ErrorResponse.UNEXPECTED_ERROR(res);
  }
}
