import {
  BankSurplusUseCase,
  ApplyBankedUseCase,
} from "../../src/core/application/use-cases/BankingUseCases";
import { IShipComplianceRepository } from "../../src/core/ports/outbound/IShipComplianceRepository";
import { IBankEntryRepository } from "../../src/core/ports/outbound/IBankEntryRepository";
import { ShipCompliance } from "../../src/core/domain/entities/ShipCompliance";
import {
  BankEntry,
  BankingBalance,
} from "../../src/core/domain/entities/BankEntry";
import {
  BusinessRuleError,
  NotFoundError,
  ValidationError,
} from "../../src/shared/errors";

const makeCompliance = (cb: number): ShipCompliance => ({
  id: "1",
  shipId: "R002",
  year: 2024,
  cbGco2eq: cb,
  computedAt: new Date(),
});

const makeBalance = (available: number): BankingBalance => ({
  shipId: "R002",
  year: 2024,
  totalBanked: available,
  totalApplied: 0,
  available,
});

const makeBankEntry = (
  type: "BANKED" | "APPLIED",
  amount: number,
): BankEntry => ({
  id: "1",
  shipId: "R002",
  year: 2024,
  amountGco2eq: amount,
  type,
  createdAt: new Date(),
});

const mockComplianceRepo = (): jest.Mocked<IShipComplianceRepository> => ({
  findByShipAndYear: jest.fn(),
  upsert: jest.fn(),
});

const mockBankRepo = (): jest.Mocked<IBankEntryRepository> => ({
  findByShipAndYear: jest.fn(),
  getBalance: jest.fn(),
  create: jest.fn(),
});

describe("BankSurplusUseCase", () => {
  it("throws ValidationError if amount <= 0", async () => {
    const uc = new BankSurplusUseCase(mockComplianceRepo(), mockBankRepo());
    await expect(
      uc.execute({ shipId: "R002", year: 2024, amount: 0 }),
    ).rejects.toThrow(ValidationError);
    await expect(
      uc.execute({ shipId: "R002", year: 2024, amount: -1 }),
    ).rejects.toThrow(ValidationError);
  });

  it("throws NotFoundError if no compliance record", async () => {
    const complianceRepo = mockComplianceRepo();
    complianceRepo.findByShipAndYear.mockResolvedValue(null);
    const uc = new BankSurplusUseCase(complianceRepo, mockBankRepo());
    await expect(
      uc.execute({ shipId: "R002", year: 2024, amount: 100 }),
    ).rejects.toThrow(NotFoundError);
  });

  it("throws BusinessRuleError if CB is a deficit", async () => {
    const complianceRepo = mockComplianceRepo();
    complianceRepo.findByShipAndYear.mockResolvedValue(makeCompliance(-500));
    const uc = new BankSurplusUseCase(complianceRepo, mockBankRepo());
    await expect(
      uc.execute({ shipId: "R002", year: 2024, amount: 100 }),
    ).rejects.toThrow(BusinessRuleError);
  });

  it("throws BusinessRuleError if amount > available CB", async () => {
    const complianceRepo = mockComplianceRepo();
    complianceRepo.findByShipAndYear.mockResolvedValue(makeCompliance(500));
    const uc = new BankSurplusUseCase(complianceRepo, mockBankRepo());
    await expect(
      uc.execute({ shipId: "R002", year: 2024, amount: 1000 }),
    ).rejects.toThrow(BusinessRuleError);
  });

  it("creates a BANKED entry on success", async () => {
    const complianceRepo = mockComplianceRepo();
    const bankRepo = mockBankRepo();
    const entry = makeBankEntry("BANKED", 200);
    const balance = makeBalance(200);

    complianceRepo.findByShipAndYear.mockResolvedValue(makeCompliance(500));
    bankRepo.create.mockResolvedValue(entry);
    bankRepo.getBalance.mockResolvedValue(balance);

    const uc = new BankSurplusUseCase(complianceRepo, bankRepo);
    const result = await uc.execute({
      shipId: "R002",
      year: 2024,
      amount: 200,
    });
    expect(result.entry.type).toBe("BANKED");
    expect(bankRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: "BANKED", amountGco2eq: 200 }),
    );
  });
});

describe("ApplyBankedUseCase", () => {
  it("throws BusinessRuleError if no banked surplus", async () => {
    const complianceRepo = mockComplianceRepo();
    const bankRepo = mockBankRepo();
    bankRepo.getBalance.mockResolvedValue(makeBalance(0));
    const uc = new ApplyBankedUseCase(complianceRepo, bankRepo);
    await expect(
      uc.execute({ shipId: "R002", year: 2024, amount: 100 }),
    ).rejects.toThrow(BusinessRuleError);
  });

  it("throws BusinessRuleError if apply amount > available", async () => {
    const complianceRepo = mockComplianceRepo();
    const bankRepo = mockBankRepo();
    bankRepo.getBalance.mockResolvedValue(makeBalance(100));
    complianceRepo.findByShipAndYear.mockResolvedValue(makeCompliance(-500));
    const uc = new ApplyBankedUseCase(complianceRepo, bankRepo);
    await expect(
      uc.execute({ shipId: "R002", year: 2024, amount: 400 }),
    ).rejects.toThrow(BusinessRuleError);
  });

  it("creates APPLIED entry on success", async () => {
    const complianceRepo = mockComplianceRepo();
    const bankRepo = mockBankRepo();
    const entry = makeBankEntry("APPLIED", 100);
    const balance = makeBalance(200);

    bankRepo.getBalance
      .mockResolvedValueOnce(makeBalance(200)) // initial check
      .mockResolvedValueOnce(makeBalance(100)); // after apply
    complianceRepo.findByShipAndYear.mockResolvedValue(makeCompliance(-300));
    bankRepo.create.mockResolvedValue(entry);

    const uc = new ApplyBankedUseCase(complianceRepo, bankRepo);
    const result = await uc.execute({
      shipId: "R002",
      year: 2024,
      amount: 100,
    });
    expect(result.entry.type).toBe("APPLIED");
  });
});
