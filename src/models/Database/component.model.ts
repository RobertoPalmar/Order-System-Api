import mongoose, { Schema, Types } from "mongoose";
import { ComponentType } from "@global/definitions";
import { IBusinessUnit } from "./businessUnit.model";
import { ICurrency } from "./currency.model";

export interface IComponent extends mongoose.Document {
  name: string;
  description: string;
  image: string;
  type: ComponentType;
  status: boolean;
  businessUnit: Types.ObjectId | IBusinessUnit;
  priceAsExtra: number;
  currency: Types.ObjectId | ICurrency;
}

//DEFINE ROLE ENUMS VALUES
const componentTypeValues: ComponentType[] = Object.values(
  ComponentType
).filter((value) => typeof value === "number");

export const ComponentSchema = new Schema<IComponent>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    type: {
      type: Number,
      enum: {
        values: componentTypeValues,
        message: "{VALUE} is not a valid type",
      },
      required: true,
    },
    status: { type: Boolean, required: true },
    businessUnit: {
      type: Schema.Types.ObjectId,
      ref: "BusinessUnit",
      required: true,
    },
    priceAsExtra: Number,
    currency: {
      type: Schema.Types.ObjectId,
      ref: "Currency",
      required: true,
    },
  },
  { timestamps: true }
);

export const Component = mongoose.model<IComponent>(
  "Component",
  ComponentSchema
);
