import { ShipCompliance } from "../../domain/entities/ShipCompliance";
import { IShipComplianceRepository } from "../../ports/outbound/IShipComplianceRepository";
import { IBankEntryRepository } from "../../ports/outbound/IBankEntryRepository";
import { computeComplianceBalance } from "../../domain/value-objects/ComplianceFormulas";
import { ValidationError } from "../../../shared/errors";

export interface ComputeCBInput {
  shipId: string;
  year: number;
  actualIntensity: number;
  fuelConsumptionTonnes: number;
}

export interface AdjustedCBResult {
  shipId: string;
  year: number;
  cbRaw: number;
  bankAvailable: number;
  cbAdjusted: number;
}

export class ComputeCBUseCase {
  constructor(private readonly complianceRepo: IShipComplianceRepository) {}

  async execute(input: ComputeCBInput): Promise<ShipCompliance> {
    if (input.fuelConsumptionTonnes <= 0) {
      throw new ValidationError("Fuel consumption must be positive");
    }

    const cb = computeComplianceBalance(
      input.actualIntensity,
      input.fuelConsumptionTonnes,
    );

    return this.complianceRepo.upsert({
      shipId: input.shipId,
      year: input.year,
      cbGco2eq: cb,
    });
  }
}

export class GetAdjustedCBUseCase {
  constructor(
    private readonly complianceRepo: IShipComplianceRepository,
    private readonly bankRepo: IBankEntryRepository,
  ) {}

  async execute(shipId: string, year: number): Promise<AdjustedCBResult> {
    const compliance = await this.complianceRepo.findByShipAndYear(
      shipId,
      year,
    );
    const cbRaw = compliance?.cbGco2eq ?? 0;

    const balance = await this.bankRepo.getBalance(shipId, year);
    const bankAvailable = balance.available;

    const cbAdjusted = cbRaw + bankAvailable;

    return { shipId, year, cbRaw, bankAvailable, cbAdjusted };
  }
}
