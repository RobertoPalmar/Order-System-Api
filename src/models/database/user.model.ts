import mongoose, { Schema } from "mongoose";

export interface IUser extends mongoose.Document{
  name: string,
  email: string,
  password: string,
  status: boolean,
  validBusinessUnit: number,
  tokenVersion: number,
  isSuperAdmin: boolean
}

export const UserSchema = new Schema<IUser>(
  {
    name: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    status: {type: Boolean, required: true},
    validBusinessUnit: {type: Number, default: 1},
    tokenVersion: {type: Number, default: 0, required: true},
    isSuperAdmin: {type: Boolean, default: false, required: true}
  },
  {timestamps: true}
);

export const User = mongoose.model<IUser>("User", UserSchema);
