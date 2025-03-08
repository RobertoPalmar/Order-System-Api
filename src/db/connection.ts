// import { MongoClient, ServerApiVersion } from "mongodb";
// import mongoose from "mongoose";

// const uri: string = process.env.MONGO_ATLAS_URI || "";
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// });

// async function run() {
//   try {
//     await client.connect();
//     await client.db("admin").command({ ping: 1 });
//     console.log("📦 MongoDB connected successfully");
//   } finally {
//     await client.close();
//   }
// }

// export {
//   run
// };

// mongoose.Promise = Promise;
// mongoose.connect(uri);
// mongoose.connection.on("error", (error:Error) => console.log(error));

// export default mongoose;

import mongoose from "mongoose";
import { MONGODB_URI } from "@global/config";

mongoose.connect(MONGODB_URI)
  .then(() => console.log("📦 Database is connected"))
  .catch((error) => console.error(error.message));