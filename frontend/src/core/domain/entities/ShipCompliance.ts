export interface ShipCompliance {
  id: string;
  shipId: string;
  year: number;
  cbGco2eq: number;
  computedAt: string;
}

export interface AdjustedCBResult {
  shipId: string;
  year: number;
  cbRaw: number;
  bankAvailable: number;
  cbAdjusted: number;
}
