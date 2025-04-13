import { Expose, Type } from "class-transformer";
import { BusinessUnitDTOOut } from "./businessUnit.DTO";
import { IsBoolean, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CurrencyDTOIn {
  @IsString() name!: string;
  @IsString() ISO!: string;
  @IsString() symbol!: string;
  @IsNumber() @Min(0) exchangeRate!: number;
  @IsBoolean() main: boolean = false;
}

export class PartialCurrencyDTOIn {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() ISO?: string;
  @IsOptional() @IsString() symbol?: string;
  @IsOptional() @IsNumber() @Min(0) exchangeRate?: number;
  @IsOptional() @IsBoolean() main?: boolean;
}

export class CurrencyDTOOut {
  @Expose() id: string;
  @Expose() name: string;
  @Expose() ISO: string;
  @Expose() symbol: string;
  @Expose() exchangeRate: number;
  @Expose() main: boolean;
  @Expose() @Type(()=> BusinessUnitDTOOut) businessUnit: BusinessUnitDTOOut;

  constructor(
    id: string,
    name:string,
    ISO:string,
    symbol:string,
    exchangeRate:number,
    main:boolean,
    businessUnit:BusinessUnitDTOOut
  ){
    this.id = id;
    this.name = name;
    this.ISO = ISO;
    this.symbol = symbol;
    this.exchangeRate = exchangeRate;
    this.main = main;
    this.businessUnit = businessUnit;
  }
}
