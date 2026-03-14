export interface PoolMemberResult {
  shipId: string;
  cbBefore: number;
  cbAfter: number;
}

export interface PoolAllocationResult {
  poolId: string;
  year: number;
  members: PoolMemberResult[];
  totalCb: number;
  isValid: boolean;
}

export interface CreatePoolRequest {
  year: number;
  members: { shipId: string; cb: number }[];
}
