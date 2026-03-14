import { Route } from "../../domain/entities/Route";

export interface IRouteRepository {
  findAll(filters?: RouteFilters): Promise<Route[]>;
  findById(id: string): Promise<Route | null>;
  findByRouteId(routeId: string): Promise<Route | null>;
  findBaseline(): Promise<Route | null>;
  setBaseline(routeId: string): Promise<Route>;
  create(data: CreateRouteData): Promise<Route>;
}

export interface RouteFilters {
  vesselType?: string;
  fuelType?: string;
  year?: number;
}

export interface CreateRouteData {
  routeId: string;
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number;
  fuelConsumption: number;
  distance: number;
  totalEmissions: number;
}
