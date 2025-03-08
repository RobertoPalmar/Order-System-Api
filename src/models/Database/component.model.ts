import mongoose, { Schema, Types } from "mongoose";
import { ComponentType } from "@global/definitions";
import { IBussinesUnit } from "./bussinesUnit.model";
import { ICurrency } from "./currency.model";

export interface IComponent extends mongoose.Document {
  name: string, 
  description: string, 
  image: string,
  type: ComponentType,
  Status: boolean,
  BussinesUnit: Types.ObjectId | IBussinesUnit,
  PriceAsExtra: number,
  Currency: Types.ObjectId | ICurrency
}

export const ComponentSchema = new Schema<IComponent>(
  {
    name: {type:String, required: true},
    description: {type:String, required: true},
    image: {type:String, required: true},
    type: {
      type: Number,
      enum: Object.values(ComponentType),
      required: true
    },
    Status: { type: Boolean, required: true},
    BussinesUnit: {
      type: Schema.Types.ObjectId,
      ref: "BussinesUnit",
      required: true
    }
  },
  { timestamps: true }
);

export const Component = mongoose.model<IComponent>("Component", ComponentSchema);
