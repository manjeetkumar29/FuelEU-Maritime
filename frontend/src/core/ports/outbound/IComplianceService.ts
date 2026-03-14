import {
  ShipCompliance,
  AdjustedCBResult,
} from "../../domain/entities/ShipCompliance";

export interface IComplianceService {
  getCB(
    shipId: string,
    year: number,
    actualIntensity: number,
    fuelConsumption: number,
  ): Promise<ShipCompliance>;
  getAdjustedCB(shipId: string, year: number): Promise<AdjustedCBResult>;
}
