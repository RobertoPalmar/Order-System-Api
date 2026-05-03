import mongoose, { Schema, Types } from "mongoose";
import { IBusinessUnit } from "./businessUnit.model";
import { ICurrency } from "./currency.model";

export interface IExtra {
  price: number;
  currency: Types.ObjectId | ICurrency;
}

export interface IComponent extends mongoose.Document {
  name: string;
  description?: string;
  image?: string;
  status?: boolean;
  businessUnit: Types.ObjectId | IBusinessUnit;
  extra?: IExtra;
}

const ExtraSchema = new Schema<IExtra>(
  {
    price: { type: Number, required: true, min: 0 },
    currency: {
      type: Schema.Types.ObjectId,
      ref: "Currency",
      required: true,
    },
  },
  { _id: false }
);

export const ComponentSchema = new Schema<IComponent>(
  {
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    status: { type: Boolean, default: true },
    businessUnit: {
      type: Schema.Types.ObjectId,
      ref: "BusinessUnit",
      required: true,
    },
    extra: { type: ExtraSchema, required: false },
  },
  { timestamps: true }
);

export const Component = mongoose.model<IComponent>(
  "Component",
  ComponentSchema
);
