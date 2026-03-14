import { ShipCompliance } from "../../domain/entities/ShipCompliance";

export interface IShipComplianceRepository {
  findByShipAndYear(
    shipId: string,
    year: number,
  ): Promise<ShipCompliance | null>;
  upsert(data: UpsertComplianceData): Promise<ShipCompliance>;
}

export interface UpsertComplianceData {
  shipId: string;
  year: number;
  cbGco2eq: number;
}
