import {
  ItemStatus,
  OrderStatus,
  OrderType,
  PaymentMethod,
} from "@global/definitions";
import mongoose, { Schema, Types } from "mongoose";
import { IBusinessUnit } from "./businessUnit.model";
import {  ICustomer } from "./customer.model";
import {  IUser } from "./user.model";
import {  ICurrency } from "./currency.model";
import { IProduct, } from "./product.model";
import {  IComponent } from "./component.model";
import { IProductionArea } from "./productionArea.model";

export interface IMinimalProductionArea {
  _id: string;
  name: string;
}

export interface IOrderDetail extends mongoose.Document {
  product: IProduct;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  extras: IComponent[];
  removed: IComponent[];
  notes?: string;
  itemStatus: ItemStatus;
  productionArea?: IMinimalProductionArea;
}

export interface OrderDetail {
  product: IProduct;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  extras: IComponent[] | Types.ObjectId[];
  removed: IComponent[] | Types.ObjectId[];
  notes?: string;
  itemStatus?: ItemStatus;
  productionArea?: IMinimalProductionArea;
}

const MinimalCustomerSchema = new Schema({
  _id: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  documentID: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
});

const MinimalUserSchema = new Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
});

const MinimalCurrencySchema = new Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  ISO: { type: String, required: true },
  symbol: { type: String, required: true },
  exchangeRate: { type: Number, required: true },
});

const MinimalProductSchema = new Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
});

const MinimalComponentSchema = new Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
});

const MinimalProductionAreaSchema = new Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
});

//DEFINE ITEM STATUS ENUM VALUES
const itemStatusValues: ItemStatus[] = Object.values(ItemStatus).filter(
  (value) => typeof value === "number"
) as ItemStatus[];

const OrderDetailSchema = new Schema<IOrderDetail>(
  {
    product: MinimalProductSchema,
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    extras: [MinimalComponentSchema],
    removed: [MinimalComponentSchema],
    notes: { type: String },
    itemStatus: {
      type: Number,
      enum: {
        values: itemStatusValues,
        message: "{VALUE} is not a valid item status",
      },
      default: ItemStatus.PENDING,
    },
    productionArea: MinimalProductionAreaSchema,
  },
  { timestamps: true }
);

export interface IOrder extends mongoose.Document {
  code: string;
  description: string;
  status: OrderStatus;
  type: OrderType;
  businessUnit: Types.ObjectId | IBusinessUnit;
  customer: ICustomer;
  owner: IUser;
  amount: number;
  currency: ICurrency;
  details: IOrderDetail[];
  tableNumber?: string;
  partySize?: number;
  notes?: string;
  discountAmount: number;
  tipAmount: number;
  paymentMethod: PaymentMethod | null;
  paidAt: Date | null;
  closedAt: Date | null;
}

//DEFINE ORDER ENUMS VALUES
const orderStatusValues: OrderStatus[] = Object.values(OrderStatus).filter(
  (value) => typeof value === "number"
);
const orderTypeValues: OrderType[] = Object.values(OrderType).filter(
  (value) => typeof value === "number"
);

const paymentMethodValues: PaymentMethod[] = Object.values(PaymentMethod).filter(
  (value) => typeof value === "string"
) as PaymentMethod[];

const OrderSchema = new Schema<IOrder>(
  {
    code: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: Number,
      enum: {
        values: orderStatusValues,
        message: "{VALUE} is not a valid status",
      },
      required: true,
    },
    type: {
      type: Number,
      enum: {
        values: orderTypeValues,
        message: "{VALUE} is not a valid type",
      },
      required: true,
    },
    businessUnit: {
      type: Schema.Types.ObjectId,
      ref: "BusinessUnit",
      required: true,
    },
    customer: MinimalCustomerSchema,
    owner: MinimalUserSchema,
    amount: { type: Number, required: true },
    currency: MinimalCurrencySchema,
    details: [OrderDetailSchema],
    tableNumber: { type: String },
    partySize: { type: Number, min: 1 },
    notes: { type: String },
    discountAmount: { type: Number, default: 0, min: 0 },
    tipAmount: { type: Number, default: 0, min: 0 },
    paymentMethod: {
      type: String,
      enum: {
        values: paymentMethodValues,
        message: "{VALUE} is not a valid payment method",
      },
      default: null,
    },
    paidAt: { type: Date, default: null },
    closedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Compound indexes for common mobile queries
OrderSchema.index({ businessUnit: 1, status: 1, createdAt: -1 });
OrderSchema.index({ businessUnit: 1, tableNumber: 1, status: 1 });
OrderSchema.index({ businessUnit: 1, "details.productionArea._id": 1, "details.itemStatus": 1 });

export const Order = mongoose.model<IOrder>("Order", OrderSchema);
