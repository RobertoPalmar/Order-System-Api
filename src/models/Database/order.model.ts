import { OrderStatus, OrderType } from "@global/definitions";
import mongoose, { Schema, Types } from "mongoose";
import { IBusinessUnit } from "./businessUnit.model";
import {  ICustomer } from "./customer.model";
import {  IUser } from "./user.model";
import {  ICurrency } from "./currency.model";
import { IProduct, } from "./product.model";
import {  IComponent } from "./component.model";

export interface IOrderDetail extends mongoose.Document {
  product: IProduct;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  extras: IComponent[];
  removed: IComponent[];
}

export interface OrderDetail {
  product: IProduct;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  extras: IComponent[] | Types.ObjectId[];
  removed: IComponent[] | Types.ObjectId[];
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

const OrderDetailSchema = new Schema<IOrderDetail>(
  {
    product: MinimalProductSchema,
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    extras: [MinimalComponentSchema],
    removed: [MinimalComponentSchema],
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
}

//DEFINE ORDER ENUMS VALUES
const orderStatusValues: OrderStatus[] = Object.values(OrderStatus).filter(
  (value) => typeof value === "number"
);
const orderTypeValues: OrderType[] = Object.values(OrderType).filter(
  (value) => typeof value === "number"
);

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
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>("Order", OrderSchema);
