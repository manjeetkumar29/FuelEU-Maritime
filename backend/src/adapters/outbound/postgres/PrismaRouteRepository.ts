import { PrismaClient } from "@prisma/client";
import { Route } from "../../../core/domain/entities/Route";
import {
  IRouteRepository,
  RouteFilters,
  CreateRouteData,
} from "../../../core/ports/outbound/IRouteRepository";

function mapRoute(r: any): Route {
  return {
    id: r.id,
    routeId: r.routeId,
    vesselType: r.vesselType,
    fuelType: r.fuelType,
    year: r.year,
    ghgIntensity: r.ghgIntensity,
    fuelConsumption: r.fuelConsumption,
    distance: r.distance,
    totalEmissions: r.totalEmissions,
    isBaseline: r.isBaseline,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export class PrismaRouteRepository implements IRouteRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(filters?: RouteFilters): Promise<Route[]> {
    const where: any = {};
    if (filters?.vesselType) where.vesselType = filters.vesselType;
    if (filters?.fuelType) where.fuelType = filters.fuelType;
    if (filters?.year) where.year = filters.year;
    const rows = await this.prisma.route.findMany({
      where,
      orderBy: { routeId: "asc" },
    });
    return rows.map(mapRoute);
  }

  async findById(id: string): Promise<Route | null> {
    const r = await this.prisma.route.findUnique({ where: { id } });
    return r ? mapRoute(r) : null;
  }

  async findByRouteId(routeId: string): Promise<Route | null> {
    const r = await this.prisma.route.findUnique({ where: { routeId } });
    return r ? mapRoute(r) : null;
  }

  async findBaseline(): Promise<Route | null> {
    const r = await this.prisma.route.findFirst({
      where: { isBaseline: true },
    });
    return r ? mapRoute(r) : null;
  }

  async setBaseline(routeId: string): Promise<Route> {
    // Clear previous baseline
    await this.prisma.route.updateMany({
      where: { isBaseline: true },
      data: { isBaseline: false },
    });
    // Set new baseline
    const r = await this.prisma.route.update({
      where: { routeId },
      data: { isBaseline: true },
    });
    return mapRoute(r);
  }

  async create(data: CreateRouteData): Promise<Route> {
    const r = await this.prisma.route.create({ data });
    return mapRoute(r);
  }
}
