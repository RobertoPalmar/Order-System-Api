import { Expose, Type } from "class-transformer";
import { CurrencyDTOOut } from "./currency.DTO";
import { ComponentType } from "@global/definitions";
import { BusinessUnitDTOOut } from "./businessUnit.DTO";
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class ComponentDTOIn {
  @IsString() name!: string;
  @IsString() description!: string;
  @IsString() image!: string;
  @IsEnum(ComponentType) type!: ComponentType;
  @IsBoolean() status: boolean = true;
  @IsNumber() @Min(0) priceAsExtra!: number;
  @IsString() currency!: string;
}

export class PartialComponentDTOIn {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsEnum(ComponentType) type?: ComponentType;
  @IsOptional() @IsBoolean() status?: boolean;
  @IsOptional() @IsNumber() @Min(0) priceAsExtra?: number;
  @IsOptional() @IsString() currency?: string;
}

export class ComponentDTOOut {
  @Expose() id: string;
  @Expose() name: string;
  @Expose() description: string;
  @Expose() image: string;
  @Expose() type: ComponentType
  @Expose() status: boolean;
  @Expose() priceAsExtra:number;
  @Expose() @Type(()=> CurrencyDTOOut) currency: CurrencyDTOOut
  @Expose() @Type(() => BusinessUnitDTOOut) businessUnit: BusinessUnitDTOOut;


  constructor(
    id: string = "",
    name: string = "",
    description: string = "",
    image: string = "",
    type:ComponentType,
    status: boolean = false,
    priceAsExtra:number,
    currency:CurrencyDTOOut,
    businessUnit:BusinessUnitDTOOut
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.image = image;
    this.type = type;
    this.status = status;
    this.priceAsExtra = priceAsExtra;
    this.currency = currency;
    this.businessUnit = businessUnit;
  }
}
