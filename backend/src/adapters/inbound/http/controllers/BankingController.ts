import { Request, Response } from "express";
import {
  GetBankingRecordsUseCase,
  BankSurplusUseCase,
  ApplyBankedUseCase,
} from "../../../../core/application/use-cases/BankingUseCases";
import { ok } from "../../../../shared/apiResponse";
import { z } from "zod";

const bankSchema = z.object({
  shipId: z.string().min(1),
  year: z.number().int(),
  amount: z.number().positive(),
});

export class BankingController {
  constructor(
    private readonly getRecords: GetBankingRecordsUseCase,
    private readonly bankSurplus: BankSurplusUseCase,
    private readonly applyBanked: ApplyBankedUseCase,
  ) {}

  getRecordsHandler = async (req: Request, res: Response): Promise<void> => {
    const { shipId, year } = req.query;
    const result = await this.getRecords.execute(String(shipId), Number(year));
    res.json(ok(result));
  };

  bankSurplusHandler = async (req: Request, res: Response): Promise<void> => {
    const input = bankSchema.parse(req.body);
    const result = await this.bankSurplus.execute(input);
    res.status(201).json(ok(result));
  };

  applyBankedHandler = async (req: Request, res: Response): Promise<void> => {
    const input = bankSchema.parse(req.body);
    const result = await this.applyBanked.execute(input);
    res.status(201).json(ok(result));
  };
}
