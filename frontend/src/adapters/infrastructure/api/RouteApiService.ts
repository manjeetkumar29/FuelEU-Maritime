import { AxiosInstance } from "axios";
import {
  Route,
  RouteFilters,
  RouteComparison,
} from "../../../core/domain/entities/Route";
import { IRouteService } from "../../../core/ports/outbound/IRouteService";

export class RouteApiService implements IRouteService {
  constructor(private readonly client: AxiosInstance) {}

  async getRoutes(filters?: RouteFilters): Promise<Route[]> {
    const params: Record<string, string | number> = {};
    if (filters?.vesselType) params.vesselType = filters.vesselType;
    if (filters?.fuelType) params.fuelType = filters.fuelType;
    if (filters?.year) params.year = filters.year;
    const res = await this.client.get<{ data: Route[] }>("/routes", { params });
    return res.data.data!;
  }

  async setBaseline(routeId: string): Promise<Route> {
    const res = await this.client.post<{ data: Route }>(
      `/routes/${routeId}/baseline`,
    );
    return res.data.data!;
  }

  async getComparison(): Promise<RouteComparison> {
    const res = await this.client.get<{ data: RouteComparison }>(
      "/routes/comparison",
    );
    return res.data.data!;
  }
}
