import { BankEntry, BankingBalance } from "../../domain/entities/BankEntry";
import { IShipComplianceRepository } from "../../ports/outbound/IShipComplianceRepository";
import { IBankEntryRepository } from "../../ports/outbound/IBankEntryRepository";
import {
  BusinessRuleError,
  NotFoundError,
  ValidationError,
} from "../../../shared/errors";

export interface BankSurplusInput {
  shipId: string;
  year: number;
  amount: number;
}

export interface ApplyBankedInput {
  shipId: string;
  year: number;
  amount: number;
}

export interface BankingActionResult {
  entry: BankEntry;
  balance: BankingBalance;
}

export class GetBankingRecordsUseCase {
  constructor(private readonly bankRepo: IBankEntryRepository) {}

  async execute(
    shipId: string,
    year: number,
  ): Promise<{ records: BankEntry[]; balance: BankingBalance }> {
    const records = await this.bankRepo.findByShipAndYear(shipId, year);
    const balance = await this.bankRepo.getBalance(shipId, year);
    return { records, balance };
  }
}

export class BankSurplusUseCase {
  constructor(
    private readonly complianceRepo: IShipComplianceRepository,
    private readonly bankRepo: IBankEntryRepository,
  ) {}

  async execute(input: BankSurplusInput): Promise<BankingActionResult> {
    if (input.amount <= 0)
      throw new ValidationError("Amount to bank must be positive");

    const compliance = await this.complianceRepo.findByShipAndYear(
      input.shipId,
      input.year,
    );
    if (!compliance)
      throw new NotFoundError(
        `Compliance record for ship ${input.shipId} year ${input.year}`,
      );
    if (compliance.cbGco2eq <= 0) {
      throw new BusinessRuleError("Cannot bank a deficit or zero CB");
    }
    if (input.amount > compliance.cbGco2eq) {
      throw new BusinessRuleError(
        `Cannot bank more than available CB (${compliance.cbGco2eq.toFixed(2)} gCO2eq)`,
      );
    }

    const entry = await this.bankRepo.create({
      shipId: input.shipId,
      year: input.year,
      amountGco2eq: input.amount,
      type: "BANKED",
    });

    const balance = await this.bankRepo.getBalance(input.shipId, input.year);
    return { entry, balance };
  }
}

export class ApplyBankedUseCase {
  constructor(
    private readonly complianceRepo: IShipComplianceRepository,
    private readonly bankRepo: IBankEntryRepository,
  ) {}

  async execute(input: ApplyBankedInput): Promise<BankingActionResult> {
    if (input.amount <= 0)
      throw new ValidationError("Amount to apply must be positive");

    const balance = await this.bankRepo.getBalance(input.shipId, input.year);
    if (balance.available <= 0) {
      throw new BusinessRuleError("No banked surplus available to apply");
    }
    if (input.amount > balance.available) {
      throw new BusinessRuleError(
        `Cannot apply more than available banked surplus (${balance.available.toFixed(2)} gCO2eq)`,
      );
    }

    const compliance = await this.complianceRepo.findByShipAndYear(
      input.shipId,
      input.year,
    );
    if (!compliance)
      throw new NotFoundError(
        `Compliance record for ship ${input.shipId} year ${input.year}`,
      );
    if (compliance.cbGco2eq >= 0) {
      throw new BusinessRuleError("No deficit to apply banked surplus to");
    }

    const entry = await this.bankRepo.create({
      shipId: input.shipId,
      year: input.year,
      amountGco2eq: input.amount,
      type: "APPLIED",
    });

    const updatedBalance = await this.bankRepo.getBalance(
      input.shipId,
      input.year,
    );
    return { entry, balance: updatedBalance };
  }
}
