import { Expose, Type } from "class-transformer";
import { CategoryDTO } from "./category.DTO";
import { ComponentDTO } from "./component.DTO";
import {
  IsArray,
  IsBoolean,
  IsDecimal,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { CurrencyDTO } from "./currency.DTO";

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
  @Expose() @Type(() => CategoryDTO) category: CategoryDTO;
  @Expose() @Type(() => ComponentDTO) components: ComponentDTO[];
  @Expose() price: number;
  @Expose() cost: number;
  @Expose() @Type(() => CurrencyDTO) currency: CurrencyDTO;
  @Expose() status: boolean;
  // productArea: Types.ObjectId | IProductionArea;
  // businessUnit: Types.ObjectId | IBusinessUnit;

  constructor(
    id: string,
    name: string,
    description: string,
    image: string,
    category: CategoryDTO,
    components: ComponentDTO[],
    price: number,
    cost: number,
    currency: CurrencyDTO,
    status: boolean
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
  }
}
