import { Router } from "express";
import { BankingController } from "../controllers/BankingController";

export function createBankingRouter(controller: BankingController): Router {
  const router = Router();

  router.get("/records", controller.getRecordsHandler);
  router.post("/bank", controller.bankSurplusHandler);
  router.post("/apply", controller.applyBankedHandler);

  return router;
}
