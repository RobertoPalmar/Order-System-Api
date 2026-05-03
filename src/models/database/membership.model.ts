import mongoose, { Schema, Types } from "mongoose";
import { UserRole } from "@global/definitions";
import { IUser } from "./user.model";
import { IBusinessUnit } from "./businessUnit.model";

export interface IMembership extends mongoose.Document {
  user: Types.ObjectId | IUser;
  businessUnit: Types.ObjectId | IBusinessUnit;
  role: UserRole;
  status: boolean;
}

const userRoleValues: UserRole[] = Object.values(UserRole).filter(
  (v) => typeof v === "number"
) as UserRole[];

export const MembershipSchema = new Schema<IMembership>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    businessUnit: { type: Schema.Types.ObjectId, ref: "BusinessUnit", required: true },
    role: {
      type: Number,
      enum: { values: userRoleValues, message: "{VALUE} is not a valid role" },
      required: true,
    },
    status: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

MembershipSchema.index({ user: 1, businessUnit: 1 }, { unique: true });

export const Membership = mongoose.model<IMembership>("Membership", MembershipSchema);
