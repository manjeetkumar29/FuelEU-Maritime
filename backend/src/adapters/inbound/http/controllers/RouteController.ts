import { Request, Response } from "express";
import {
  GetRoutesUseCase,
  SetBaselineUseCase,
  GetRouteComparisonUseCase,
} from "../../../../core/application/use-cases/RouteUseCases";
import { ok } from "../../../../shared/apiResponse";
import { z } from "zod";

export class RouteController {
  constructor(
    private readonly getRoutes: GetRoutesUseCase,
    private readonly setBaseline: SetBaselineUseCase,
    private readonly getComparison: GetRouteComparisonUseCase,
  ) {}

  getAllRoutes = async (req: Request, res: Response): Promise<void> => {
    const filters = {
      vesselType: req.query.vesselType as string | undefined,
      fuelType: req.query.fuelType as string | undefined,
      year: req.query.year ? Number(req.query.year) : undefined,
    };
    const routes = await this.getRoutes.execute(filters);
    res.json(ok(routes));
  };

  setBaselineRoute = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const route = await this.setBaseline.execute(id);
    res.json(ok(route));
  };

  getRouteComparison = async (_req: Request, res: Response): Promise<void> => {
    const comparison = await this.getComparison.execute();
    res.json(ok(comparison));
  };
}
