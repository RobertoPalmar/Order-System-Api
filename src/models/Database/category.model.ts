import mongoose, { mongo, Schema, Types } from "mongoose";
import { IBusinessUnit } from "./businessUnit.model";

export interface ICategory extends mongoose.Document {
  name: string, 
  description: string, 
  businessUnit: Types.ObjectId | IBusinessUnit
}

export const CategorySchema = new Schema<ICategory>(
  {
    name: {type: String, required: true},
    description: {type: String, required: true},
    businessUnit:{
      type: Schema.Types.ObjectId,
      ref: "BusinessUnit",
      required: true
    }
  },
  { timestamps: true}
)

export const Category = mongoose.model<ICategory>("Category", CategorySchema);