import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  getCompanyForOwner: vi.fn(),
  listCompaniesForOwner: vi.fn(),
  createCompanyForOwner: vi.fn(),
  updateCompanyForOwner: vi.fn(),
  deleteCompanyForOwner: vi.fn(),
  listContentsForOwner: vi.fn(),
  getContentForOwner: vi.fn(),
  createContentForOwner: vi.fn(),
  updateContentForOwner: vi.fn(),
  deleteContentForOwner: vi.fn(),
}));

vi.mock("./db", () => dbMocks);

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(user?: AuthenticatedUser): TrpcContext {
  return {
    user: user ?? null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createUser(id: number): AuthenticatedUser {
  return {
    id,
    openId: `user-${id}`,
    email: `user-${id}@example.com`,
    name: `User ${id}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
}

const objective = {
  companyId: 17,
  taskType: "reel" as const,
  goal: "Apresentar a coleção",
  briefing: "Mostrar os detalhes da coleção Aurora",
};

describe("intelligence.run", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMocks.getCompanyForOwner.mockResolvedValue({ id: 17, ownerId: 42 });
  });

  it("requires authentication", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(
      caller.intelligence.run({ mode: "plan", objective })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(dbMocks.getCompanyForOwner).not.toHaveBeenCalled();
  });

  it("derives ownership from the session and rejects another user's company", async () => {
    dbMocks.getCompanyForOwner.mockResolvedValue(undefined);
    const caller = appRouter.createCaller(createContext(createUser(84)));
    await expect(
      caller.intelligence.run({ mode: "draft", objective })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(dbMocks.getCompanyForOwner).toHaveBeenCalledWith(84, 17);
  });

  it("returns a deterministic plan without executing a provider", async () => {
    const caller = appRouter.createCaller(createContext(createUser(42)));
    const result = await caller.intelligence.run({ mode: "plan", objective });
    expect(result.plan.mode).toBe("plan");
    expect(result.result.status).toBe("planned");
    expect(result.result.provider).toBe("none");
  });

  it("returns an explicitly simulated draft", async () => {
    const caller = appRouter.createCaller(createContext(createUser(42)));
    const result = await caller.intelligence.run({ mode: "draft", objective });
    expect(result.result.status).toBe("simulated_draft");
    expect(result.result.simulated).toBe(true);
    expect(result.result.warnings.join(" ")).toMatch(
      /nenhum fornecedor externo/i
    );
  });

  it("blocks execute before any external provider can run", async () => {
    const caller = appRouter.createCaller(createContext(createUser(42)));
    await expect(
      caller.intelligence.run({ mode: "execute", objective })
    ).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
  });
});
