import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import path from "path";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
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
import membershipRoutes from "@routes/membership.routes"
import { swaggerOptions } from "src/docs/swagger";
import { createDataSeed } from "src/database/seeds";
import { ErrorResponse, SuccessResponse } from "@utils/responseHandler.utils";
import { errorHandler } from "src/middlewares/errorHandler.middleware";

const app: Express = express();
if (process.env.NODE_ENV !== "production") {
  createDataSeed();
}

//CONFIGURATIONS
app.use(express.json());
app.set("pkg", pkg);

//SECURITY MIDDLEWARES
app.use(helmet());
const allowedOrigins = (process.env.CORS_ORIGINS ?? "").split(",").map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // apps móviles nativas no mandan Origin
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`Origin not allowed: ${origin}`));
  },
  credentials: true,
}));

//OPENAPI / SWAGGER DOCS
// Mounted BEFORE the global rate limiter so the docs UI (which fetches
// /openapi.json plus static assets on every page load) does not consume
// the 100 req/min global budget intended for API traffic.
const openapiSpec = swaggerJsdoc(swaggerOptions);
app.get("/openapi.json", (_req: Request, res: Response) => {
  res.json(openapiSpec);
});
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(openapiSpec, {
    customSiteTitle: "Order System API — Docs",
    swaggerOptions: { persistAuthorization: true },
  })
);

//RATE LIMITERS
const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    try {
      const header = req.headers.authorization;
      if (header?.startsWith("Bearer ")) {
        const token = header.slice(7);
        const decoded = jwt.decode(token) as { userID?: string } | null;
        if (decoded?.userID) return `user:${decoded.userID}`;
      }
    } catch {}
    // FALLBACK: IP — imita el comportamiento default de express-rate-limit
    return req.ip ?? "unknown";
  },
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

// STATIC FILE SERVING — mounted BEFORE globalRateLimiter so image requests
// from the mobile menu catalogue do not consume the 100 req/min API budget.
app.use("/static", express.static(path.join(process.cwd(), "uploads")));

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

//HEALTH CHECK
app.get("/health", (_req: Request, res: Response) => {
  const mongoState = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.status(mongoState === "connected" ? 200 : 503).json({
    status: mongoState === "connected" ? "ok" : "degraded",
    mongo: mongoState,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

//IMPORT ROUTES — all under /v1 prefix
const v1 = express.Router();
v1.use("/Auth", authRateLimiter, authRoutes);
v1.use("/BusinessUnit", businessUnitRoutes);
v1.use("/BusinessUnit/:businessUnitID/members", membershipRoutes);
v1.use("/Products", productRoutes);
v1.use("/Categories", categoryRoutes);
v1.use("/Currencies", currencyRoutes);
v1.use("/Components", componentRoutes);
v1.use("/Customers", customerRoutes);
v1.use("/Users", userRoutes);
v1.use("/ProductionAreas", productionAreaRoutes);
v1.use("/Orders", orderRoutes);
app.use("/v1", v1);

//GLOBAL ERROR HANDLER
// Must be registered LAST, after all routes, so thrown errors / next(err)
// calls from any handler bubble into the standard response envelope via
// ErrorResponse.*. See src/middlewares/errorHandler.middleware.ts.
app.use(errorHandler);

export default app;
