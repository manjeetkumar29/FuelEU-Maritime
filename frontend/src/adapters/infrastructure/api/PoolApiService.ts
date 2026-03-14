import { AxiosInstance } from "axios";
import {
  CreatePoolRequest,
  PoolAllocationResult,
} from "../../../core/domain/entities/Pool";
import { IPoolService } from "../../../core/ports/outbound/IPoolService";

export class PoolApiService implements IPoolService {
  constructor(private readonly client: AxiosInstance) {}

  async createPool(request: CreatePoolRequest): Promise<PoolAllocationResult> {
    const res = await this.client.post<{ data: PoolAllocationResult }>(
      "/pools",
      request,
    );
    return res.data.data!;
  }
}
