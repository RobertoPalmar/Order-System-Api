import mongoose, { Schema, Types } from "mongoose";
import { IBusinessUnit } from "./businessUnit.model";

export interface ICurrency extends mongoose.Document {
  name: string;
  ISO: string;
  symbol: string;
  exchangeRate: number;
  main: boolean;
  businessUnit: Types.ObjectId | IBusinessUnit;
}

export const CurrencySchema = new Schema<ICurrency>(
  {
    name: { type: String, required: true },
    ISO: { type: String, required: true },
    symbol: { type: String, required: true },
    exchangeRate: { type: Number, required: true },
    main: { type: Boolean, required: true },
    businessUnit: {
      type: Schema.Types.ObjectId,
      ref: "BusinessUnit",
      required: true,
    },
  },
  { timestamps: true }
);

export const Currency = mongoose.model<ICurrency>("Currency",CurrencySchema);
