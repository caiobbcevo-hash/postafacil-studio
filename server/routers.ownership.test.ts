import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { ContentNotFoundError } from "./contentLifecycle";

const dbMocks = vi.hoisted(() => ({
  listCompaniesForOwner: vi.fn(),
  getCompanyForOwner: vi.fn(),
  createCompanyForOwner: vi.fn(),
  updateCompanyForOwner: vi.fn(),
  deleteCompanyForOwner: vi.fn(),
  listContentsForOwner: vi.fn(),
  getContentForOwner: vi.fn(),
  createContentForOwner: vi.fn(),
  updateContentForOwner: vi.fn(),
  transitionContentForOwner: vi.fn(),
  deleteContentForOwner: vi.fn(),
}));

vi.mock("./db", () => dbMocks);

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

const companyInput = {
  name: "Casa Aurora",
  segment: "Decoração",
  products: "Móveis artesanais",
  services: "Consultoria de ambientes",
  targetAudience: "Pessoas que valorizam casas acolhedoras",
  voiceTone: "Acolhedor e didático",
  brandColors: "Terracota e azul petróleo",
  links: "https://example.com",
  logoUrl: null,
};

const contentInput = {
  companyId: 17,
  title: "Coleção Aurora",
  contentType: "reel" as const,
  generationType: "reel" as const,
  format: "9:16 vertical",
  duration: "30 segundos",
  briefing: "Apresentar a nova coleção",
  script: "Roteiro revisável",
  scenes: "Cena 1",
  voice: "Narração acolhedora",
  track: "Trilha leve",
  caption: "Conheça a coleção Aurora.",
};

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

function createContext(user?: AuthenticatedUser): TrpcContext {
  return {
    user: user ?? null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("authenticated ownership contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMocks.listCompaniesForOwner.mockResolvedValue([]);
    dbMocks.listContentsForOwner.mockResolvedValue([]);
    dbMocks.getCompanyForOwner.mockResolvedValue(undefined);
    dbMocks.getContentForOwner.mockResolvedValue(undefined);
    dbMocks.createCompanyForOwner.mockResolvedValue({ id: 17, ...companyInput });
    dbMocks.updateCompanyForOwner.mockResolvedValue({ id: 17, ...companyInput });
    dbMocks.createContentForOwner.mockResolvedValue({ id: 150001, ...contentInput, companyName: companyInput.name });
    dbMocks.updateContentForOwner.mockResolvedValue({ id: 150001, ...contentInput, companyName: companyInput.name });
    dbMocks.transitionContentForOwner.mockResolvedValue({ id: 150001, ...contentInput, status: "pending_approval", companyName: companyInput.name });
  });

  it("rejects company and content reads without an authenticated user", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(caller.companies.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.contents.list({ companyId: 17 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.contents.get({ id: 150001 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("scopes company and content reads to the authenticated owner", async () => {
    const caller = appRouter.createCaller(createContext(createUser(42)));

    await caller.companies.list();
    await caller.contents.list({ companyId: 17 });
    await caller.contents.get({ id: 150001 });

    expect(dbMocks.listCompaniesForOwner).toHaveBeenCalledWith(42);
    expect(dbMocks.listContentsForOwner).toHaveBeenCalledWith(42, 17);
    expect(dbMocks.getContentForOwner).toHaveBeenCalledWith(42, 150001);
  });

  it("keeps the owner and company binding when creating and updating a draft", async () => {
    const caller = appRouter.createCaller(createContext(createUser(42)));

    await caller.contents.create({ ...contentInput, status: "published" });
    await caller.contents.update({
      id: 150001,
      data: { companyId: 17, caption: "Legenda revisada.", status: "draft" },
    });

    expect(dbMocks.createContentForOwner).toHaveBeenCalledWith(42, contentInput);
    expect(dbMocks.updateContentForOwner).toHaveBeenCalledWith(42, 150001, {
      companyId: 17,
      caption: "Legenda revisada.",
      generationType: "reel",
    });
  });

  it.each(["published", "scheduled", "failed"])(
    "rejects a common CRUD update to %s",
    async status => {
      const caller = appRouter.createCaller(createContext(createUser(42)));

      await expect(
        caller.contents.update({
          id: 150001,
          data: { status } as never,
        })
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
      expect(dbMocks.updateContentForOwner).not.toHaveBeenCalled();
    }
  );

  it.each(["requestReview", "approve", "returnForRevision"] as const)(
    "requires authentication for %s",
    async operation => {
      const caller = appRouter.createCaller(createContext());

      await expect(caller.contents[operation]({ id: 150001 })).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
      expect(dbMocks.transitionContentForOwner).not.toHaveBeenCalled();
    }
  );

  it.each([
    { operation: "requestReview" as const, status: "pending_approval", actor: "editor" },
    { operation: "approve" as const, status: "approved", actor: "approver" },
    { operation: "returnForRevision" as const, status: "draft", actor: "editor" },
  ])("derives owner and policy actor on the server for $operation", async ({ operation, status, actor }) => {
    const caller = appRouter.createCaller(createContext(createUser(42)));

    await caller.contents[operation]({ id: 150001 });

    expect(dbMocks.transitionContentForOwner).toHaveBeenCalledWith(42, 150001, status, actor);
  });

  it("rejects client-supplied owner and actor fields", async () => {
    const caller = appRouter.createCaller(createContext(createUser(42)));

    await expect(
      caller.contents.approve({ id: 150001, ownerId: 84, actor: "editor" } as never)
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(dbMocks.transitionContentForOwner).not.toHaveBeenCalled();
  });

  it("does not allow another account to transition the content", async () => {
    const caller = appRouter.createCaller(createContext(createUser(84)));
    dbMocks.transitionContentForOwner.mockRejectedValueOnce(new ContentNotFoundError());

    await expect(caller.contents.approve({ id: 150001 })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    expect(dbMocks.transitionContentForOwner).toHaveBeenCalledWith(
      84,
      150001,
      "approved",
      "approver"
    );
    expect(dbMocks.transitionContentForOwner).not.toHaveBeenCalledWith(
      42,
      150001,
      "approved",
      "approver"
    );
  });

  it("does not substitute another user's identity when the same record is requested", async () => {
    const caller = appRouter.createCaller(createContext(createUser(84)));
    dbMocks.getContentForOwner.mockResolvedValue(undefined);

    const result = await caller.contents.get({ id: 150001 });

    expect(result).toBeUndefined();
    expect(dbMocks.getContentForOwner).toHaveBeenCalledWith(84, 150001);
    expect(dbMocks.getContentForOwner).not.toHaveBeenCalledWith(42, 150001);
  });

  it("passes the authenticated owner to company mutations too", async () => {
    const caller = appRouter.createCaller(createContext(createUser(42)));

    await caller.companies.create(companyInput);
    await caller.companies.update({ id: 17, data: { name: "Casa Aurora Atualizada" } });
    await caller.companies.delete({ id: 17 });

    expect(dbMocks.createCompanyForOwner).toHaveBeenCalledWith(42, companyInput);
    expect(dbMocks.updateCompanyForOwner).toHaveBeenCalledWith(42, 17, { name: "Casa Aurora Atualizada" });
    expect(dbMocks.deleteCompanyForOwner).toHaveBeenCalledWith(42, 17);
  });
});
