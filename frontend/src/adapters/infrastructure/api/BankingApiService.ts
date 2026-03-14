import { AxiosInstance } from "axios";
import {
  BankEntry,
  BankingBalance,
  BankingRecords,
} from "../../../core/domain/entities/BankEntry";
import { IBankingService } from "../../../core/ports/outbound/IBankingService";

interface BankActionResponse {
  entry: BankEntry;
  balance: BankingBalance;
}

export class BankingApiService implements IBankingService {
  constructor(private readonly client: AxiosInstance) {}

  async getRecords(shipId: string, year: number): Promise<BankingRecords> {
    const res = await this.client.get<{ data: BankingRecords }>(
      "/banking/records",
      {
        params: { shipId, year },
      },
    );
    return res.data.data!;
  }

  async bankSurplus(
    shipId: string,
    year: number,
    amount: number,
  ): Promise<BankActionResponse> {
    const res = await this.client.post<{ data: BankActionResponse }>(
      "/banking/bank",
      {
        shipId,
        year,
        amount,
      },
    );
    return res.data.data!;
  }

  async applyBanked(
    shipId: string,
    year: number,
    amount: number,
  ): Promise<BankActionResponse> {
    const res = await this.client.post<{ data: BankActionResponse }>(
      "/banking/apply",
      {
        shipId,
        year,
        amount,
      },
    );
    return res.data.data!;
  }
}
