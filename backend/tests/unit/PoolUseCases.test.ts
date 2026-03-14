import { CreatePoolUseCase } from "../../src/core/application/use-cases/PoolUseCases";
import { IPoolRepository } from "../../src/core/ports/outbound/IPoolRepository";
import { Pool } from "../../src/core/domain/entities/Pool";
import { BusinessRuleError, ValidationError } from "../../src/shared/errors";

const mockPoolRepo = (): jest.Mocked<IPoolRepository> => ({
  create: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
});

const makePool = (
  members: { shipId: string; cbBefore: number; cbAfter: number }[],
): Pool => ({
  id: "pool-1",
  year: 2025,
  createdAt: new Date(),
  members: members.map((m, i) => ({ id: String(i), poolId: "pool-1", ...m })),
});

describe("CreatePoolUseCase", () => {
  it("throws ValidationError if fewer than 2 members", async () => {
    const repo = mockPoolRepo();
    const uc = new CreatePoolUseCase(repo);
    await expect(
      uc.execute({ year: 2025, members: [{ shipId: "S1", cb: 100 }] }),
    ).rejects.toThrow(ValidationError);
  });

  it("throws BusinessRuleError if sum of CBs is negative", async () => {
    const repo = mockPoolRepo();
    const uc = new CreatePoolUseCase(repo);
    await expect(
      uc.execute({
        year: 2025,
        members: [
          { shipId: "S1", cb: -200 },
          { shipId: "S2", cb: 100 },
        ],
      }),
    ).rejects.toThrow(BusinessRuleError);
  });

  it("allocates surplus to deficit and creates pool", async () => {
    const repo = mockPoolRepo();
    // S1 has +300 surplus, S2 has -100 deficit → total = 200 ≥ 0
    repo.create.mockImplementation(async (data) =>
      makePool(data.members.map((m) => ({ ...m }))),
    );
    const uc = new CreatePoolUseCase(repo);
    const result = await uc.execute({
      year: 2025,
      members: [
        { shipId: "S1", cb: 300 },
        { shipId: "S2", cb: -100 },
      ],
    });
    expect(result.isValid).toBe(true);
    const s2 = result.members.find((m) => m.shipId === "S2");
    expect(s2?.cbAfter).toBe(0); // deficit cleared
    const s1 = result.members.find((m) => m.shipId === "S1");
    expect(s1?.cbAfter).toBe(200); // surplus reduced
  });

  it("all-surplus pool works fine", async () => {
    const repo = mockPoolRepo();
    repo.create.mockImplementation(async (data) => makePool(data.members));
    const uc = new CreatePoolUseCase(repo);
    const result = await uc.execute({
      year: 2025,
      members: [
        { shipId: "S1", cb: 100 },
        { shipId: "S2", cb: 200 },
      ],
    });
    expect(result.isValid).toBe(true);
  });
});
