export interface ShipCompliance {
  id: string;
  shipId: string;
  year: number;
  cbGco2eq: number; // gCO2e — positive = surplus, negative = deficit
  computedAt: Date;
}
