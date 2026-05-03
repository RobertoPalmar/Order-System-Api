import { Expose, Type } from "class-transformer";
import { CurrencyDTOOut } from "./currency.DTO";
import { BusinessUnitDTOOut } from "./businessUnit.DTO";
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";

export class ExtraDTOIn {
  @IsNumber() @Min(0) price!: number;
  @IsString() currency!: string;
}

export class ComponentDTOIn {
  @IsString() name!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsBoolean() status?: boolean;
  @IsOptional() @ValidateNested() @Type(() => ExtraDTOIn) extra?: ExtraDTOIn;
}

export class PartialComponentDTOIn {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsBoolean() status?: boolean;
  @IsOptional() @ValidateNested() @Type(() => ExtraDTOIn) extra?: ExtraDTOIn;
}

export class ExtraDTOOut {
  @Expose() price: number;
  @Expose() @Type(() => CurrencyDTOOut) currency: CurrencyDTOOut;

  constructor(price: number = 0, currency: CurrencyDTOOut) {
    this.price = price;
    this.currency = currency;
  }
}

export class ComponentDTOOut {
  @Expose() id: string;
  @Expose() name: string;
  @Expose() description?: string;
  @Expose() image?: string;
  @Expose() status?: boolean;
  @Expose() @Type(() => ExtraDTOOut) extra?: ExtraDTOOut;
  @Expose() @Type(() => BusinessUnitDTOOut) businessUnit: BusinessUnitDTOOut;

  constructor(
    id: string = "",
    name: string = "",
    businessUnit: BusinessUnitDTOOut,
    description?: string,
    image?: string,
    status?: boolean,
    extra?: ExtraDTOOut
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.image = image;
    this.status = status;
    this.extra = extra;
    this.businessUnit = businessUnit;
  }
}
