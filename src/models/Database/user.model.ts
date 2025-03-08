import mongoose, { Schema } from "mongoose";
import { UserRole } from "@global/definitions";
import bcrypt from "bcryptjs";

export interface IUser extends mongoose.Document{
  name: string,
  email: string,
  password: string,
  role: UserRole,
  status: boolean,
}

//DEFINE ROLE ENUMS VALUES
const userRoleValues: UserRole[] = Object.values(UserRole).filter(value => typeof value === 'number');

export const UserSchema = new Schema<IUser>(
  {
    name: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    role: {
      type: Number, 
      enum: {
        values: userRoleValues,
        message: '{VALUE} is not a valid role'
      },
      required: true
    },
    status: {type: Boolean, required: true}
  },
  {timestamps: true}
);

export const User = mongoose.model<IUser>("User", UserSchema);
