import express, { Express, Request, Response } from "express";
import pkg from "../package.json";
import businessUnitRoutes from "@routes/bussinesUnit.routes"
import productRoutes from "@routes/products.routes";
import authRoutes from "@routes/auth.routes";
import categoryRoutes from "@routes/category.routes"
import currencyRoutes from "@routes/currency.routes"
import componentRoutes from "@routes/component.routes"
import customerRoutes from "@routes/customer.routes"
import userRoutes from "@routes/user.routes"
import productionAreaRoutes from "@routes/productionArea.routes"
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
app.use("/Auth", authRoutes);
app.use("/BusinessUnit", businessUnitRoutes)
app.use("/Products", productRoutes);
app.use("/Categories",categoryRoutes)
app.use("/Currencies",currencyRoutes)
app.use("/Components",componentRoutes)
app.use("/Customers",customerRoutes)
app.use("/Users",userRoutes)
app.use("/ProductionAreas",productionAreaRoutes)

export default app;
