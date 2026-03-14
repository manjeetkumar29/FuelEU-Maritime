import {
  Route,
  RouteComparison,
  ComparisonResult,
} from "../../domain/entities/Route";
import {
  IRouteRepository,
  RouteFilters,
} from "../../ports/outbound/IRouteRepository";
import {
  computePercentDiff,
  isCompliant,
} from "../../domain/value-objects/ComplianceFormulas";
import { NotFoundError } from "../../../shared/errors";

export class GetRoutesUseCase {
  constructor(private readonly routeRepo: IRouteRepository) {}

  async execute(filters?: RouteFilters): Promise<Route[]> {
    return this.routeRepo.findAll(filters);
  }
}

export class SetBaselineUseCase {
  constructor(private readonly routeRepo: IRouteRepository) {}

  async execute(routeId: string): Promise<Route> {
    const route = await this.routeRepo.findByRouteId(routeId);
    if (!route) throw new NotFoundError(`Route ${routeId}`);
    return this.routeRepo.setBaseline(routeId);
  }
}

export class GetRouteComparisonUseCase {
  constructor(private readonly routeRepo: IRouteRepository) {}

  async execute(): Promise<RouteComparison> {
    const baseline = await this.routeRepo.findBaseline();
    if (!baseline) throw new NotFoundError("Baseline route");

    const allRoutes = await this.routeRepo.findAll();
    const others = allRoutes.filter((r) => r.routeId !== baseline.routeId);

    const comparisons: ComparisonResult[] = others.map((route) => ({
      route,
      percentDiff: computePercentDiff(
        baseline.ghgIntensity,
        route.ghgIntensity,
      ),
      compliant: isCompliant(route.ghgIntensity),
    }));

    return { baseline, comparisons };
  }
}
