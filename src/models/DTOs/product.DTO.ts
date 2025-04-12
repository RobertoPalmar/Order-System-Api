import { Expose, Type } from "class-transformer";
import { ComponentDTOOut } from "./component.DTO";
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { CurrencyDTOOut } from "./currency.DTO";
import { BusinessUnitDTOOut } from "./businessUnit.DTO";
import { CategoryDTOOut } from "./category.DTO";

export class ProductDTOIn {
  @IsString() name!: string;
  @IsString() description: string = "";
  @IsString() image: string = "";
  @IsString() category!: string;
  @IsString({ each: true }) components!: string[];
  @IsNumber() @Min(0) price: number = 0;
  @IsNumber() @Min(0) cost: number = 0;
  @IsString() currency!: string;
  @IsBoolean() status: boolean = true;
  @IsString() @IsOptional() productArea?: string;
  @IsString() businessUnit!: string;
}

export class PartialProductDTOIn {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString({ each: true }) components?: string[];
  @IsOptional() @IsNumber() @Min(0) price?: number;
  @IsOptional() @IsNumber() @Min(0) cost?: number;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @IsBoolean() status?: boolean;
  @IsOptional() @IsString() productArea?: string;
}

export class ProductDTOOut {
  @Expose() id: string;
  @Expose() name: string;
  @Expose() description: string;
  @Expose() image: string;
  @Expose() @Type(() => CategoryDTOOut) category: CategoryDTOOut;
  @Expose() @Type(() => ComponentDTOOut) components: ComponentDTOOut[];
  @Expose() price: number;
  @Expose() cost: number;
  @Expose() @Type(() => CurrencyDTOOut) currency: CurrencyDTOOut;
  @Expose() status: boolean;
  // productArea: Types.ObjectId | IProductionArea;
  @Expose() @Type(() => BusinessUnitDTOOut) businessUnit: BusinessUnitDTOOut;

  constructor(
    id: string,
    name: string,
    description: string,
    image: string,
    category: CategoryDTOOut,
    components: ComponentDTOOut[],
    price: number,
    cost: number,
    currency: CurrencyDTOOut,
    status: boolean,
    businessUnit:BusinessUnitDTOOut
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.image = image;
    this.category = category;
    this.components = components;
    this.price = price;
    this.cost = cost;
    this.currency = currency;
    this.status = status;
    this.businessUnit = businessUnit;
  }
}
