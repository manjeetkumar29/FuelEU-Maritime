import { PrismaClient } from "@prisma/client";
import { Pool } from "../../../core/domain/entities/Pool";
import {
  IPoolRepository,
  CreatePoolData,
} from "../../../core/ports/outbound/IPoolRepository";

function mapPool(r: any): Pool {
  return {
    id: r.id,
    year: r.year,
    createdAt: r.createdAt,
    members: (r.members ?? []).map((m: any) => ({
      id: m.id,
      poolId: m.poolId,
      shipId: m.shipId,
      cbBefore: m.cbBefore,
      cbAfter: m.cbAfter,
    })),
  };
}

export class PrismaPoolRepository implements IPoolRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreatePoolData): Promise<Pool> {
    const pool = await this.prisma.pool.create({
      data: {
        year: data.year,
        members: {
          create: data.members.map((m) => ({
            shipId: m.shipId,
            cbBefore: m.cbBefore,
            cbAfter: m.cbAfter,
          })),
        },
      },
      include: { members: true },
    });
    return mapPool(pool);
  }

  async findById(id: string): Promise<Pool | null> {
    const pool = await this.prisma.pool.findUnique({
      where: { id },
      include: { members: true },
    });
    return pool ? mapPool(pool) : null;
  }

  async findAll(): Promise<Pool[]> {
    const pools = await this.prisma.pool.findMany({
      include: { members: true },
      orderBy: { createdAt: "desc" },
    });
    return pools.map(mapPool);
  }
}
