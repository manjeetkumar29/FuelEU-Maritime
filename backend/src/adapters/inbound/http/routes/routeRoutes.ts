import { Router } from "express";
import { RouteController } from "../controllers/RouteController";

export function createRouteRouter(controller: RouteController): Router {
  const router = Router();

  router.get("/", controller.getAllRoutes);
  router.get("/comparison", controller.getRouteComparison);
  router.post("/:id/baseline", controller.setBaselineRoute);

  return router;
}
