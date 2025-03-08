import mongoose, { mongo, Schema, Types } from "mongoose";
import { IBussinesUnit } from "./bussinesUnit.model";

export interface ICategory extends mongoose.Document {
  name: string, 
  description: string, 
  bussinesUnit: Types.ObjectId | IBussinesUnit
}

export const CategorySchema = new Schema<ICategory>(
  {
    name: {type: String, required: true},
    description: {type: String, required: true},
    bussinesUnit:{
      type: Schema.Types.ObjectId,
      ref: "BussinesUnit",
      required: true
    }
  },
  { timestamps: true}
)

export const Category = mongoose.model<ICategory>("Category", CategorySchema);