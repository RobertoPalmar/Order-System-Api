import express, { Express, Request, Response } from "express";
import pkg from "../package.json";
import productRoutes from "@routes/products.routes";
import authRoutes from "@routes/auth.routes";
import { createDataSeed } from "src/database/seeds";
import { SuccessResponse } from "@utils/responseHandler.utils";

const app: Express = express();
createDataSeed();

//CONFIGURATIONS
app.use(express.json());
app.set("pkg", pkg);

//DEFAULT ROUTE
app.get("/", (req: Request, res: Response) => {
  SuccessResponse.INFO(res, {
    name: app.get("pkg").name,
    author: app.get("pkg").author,
    description: app.get("pkg").description,
    version: app.get("pkg").version,
  });
});

//IMPORT ROUTES
app.use("/Products", productRoutes);
app.use("/Auth", authRoutes);

export default app;
