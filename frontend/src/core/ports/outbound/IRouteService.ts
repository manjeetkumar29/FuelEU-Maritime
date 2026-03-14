import {
  Route,
  RouteFilters,
  RouteComparison,
} from "../../domain/entities/Route";

export interface IRouteService {
  getRoutes(filters?: RouteFilters): Promise<Route[]>;
  setBaseline(routeId: string): Promise<Route>;
  getComparison(): Promise<RouteComparison>;
}
