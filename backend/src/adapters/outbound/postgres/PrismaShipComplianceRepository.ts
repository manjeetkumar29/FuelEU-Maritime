import { PrismaClient } from "@prisma/client";
import { ShipCompliance } from "../../../core/domain/entities/ShipCompliance";
import {
  IShipComplianceRepository,
  UpsertComplianceData,
} from "../../../core/ports/outbound/IShipComplianceRepository";

function mapCompliance(r: any): ShipCompliance {
  return {
    id: r.id,
    shipId: r.shipId,
    year: r.year,
    cbGco2eq: r.cbGco2eq,
    computedAt: r.computedAt,
  };
}

export class PrismaShipComplianceRepository implements IShipComplianceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByShipAndYear(
    shipId: string,
    year: number,
  ): Promise<ShipCompliance | null> {
    const r = await this.prisma.shipCompliance.findUnique({
      where: { shipId_year: { shipId, year } },
    });
    return r ? mapCompliance(r) : null;
  }

  async upsert(data: UpsertComplianceData): Promise<ShipCompliance> {
    const r = await this.prisma.shipCompliance.upsert({
      where: { shipId_year: { shipId: data.shipId, year: data.year } },
      update: { cbGco2eq: data.cbGco2eq, computedAt: new Date() },
      create: {
        shipId: data.shipId,
        year: data.year,
        cbGco2eq: data.cbGco2eq,
      },
    });
    return mapCompliance(r);
  }
}
