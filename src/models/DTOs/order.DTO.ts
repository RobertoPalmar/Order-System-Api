import { OrderStatus, OrderType } from "@global/definitions";
import { Expose, Transform, Type } from "class-transformer";
import {
  IsDecimal,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { CustomerDTOOut } from "./customer.DTO";
import { UserDTOOut } from "./user.DTO";
import { CurrencyDTOOut } from "./currency.DTO";
import { BusinessUnitDTOOut } from "./businessUnit.DTO";
import { ProductDTOOut } from "./product.DTO";
import { ComponentDTOOut } from "./component.DTO";
import { Console } from "console";

export class OrderDetailDTOIn {
  @IsString() product!: string;
  @IsNumber() @Min(1) quantity!: number;
  @IsString({ each: true }) extras: string[] = [];
  @IsString({ each: true }) removed: string[] = [];
}

export class OrderDTOIn {
  @IsString() code!: string;
  @IsString() description!: string;
  @IsEnum(OrderStatus) status!: OrderStatus;
  @IsEnum(OrderType) type!: OrderType;
  @IsString() customer!: string;
  @IsString() owner!: string;
  @IsNumber() amount!: number;
  @IsString() currency!: string;
  @Type(() => OrderDetailDTOIn) details!: OrderDetailDTOIn[];
}

export class PartialOrderDTOIn {
  @IsOptional() @IsString() code?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsEnum(OrderStatus) status?: OrderStatus;
  @IsOptional() @IsEnum(OrderType) type?: OrderType;
  @IsOptional() @IsString() customer?: string;
  @IsOptional() @IsString() owner?: string;
  @IsOptional() @IsDecimal() amount?: number;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @Type(() => OrderDetailDTOIn) details?: OrderDetailDTOIn[];
}

export class OrderDetailDTOOut {
  @Expose() product: ProductDTOOut;
  @Expose() quantity: number;
  @Expose() unitPrice: number;
  @Expose() totalPrice: number;
  @Expose() extras: ComponentDTOOut[];
  @Expose() removed: ComponentDTOOut[];

  constructor(
    product: ProductDTOOut,
    quantity: number,
    unitPrice: number,
    totalPrice: number,
    extras: ComponentDTOOut[],
    removed: ComponentDTOOut[]
  ) {
    this.product = product;
    this.quantity = quantity;
    this.unitPrice = unitPrice;
    this.totalPrice = totalPrice;
    this.extras = extras;
    this.removed = removed;
  }
}

export class OrderDTOOut {
  @Expose() id: string;
  @Expose() code: string;
  @Expose() description: string;
  @Expose() status: OrderStatus;
  @Expose() type: OrderType;
  @Expose() @Type(() => BusinessUnitDTOOut) businessUnit: BusinessUnitDTOOut;
  @Expose() @Type(() => CustomerDTOOut) customer: CustomerDTOOut;
  @Expose() @Type(() => UserDTOOut) owner: UserDTOOut;
  @Expose() amount: number;
  @Expose() @Type(() => CurrencyDTOOut) currency: CurrencyDTOOut;
  @Expose() @Type(() => OrderDetailDTOOut) details: OrderDetailDTOOut[];

  constructor(
    id: string,
    code: string,
    description: string,
    status: OrderStatus,
    type: OrderType,
    customer: CustomerDTOOut,
    owner: UserDTOOut,
    amount: number,
    currency: CurrencyDTOOut,
    details: OrderDetailDTOOut[],
    businessUnit: BusinessUnitDTOOut
  ) {
    this.id = id;
    this.code = code;
    this.description = description;
    this.status = status;
    this.type = type;
    this.customer = customer;
    this.owner = owner;
    this.amount = amount;
    this.currency = currency;
    this.details = details;
    this.businessUnit = businessUnit;
  }
}
