import { BankingRecords, BankEntry } from "../../domain/entities/BankEntry";

export interface IBankingService {
  getRecords(shipId: string, year: number): Promise<BankingRecords>;
  bankSurplus(
    shipId: string,
    year: number,
    amount: number,
  ): Promise<{ entry: BankEntry; balance: BankingRecords["balance"] }>;
  applyBanked(
    shipId: string,
    year: number,
    amount: number,
  ): Promise<{ entry: BankEntry; balance: BankingRecords["balance"] }>;
}
