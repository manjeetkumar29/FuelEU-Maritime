export interface Pool {
  id: string;
  year: number;
  createdAt: Date;
  members: PoolMember[];
}

export interface PoolMember {
  id: string;
  poolId: string;
  shipId: string;
  cbBefore: number;
  cbAfter: number;
}

export interface CreatePoolRequest {
  year: number;
  members: { shipId: string; cb: number }[];
}

export interface PoolAllocationResult {
  poolId: string;
  year: number;
  members: { shipId: string; cbBefore: number; cbAfter: number }[];
  totalCb: number;
  isValid: boolean;
}
