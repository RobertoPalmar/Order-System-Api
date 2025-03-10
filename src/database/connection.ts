import mongoose from "mongoose";
import { MONGODB_URI } from "@global/config";

mongoose.connect(MONGODB_URI)
  .then(() => console.log("📦 Database is connected"))
  .catch((error) => console.error(error.message));