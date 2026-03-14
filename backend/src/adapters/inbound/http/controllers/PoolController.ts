import { Request, Response } from "express";
import { CreatePoolUseCase } from "../../../../core/application/use-cases/PoolUseCases";
import { ok } from "../../../../shared/apiResponse";
import { z } from "zod";

const createPoolSchema = z.object({
  year: z.number().int().min(2020),
  members: z
    .array(
      z.object({
        shipId: z.string().min(1),
        cb: z.number(),
      }),
    )
    .min(2),
});

export class PoolController {
  constructor(private readonly createPool: CreatePoolUseCase) {}

  createPoolHandler = async (req: Request, res: Response): Promise<void> => {
    const input = createPoolSchema.parse(req.body);
    const result = await this.createPool.execute(input);
    res.status(201).json(ok(result));
  };
}
