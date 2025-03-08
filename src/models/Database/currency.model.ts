import mongoose, { Schema, Types } from "mongoose";
import { IBussinesUnit } from "./bussinesUnit.model";

export interface ICurrency extends mongoose.Document {
  name: string;
  ISO: string;
  symbol: string;
  ExchangeRate: number;
  Main: boolean;
  BussinesUnit: Types.ObjectId | IBussinesUnit;
}

export const CurrencySchema = new Schema<ICurrency>(
  {
    name: { type: String, required: true },
    ISO: { type: String, required: true },
    symbol: { type: String, required: true },
    ExchangeRate: { type: Number, required: true },
    Main: { type: Boolean, required: true },
    BussinesUnit: {
      type: Schema.Types.ObjectId,
      ref: "BussinesUnit",
      required: true,
    },
  },
  { timestamps: true }
);

export const Currency = mongoose.model<ICurrency>("Currency",CurrencySchema);
