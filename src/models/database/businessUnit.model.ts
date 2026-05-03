import mongoose, { Schema, Types } from "mongoose";
import { IUser } from "./user.model";

export interface IBusinessUnit extends mongoose.Document {
  name: string;
  description: string;
  owner: Types.ObjectId | IUser;
}

export const BusinessUnitSchema = new Schema<IBusinessUnit>(
  {
    name: { type: String, required: true },
    description: { type: String, required: false },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const BusinessUnit = mongoose.model<IBusinessUnit>("BusinessUnit", BusinessUnitSchema);