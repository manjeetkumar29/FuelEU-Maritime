import { Request, Response } from "express";
import {
  ComputeCBUseCase,
  GetAdjustedCBUseCase,
} from "../../../../core/application/use-cases/ComplianceUseCases";
import { ok } from "../../../../shared/apiResponse";
import { z } from "zod";

const computeCBSchema = z.object({
  shipId: z.string().min(1),
  year: z.number().int().min(2020).max(2100),
  actualIntensity: z.number().positive(),
  fuelConsumptionTonnes: z.number().positive(),
});

export class ComplianceController {
  constructor(
    private readonly computeCB: ComputeCBUseCase,
    private readonly getAdjustedCBUseCase: GetAdjustedCBUseCase,
  ) {}

  getCB = async (req: Request, res: Response): Promise<void> => {
    const { shipId, year, actualIntensity, fuelConsumption } = req.query;
    const input = computeCBSchema.parse({
      shipId: String(shipId),
      year: Number(year),
      actualIntensity: Number(actualIntensity),
      fuelConsumptionTonnes: Number(fuelConsumption),
    });
    const result = await this.computeCB.execute(input);
    res.json(ok(result));
  };

  getAdjustedCB = async (req: Request, res: Response): Promise<void> => {
    const { shipId, year } = req.query;
    const result = await this.getAdjustedCBUseCase.execute(
      String(shipId),
      Number(year),
    );
    res.json(ok(result));
  };
}
