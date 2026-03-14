import { Router } from "express";
import { ComplianceController } from "../controllers/ComplianceController";

export function createComplianceRouter(
  controller: ComplianceController,
): Router {
  const router = Router();

  router.get("/cb", controller.getCB);
  router.get("/adjusted-cb", controller.getAdjustedCB);

  return router;
}
