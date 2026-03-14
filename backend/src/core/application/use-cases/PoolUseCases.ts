import {
  Pool,
  CreatePoolRequest,
  PoolAllocationResult,
} from "../../domain/entities/Pool";
import { IPoolRepository } from "../../ports/outbound/IPoolRepository";
import { BusinessRuleError, ValidationError } from "../../../shared/errors";

export class CreatePoolUseCase {
  constructor(private readonly poolRepo: IPoolRepository) {}

  async execute(request: CreatePoolRequest): Promise<PoolAllocationResult> {
    if (!request.members || request.members.length < 2) {
      throw new ValidationError("Pool must have at least 2 members");
    }

    const totalCb = request.members.reduce((sum, m) => sum + m.cb, 0);

    // Rule: Sum of adjusted CB must be ≥ 0
    if (totalCb < 0) {
      throw new BusinessRuleError(
        `Pool is invalid: total CB is ${totalCb.toFixed(2)} gCO2eq (must be ≥ 0)`,
      );
    }

    // Greedy allocation: sort desc by CB, transfer surplus to deficits
    const sorted = [...request.members].sort((a, b) => b.cb - a.cb);
    const allocations = sorted.map((m) => ({ ...m, cbAfter: m.cb }));

    // Collect surplus and deficit members
    const surplusMembers = allocations.filter((m) => m.cbAfter > 0);
    const deficitMembers = allocations.filter((m) => m.cbAfter < 0);

    for (const deficit of deficitMembers) {
      let needed = Math.abs(deficit.cbAfter);
      for (const surplus of surplusMembers) {
        if (needed <= 0) break;
        if (surplus.cbAfter <= 0) continue;
        const transfer = Math.min(surplus.cbAfter, needed);
        surplus.cbAfter -= transfer;
        deficit.cbAfter += transfer;
        needed -= transfer;
      }
    }

    // Validate post-allocation:
    // Deficit ship cannot exit worse than before
    for (const m of allocations) {
      const original = request.members.find((x) => x.shipId === m.shipId)!;
      if (original.cb < 0 && m.cbAfter < original.cb) {
        throw new BusinessRuleError(
          `Ship ${m.shipId} would exit pool worse than it entered`,
        );
      }
      // Surplus ship cannot exit negative
      if (original.cb > 0 && m.cbAfter < 0) {
        throw new BusinessRuleError(
          `Surplus ship ${m.shipId} would exit pool in deficit`,
        );
      }
    }

    const pool = await this.poolRepo.create({
      year: request.year,
      members: allocations.map((m) => ({
        shipId: m.shipId,
        cbBefore: m.cb,
        cbAfter: m.cbAfter,
      })),
    });

    return {
      poolId: pool.id,
      year: pool.year,
      totalCb,
      isValid: true,
      members: pool.members.map((pm) => ({
        shipId: pm.shipId,
        cbBefore: pm.cbBefore,
        cbAfter: pm.cbAfter,
      })),
    };
  }
}
