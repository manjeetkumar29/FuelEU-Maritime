export type VesselType = "Container" | "BulkCarrier" | "Tanker" | "RoRo";
export type FuelType = "HFO" | "LNG" | "MGO" | "VLSFO" | "Methanol" | "Ammonia";

export interface Route {
  id: string;
  routeId: string;
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number; // gCO2e/MJ
  fuelConsumption: number; // tonnes
  distance: number; // km
  totalEmissions: number; // tonnes
  isBaseline: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RouteComparison {
  baseline: Route;
  comparisons: ComparisonResult[];
}

export interface ComparisonResult {
  route: Route;
  percentDiff: number;
  compliant: boolean;
}
