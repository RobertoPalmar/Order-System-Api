import mongoose, { Schema, Types } from "mongoose";
import { IComponent } from "./component.model";
import { ICategory } from "./category.model";
import { ICurrency } from "./currency.model";
import { IBussinesUnit } from "./bussinesUnit.model";
import { IProductionArea } from "./productionArea.model";

export interface IProduct extends mongoose.Document {
  name: string;
  description: string;
  image: string;
  category: Types.ObjectId | ICategory;
  components: IComponent[];
  price: number;
  cost: number;
  currency: Types.ObjectId | ICurrency;
  status: boolean;
  productArea: Types.ObjectId | IProductionArea;
  bussinesUnit: Types.ObjectId | IBussinesUnit;
}

export const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    components: [
      {
        type: Schema.Types.ObjectId,
        ref: "Component",
        required: true,
      },
    ],
    price: { type: Number, required: true },
    cost: { type: Number, required: true },
    currency: {
      type: Schema.Types.ObjectId,
      ref: "Currency",
      required: true,
    },
    status: { type: Boolean, required: true },
    productArea: {
      type: Schema.Types.ObjectId,
      ref: "ProductionArea",
      required: false,
    },
    bussinesUnit: {
      type: Schema.Types.ObjectId,
      ref: "BussinesUnit",
      required: true,
    },
  },
  { timestamps: true }
);

export const Product = mongoose.model<IProduct>("Product", ProductSchema);
