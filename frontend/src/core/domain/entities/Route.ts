export interface Route {
  id: string;
  routeId: string;
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number;
  fuelConsumption: number;
  distance: number;
  totalEmissions: number;
  isBaseline: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RouteFilters {
  vesselType?: string;
  fuelType?: string;
  year?: number;
}

export interface ComparisonResult {
  route: Route;
  percentDiff: number;
  compliant: boolean;
}

export interface RouteComparison {
  baseline: Route;
  comparisons: ComparisonResult[];
}
