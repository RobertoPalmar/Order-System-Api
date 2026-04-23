import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pkg from "../package.json";
import businessUnitRoutes from "@routes/businessUnit.routes"
import productRoutes from "@routes/products.routes";
import authRoutes from "@routes/auth.routes";
import categoryRoutes from "@routes/category.routes"
import currencyRoutes from "@routes/currency.routes"
import componentRoutes from "@routes/component.routes"
import customerRoutes from "@routes/customer.routes"
import userRoutes from "@routes/user.routes"
import productionAreaRoutes from "@routes/productionArea.routes"
import orderRoutes from "@routes/order.routes"
import { createDataSeed } from "src/database/seeds";
import { ErrorResponse, SuccessResponse } from "@utils/responseHandler.utils";

const app: Express = express();
createDataSeed();

//CONFIGURATIONS
app.use(express.json());
app.set("pkg", pkg);

//SECURITY MIDDLEWARES
app.use(helmet());
app.use(cors({ origin: "*" }));

//RATE LIMITERS
const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    ErrorResponse.RATE_LIMIT_EXCEEDED(res, 60);
  },
});

const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    ErrorResponse.RATE_LIMIT_EXCEEDED(res, 60);
  },
});

app.use(globalRateLimiter);

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
app.use("/Auth", authRateLimiter, authRoutes);
app.use("/BusinessUnit", businessUnitRoutes)
app.use("/Products", productRoutes);
app.use("/Categories",categoryRoutes)
app.use("/Currencies",currencyRoutes)
app.use("/Components",componentRoutes)
app.use("/Customers",customerRoutes)
app.use("/Users",userRoutes)
app.use("/ProductionAreas",productionAreaRoutes)
app.use("/Orders",orderRoutes)

export default app;
