import mongoose, { Schema, Types } from "mongoose";
import { IBussinesUnit } from "./bussinesUnit.model";
import { ICategory } from "./category.model";

export interface IProductionArea extends mongoose.Document{
  name: string,
  description: string,
  status: boolean,
  bussinesUnit: Types.ObjectId | IBussinesUnit,
  preferredCategory: Types.ObjectId | ICategory,
}

export const ProductionAreaSchema = new mongoose.Schema<IProductionArea>(
  {
    name: {type:String, required: true},
    description: {type:String, required: true},
    status: {type:Boolean, required: true},
    bussinesUnit:{
      type: Schema.Types.ObjectId,
      ref: "BussinesUnit",
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