import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import "express-async-errors";
import { PrismaClient } from "@prisma/client";
import { ZodError } from "zod";
import { buildContainer } from "./container";
import { createRouteRouter } from "../../adapters/inbound/http/routes/routeRoutes";
import { createComplianceRouter } from "../../adapters/inbound/http/routes/complianceRoutes";
import { createBankingRouter } from "../../adapters/inbound/http/routes/bankingRoutes";
import { createPoolRouter } from "../../adapters/inbound/http/routes/poolRoutes";
import { AppError } from "../../shared/errors";
import { fail } from "../../shared/apiResponse";

export function createApp(prisma: PrismaClient): Application {
  const app = express();

  app.use(cors());
  app.use(express.json());

  const {
    routeController,
    complianceController,
    bankingController,
    poolController,
  } = buildContainer(prisma);

  app.use("/routes", createRouteRouter(routeController));
  app.use("/compliance", createComplianceRouter(complianceController));
  app.use("/banking", createBankingRouter(bankingController));
  app.use("/pools", createPoolRouter(poolController));

  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  // Global error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ZodError) {
      res
        .status(400)
        .json(
          fail(err.errors.map((e) => e.message).join(", "), "VALIDATION_ERROR"),
        );
      return;
    }
    if (err instanceof AppError) {
      res.status(err.statusCode).json(fail(err.message, err.code));
      return;
    }
    console.error("Unhandled error:", err);
    res.status(500).json(fail("Internal server error", "INTERNAL_ERROR"));
  });

  return app;
}
