import {
  CreatePoolRequest,
  PoolAllocationResult,
} from "../../domain/entities/Pool";

export interface IPoolService {
  createPool(request: CreatePoolRequest): Promise<PoolAllocationResult>;
}
