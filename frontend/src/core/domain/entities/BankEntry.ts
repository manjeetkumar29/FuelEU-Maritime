export interface BankEntry {
  id: string;
  shipId: string;
  year: number;
  amountGco2eq: number;
  type: "BANKED" | "APPLIED";
  createdAt: string;
}

export interface BankingBalance {
  shipId: string;
  year: number;
  totalBanked: number;
  totalApplied: number;
  available: number;
}

export interface BankingRecords {
  records: BankEntry[];
  balance: BankingBalance;
}
