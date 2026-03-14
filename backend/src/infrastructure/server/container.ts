import { PrismaClient } from "@prisma/client";

// Repositories
import { PrismaRouteRepository } from "../../adapters/outbound/postgres/PrismaRouteRepository";
import { PrismaShipComplianceRepository } from "../../adapters/outbound/postgres/PrismaShipComplianceRepository";
import { PrismaBankEntryRepository } from "../../adapters/outbound/postgres/PrismaBankEntryRepository";
import { PrismaPoolRepository } from "../../adapters/outbound/postgres/PrismaPoolRepository";

// Use Cases
import {
  GetRoutesUseCase,
  SetBaselineUseCase,
  GetRouteComparisonUseCase,
} from "../../core/application/use-cases/RouteUseCases";
import {
  ComputeCBUseCase,
  GetAdjustedCBUseCase,
} from "../../core/application/use-cases/ComplianceUseCases";
import {
  GetBankingRecordsUseCase,
  BankSurplusUseCase,
  ApplyBankedUseCase,
} from "../../core/application/use-cases/BankingUseCases";
import { CreatePoolUseCase } from "../../core/application/use-cases/PoolUseCases";

// Controllers
import { RouteController } from "../../adapters/inbound/http/controllers/RouteController";
import { ComplianceController } from "../../adapters/inbound/http/controllers/ComplianceController";
import { BankingController } from "../../adapters/inbound/http/controllers/BankingController";
import { PoolController } from "../../adapters/inbound/http/controllers/PoolController";

export function buildContainer(prisma: PrismaClient) {
  // Repositories
  const routeRepo = new PrismaRouteRepository(prisma);
  const complianceRepo = new PrismaShipComplianceRepository(prisma);
  const bankRepo = new PrismaBankEntryRepository(prisma);
  const poolRepo = new PrismaPoolRepository(prisma);

  // Use Cases
  const getRoutesUC = new GetRoutesUseCase(routeRepo);
  const setBaselineUC = new SetBaselineUseCase(routeRepo);
  const getComparisonUC = new GetRouteComparisonUseCase(routeRepo);
  const computeCBUC = new ComputeCBUseCase(complianceRepo);
  const getAdjustedCBUC = new GetAdjustedCBUseCase(complianceRepo, bankRepo);
  const getBankingRecordsUC = new GetBankingRecordsUseCase(bankRepo);
  const bankSurplusUC = new BankSurplusUseCase(complianceRepo, bankRepo);
  const applyBankedUC = new ApplyBankedUseCase(complianceRepo, bankRepo);
  const createPoolUC = new CreatePoolUseCase(poolRepo);

  // Controllers
  const routeController = new RouteController(
    getRoutesUC,
    setBaselineUC,
    getComparisonUC,
  );
  const complianceController = new ComplianceController(
    computeCBUC,
    getAdjustedCBUC,
  );
  const bankingController = new BankingController(
    getBankingRecordsUC,
    bankSurplusUC,
    applyBankedUC,
  );
  const poolController = new PoolController(createPoolUC);

  return {
    routeController,
    complianceController,
    bankingController,
    poolController,
  };
}
