import { Pool } from "../../domain/entities/Pool";

export interface IPoolRepository {
  create(data: CreatePoolData): Promise<Pool>;
  findById(id: string): Promise<Pool | null>;
  findAll(): Promise<Pool[]>;
}

export interface CreatePoolData {
  year: number;
  members: { shipId: string; cbBefore: number; cbAfter: number }[];
}
