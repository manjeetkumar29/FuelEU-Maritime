import { PrismaClient } from "@prisma/client";
import {
  BankEntry,
  BankingBalance,
} from "../../../core/domain/entities/BankEntry";
import {
  IBankEntryRepository,
  CreateBankEntryData,
} from "../../../core/ports/outbound/IBankEntryRepository";

function mapEntry(r: any): BankEntry {
  return {
    id: r.id,
    shipId: r.shipId,
    year: r.year,
    amountGco2eq: r.amountGco2eq,
    type: r.type as "BANKED" | "APPLIED",
    createdAt: r.createdAt,
  };
}

export class PrismaBankEntryRepository implements IBankEntryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByShipAndYear(shipId: string, year: number): Promise<BankEntry[]> {
    const rows = await this.prisma.bankEntry.findMany({
      where: { shipId, year },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(mapEntry);
  }

  async getBalance(shipId: string, year: number): Promise<BankingBalance> {
    const rows = await this.prisma.bankEntry.findMany({
      where: { shipId, year },
    });
    const totalBanked = rows
      .filter((r) => r.type === "BANKED")
      .reduce((s, r) => s + r.amountGco2eq, 0);
    const totalApplied = rows
      .filter((r) => r.type === "APPLIED")
      .reduce((s, r) => s + r.amountGco2eq, 0);
    return {
      shipId,
      year,
      totalBanked,
      totalApplied,
      available: totalBanked - totalApplied,
    };
  }

  async create(data: CreateBankEntryData): Promise<BankEntry> {
    const r = await this.prisma.bankEntry.create({ data });
    return mapEntry(r);
  }
}
