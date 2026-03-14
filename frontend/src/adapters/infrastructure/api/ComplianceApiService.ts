import { AxiosInstance } from "axios";
import {
  ShipCompliance,
  AdjustedCBResult,
} from "../../../core/domain/entities/ShipCompliance";
import { IComplianceService } from "../../../core/ports/outbound/IComplianceService";

export class ComplianceApiService implements IComplianceService {
  constructor(private readonly client: AxiosInstance) {}

  async getCB(
    shipId: string,
    year: number,
    actualIntensity: number,
    fuelConsumption: number,
  ): Promise<ShipCompliance> {
    const res = await this.client.get<{ data: ShipCompliance }>(
      "/compliance/cb",
      {
        params: { shipId, year, actualIntensity, fuelConsumption },
      },
    );
    return res.data.data!;
  }

  async getAdjustedCB(shipId: string, year: number): Promise<AdjustedCBResult> {
    const res = await this.client.get<{ data: AdjustedCBResult }>(
      "/compliance/adjusted-cb",
      {
        params: { shipId, year },
      },
    );
    return res.data.data!;
  }
}
