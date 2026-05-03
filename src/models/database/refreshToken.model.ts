import mongoose, { Schema, Types } from "mongoose";
import { IUser } from "./user.model";

export interface IRefreshToken extends mongoose.Document {
  tokenHash: string;
  user: Types.ObjectId | IUser;
  expiresAt: Date;
  revokedAt?: Date;
  replacedByTokenHash?: string;
  userAgent?: string;
  ip?: string;
}

export const RefreshTokenSchema = new Schema<IRefreshToken>(
  {
    tokenHash: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, required: false },
    replacedByTokenHash: { type: String, required: false },
    userAgent: { type: String, required: false },
    ip: { type: String, required: false },
  },
  { timestamps: true }
);

//TTL INDEX: EXPIRED DOCS ARE AUTO-DELETED BY MONGO WHEN expiresAt PASSES
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
//LOOKUPS BY USER (REUSE-DETECTION REVOKE-ALL)
RefreshTokenSchema.index({ user: 1 });

export const RefreshToken = mongoose.model<IRefreshToken>(
  "RefreshToken",
  RefreshTokenSchema
);
