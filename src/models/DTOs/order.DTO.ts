import {
  ItemStatus,
  OrderStatus,
  OrderType,
  PaymentMethod,
} from "@global/definitions";
import { Expose, Type } from "class-transformer";
import {
  IsArray,
  IsDate,
  IsDecimal,
  IsEnum,
  IsMongoId,
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

// Minimal production area DTO embedded inside an OrderDetail. Kept local to
// this file because the order snapshot only needs id + name — the full
// ProductionAreaDTOOut carries references (businessUnit, categories) that do
// not belong in the embedded order document.
export class MinimalProductionAreaDTOOut {
  @Expose() id: string;
  @Expose() name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}

export class OrderDetailDTOIn {
  @IsString() product!: string;
  @IsNumber() @Min(1) quantity!: number;
  @IsString({ each: true }) extras: string[] = [];
  @IsString({ each: true }) removed: string[] = [];
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsEnum(ItemStatus) itemStatus?: ItemStatus;
  @IsOptional() @IsString() productionArea?: string;
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

  // NEW fields (all optional for backward-compat with existing clients)
  @IsOptional() @IsString() tableNumber?: string;
  @IsOptional() @IsNumber() @Min(1) partySize?: number;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsNumber() @Min(0) discountAmount?: number;
  @IsOptional() @IsNumber() @Min(0) tipAmount?: number;
  @IsOptional() @IsEnum(PaymentMethod) paymentMethod?: PaymentMethod;
  @IsOptional() @IsDate() @Type(() => Date) paidAt?: Date;
  @IsOptional() @IsDate() @Type(() => Date) closedAt?: Date;
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

  // NEW fields
  @IsOptional() @IsString() tableNumber?: string;
  @IsOptional() @IsNumber() @Min(1) partySize?: number;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsNumber() @Min(0) discountAmount?: number;
  @IsOptional() @IsNumber() @Min(0) tipAmount?: number;
  @IsOptional() @IsEnum(PaymentMethod) paymentMethod?: PaymentMethod;
  @IsOptional() @IsDate() @Type(() => Date) paidAt?: Date;
  @IsOptional() @IsDate() @Type(() => Date) closedAt?: Date;
}

export class OrderDetailDTOOut {
  @Expose() product: ProductDTOOut;
  @Expose() quantity: number;
  @Expose() unitPrice: number;
  @Expose() totalPrice: number;
  @Expose() extras: ComponentDTOOut[];
  @Expose() removed: ComponentDTOOut[];
  @Expose() notes?: string;
  @Expose() itemStatus: ItemStatus;
  @Expose() @Type(() => MinimalProductionAreaDTOOut)
  productionArea?: MinimalProductionAreaDTOOut;

  constructor(
    product: ProductDTOOut,
    quantity: number,
    unitPrice: number,
    totalPrice: number,
    extras: ComponentDTOOut[],
    removed: ComponentDTOOut[],
    itemStatus: ItemStatus = ItemStatus.PENDING,
    notes?: string,
    productionArea?: MinimalProductionAreaDTOOut
  ) {
    this.product = product;
    this.quantity = quantity;
    this.unitPrice = unitPrice;
    this.totalPrice = totalPrice;
    this.extras = extras;
    this.removed = removed;
    this.itemStatus = itemStatus;
    this.notes = notes;
    this.productionArea = productionArea;
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

  // NEW fields — MUST have @Expose() or the mapper will drop them
  @Expose() tableNumber?: string;
  @Expose() partySize?: number;
  @Expose() notes?: string;
  @Expose() discountAmount: number;
  @Expose() tipAmount: number;
  @Expose() paymentMethod: PaymentMethod | null;
  @Expose() paidAt: Date | null;
  @Expose() closedAt: Date | null;

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
    businessUnit: BusinessUnitDTOOut,
    discountAmount: number = 0,
    tipAmount: number = 0,
    paymentMethod: PaymentMethod | null = null,
    paidAt: Date | null = null,
    closedAt: Date | null = null,
    tableNumber?: string,
    partySize?: number,
    notes?: string
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
    this.discountAmount = discountAmount;
    this.tipAmount = tipAmount;
    this.paymentMethod = paymentMethod;
    this.paidAt = paidAt;
    this.closedAt = closedAt;
    this.tableNumber = tableNumber;
    this.partySize = partySize;
    this.notes = notes;
  }
}

//------------------------------------------------------------//
// ACTION DTOs — consumed by the 8 new endpoints in batch S5. //
// Kept in this file (not a separate order.actions.DTO.ts) to //
// match the existing one-file-per-entity convention. Move to //
// a sub-file if this list grows beyond ~10 DTOs.             //
//------------------------------------------------------------//

/** PATCH /Orders/:id/status — change the order-level status. */
export class ChangeOrderStatusDTOIn {
  @IsEnum(OrderStatus) status!: OrderStatus;
}

/** POST /Orders/:id/items — append a new line item to an existing order. */
export class AddOrderItemDTOIn {
  @IsMongoId() productID!: string;
  @IsNumber() @Min(1) quantity!: number;
  @IsOptional() @IsArray() @IsMongoId({ each: true }) extras?: string[];
  @IsOptional() @IsArray() @IsMongoId({ each: true }) removed?: string[];
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() productionArea?: string;
}

/** PATCH /Orders/:id/items/:itemId/status — cocina/mesero mueven el ítem. */
export class UpdateItemStatusDTOIn {
  @IsEnum(ItemStatus) status!: ItemStatus;
}

/** PATCH /Orders/:id/discount — aplicar descuento monetario a la orden. */
export class ApplyDiscountDTOIn {
  @IsNumber() @Min(0) discountAmount!: number;
  @IsOptional() @IsString() reason?: string;
}

/** POST /Orders/:id/close — cobrar y cerrar la orden (COMPLETED -> CLOSED). */
export class CloseOrderDTOIn {
  @IsEnum(PaymentMethod) paymentMethod!: PaymentMethod;
  @IsOptional() @IsNumber() @Min(0) tipAmount?: number;
}
