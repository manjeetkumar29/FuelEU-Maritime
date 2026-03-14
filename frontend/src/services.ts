import { apiClient } from "./adapters/infrastructure/api/axiosClient";
import { RouteApiService } from "./adapters/infrastructure/api/RouteApiService";
import { ComplianceApiService } from "./adapters/infrastructure/api/ComplianceApiService";
import { BankingApiService } from "./adapters/infrastructure/api/BankingApiService";
import { PoolApiService } from "./adapters/infrastructure/api/PoolApiService";

export const routeService = new RouteApiService(apiClient);
export const complianceService = new ComplianceApiService(apiClient);
export const bankingService = new BankingApiService(apiClient);
export const poolService = new PoolApiService(apiClient);
