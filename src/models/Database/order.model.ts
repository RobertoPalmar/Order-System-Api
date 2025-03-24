import { OrderStatus, OrderType } from "@global/definitions";
import mongoose, { Schema, Types } from "mongoose";
import { IBusinessUnit } from "./businessUnit.model";
import { CustomerSchema, ICustomer } from "./customer.model";
import { UserSchema, IUser } from "./user.model";
import { CurrencySchema, ICurrency } from "./currency.model";
import { IProduct, ProductSchema } from "./product.model";
import { ComponentSchema, IComponent } from "./component.model";

export interface IOrderDetail extends mongoose.Document{
  product: IProduct,
  quantity: number,
  unitPrice: number,
  totalPrice: number,
  extras: IComponent[],
  removed: IComponent[]
}

const OrderDetailSchema = new Schema<IOrderDetail>(
  {
    product: ProductSchema,
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    extras: [ComponentSchema],
    removed: [ComponentSchema],
  },
  { timestamps: true }
);

export interface IOrder extends mongoose.Document{
  code: string,
  description: string,
  status: OrderStatus,
  type: OrderType,
  businessUnit: Types.ObjectId | IBusinessUnit,
  customer: ICustomer,
  owner: IUser,
  amount: number,
  currency: ICurrency,
  details: IOrderDetail[]
}

const OrderSchema = new Schema<IOrder>(
  {
    code: {type: String, required: true},
    description: {type: String, required: true},
    status: {
      type: Number,
      enum: Object.values(OrderStatus),
      required: true
    },
    type: {
      type: Number,
      enum: Object.values(OrderType),
      required: true
    },
    businessUnit: {
      type: Schema.Types.ObjectId,
      ref: "BusinessUnit",
      required: true
    },
    customer: CustomerSchema,
    owner: UserSchema,
    amount: {type: Number, required: true},
    currency: CurrencySchema,
    details: [OrderDetailSchema]
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>("Order", OrderSchema);