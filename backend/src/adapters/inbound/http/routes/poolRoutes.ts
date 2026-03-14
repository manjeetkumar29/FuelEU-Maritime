import { Router } from "express";
import { PoolController } from "../controllers/PoolController";

export function createPoolRouter(controller: PoolController): Router {
  const router = Router();

  router.post("/", controller.createPoolHandler);

  return router;
}
