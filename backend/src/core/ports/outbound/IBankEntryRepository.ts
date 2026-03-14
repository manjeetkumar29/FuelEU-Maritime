import { BankEntry, BankingBalance } from "../../domain/entities/BankEntry";

export interface IBankEntryRepository {
  findByShipAndYear(shipId: string, year: number): Promise<BankEntry[]>;
  getBalance(shipId: string, year: number): Promise<BankingBalance>;
  create(data: CreateBankEntryData): Promise<BankEntry>;
}

export interface CreateBankEntryData {
  shipId: string;
  year: number;
  amountGco2eq: number;
  type: "BANKED" | "APPLIED";
}
