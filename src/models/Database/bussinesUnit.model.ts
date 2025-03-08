import mongoose, { Schema, Types } from "mongoose";
import { IUser } from "./user.model";

export interface IBussinesUnit extends mongoose.Document {
  name: string;
  description: string;
  owner: Types.ObjectId | IUser;
}

export const BussinesUnitSchema = new Schema<IBussinesUnit>(
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

export const BussinesUnit = mongoose.model<IBussinesUnit>("BussinesUnit", BussinesUnitSchema);