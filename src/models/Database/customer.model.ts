import mongoose, { mongo, Schema, Types } from "mongoose";
import { IBussinesUnit } from "./bussinesUnit.model";

export interface ICustomer extends mongoose.Document{
  firstName: string,
  lastName: string,
  documentID: string,
  email: string,
  phone: string,
  bussinesUnit: Types.ObjectId | IBussinesUnit
}

export const CustomerSchema = new mongoose.Schema<ICustomer>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    documentID: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    bussinesUnit: {
      type: Schema.Types.ObjectId,
      ref: "BussinesUnit",
      required: true,
    },
  },
  { timestamps: true }
)

export const Customer = mongoose.model<ICustomer>("Customer", CustomerSchema); 