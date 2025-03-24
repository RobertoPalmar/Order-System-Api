import mongoose, { Schema, Types } from "mongoose";
import { IBusinessUnit } from "./businessUnit.model";
import { ICategory } from "./category.model";

export interface IProductionArea extends mongoose.Document{
  name: string,
  description: string,
  status: boolean,
  businessUnit: Types.ObjectId | IBusinessUnit,
  preferredCategory: Types.ObjectId | ICategory,
}

export const ProductionAreaSchema = new mongoose.Schema<IProductionArea>(
  {
    name: {type:String, required: true},
    description: {type:String, required: true},
    status: {type:Boolean, required: true},
    businessUnit:{
      type: Schema.Types.ObjectId,
      ref: "BusinessUnit",
      required: true
    },
    preferredCategory: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: false
    }
  },
  { timestamps: true }
);

export const ProductionArea = mongoose.model<IProductionArea>("ProductionArea", ProductionAreaSchema);