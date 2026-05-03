import mongoose, { Schema } from "mongoose";

// Atomic per-scope counter used to generate sequential codes (orders, etc.).
// _id is a free-form scope key (e.g. `order:<businessUnitID>`); seq is bumped
// via $inc within findOneAndUpdate, which is atomic in MongoDB.
export interface ICounter extends mongoose.Document {
  _id: string;
  seq: number;
}

const CounterSchema = new Schema<ICounter>(
  {
    _id: { type: String, required: true },
    seq: { type: Number, required: true, default: 0 },
  },
  { versionKey: false }
);

export const Counter = mongoose.model<ICounter>("Counter", CounterSchema);

export const nextOrderCode = async (
  businessUnitID: string
): Promise<string> => {
  const doc = await Counter.findOneAndUpdate(
    { _id: `order:${businessUnitID}` },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  return String(doc.seq).padStart(8, "0");
};
