import { beforeEach, describe, expect, it, vi } from "vitest";
import { MySqlDialect } from "drizzle-orm/mysql-core";
import { companies } from "../drizzle/schema";

const state = vi.hoisted(() => ({
  selectedCompany: undefined as Record<string, unknown> | undefined,
  selectedContent: undefined as Record<string, unknown> | undefined,
  updateWhere: undefined as unknown,
  deleteWhere: undefined as unknown,
  insertValues: undefined as unknown,
  updateCalls: 0,
  deleteCalls: 0,
  updateAffectedRows: 1,
  deleteAffectedRows: 1,
  afterUpdate: undefined as (() => void) | undefined,
}));

vi.mock("drizzle-orm/mysql2", () => ({
  drizzle: vi.fn(() => ({
    select: () => ({
      from: (table: unknown) => {
        if (table === companies) {
          return {
            where: () => ({
              limit: async () =>
                state.selectedCompany ? [state.selectedCompany] : [],
            }),
          };
        }
        return {
          innerJoin: () => ({
            where: () => ({
              limit: async () =>
                state.selectedContent
                  ? [
                      {
                        content: state.selectedContent,
                        companyName: "Casa Aurora",
                      },
                    ]
                  : [],
            }),
          }),
        };
      },
    }),
    insert: () => ({
      values: async (values: unknown) => {
        state.insertValues = values;
        return [{ insertId: 150001 }];
      },
    }),
    update: () => ({
      set: () => ({
        where: async (condition: unknown) => {
          state.updateWhere = condition;
          state.updateCalls += 1;
          state.afterUpdate?.();
          return [{ affectedRows: state.updateAffectedRows }, []];
        },
      }),
    }),
    delete: () => ({
      where: async (condition: unknown) => {
        state.deleteWhere = condition;
        state.deleteCalls += 1;
        return [{ affectedRows: state.deleteAffectedRows }, []];
      },
    }),
  })),
}));

const { createContentForOwner, deleteContentForOwner, updateContentForOwner } =
  await import("./db");

const dialect = new MySqlDialect();

function sqlText(condition: unknown) {
  return dialect.sqlToQuery(
    condition as Parameters<MySqlDialect["sqlToQuery"]>[0]
  ).sql;
}

function contentForCompany(companyId: number) {
  return {
    id: 150001,
    companyId,
    title: "Coleção Aurora",
    contentType: "reel",
    generationType: "reel",
    format: "9:16 vertical",
    duration: "30 segundos",
    briefing: "Apresentar a nova coleção",
    script: "Roteiro revisável",
    scenes: "Cena 1",
    voice: "Narração acolhedora",
    track: "Trilha leve",
    caption: "Conheça a coleção Aurora.",
    status: "draft",
  };
}

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

describe("content mutation ownership", () => {
  beforeEach(() => {
    process.env.DATABASE_URL = "mysql://test-only";
    state.selectedCompany = { id: 17, ownerId: 42 };
    state.selectedContent = undefined;
    state.updateWhere = undefined;
    state.deleteWhere = undefined;
    state.insertValues = undefined;
    state.updateCalls = 0;
    state.deleteCalls = 0;
    state.updateAffectedRows = 1;
    state.deleteAffectedRows = 1;
    state.afterUpdate = undefined;
  });

  it("rejects an update when the content is not owned by the authenticated user", async () => {
    await expect(
      updateContentForOwner(84, 150001, { caption: "Tentativa indevida" })
    ).rejects.toThrow("Content not found");

    expect(state.updateCalls).toBe(0);
  });

  it("rejects a delete when the content is not owned by the authenticated user", async () => {
    await expect(deleteContentForOwner(84, 150001)).rejects.toThrow(
      "Content not found"
    );

    expect(state.deleteCalls).toBe(0);
  });

  it("updates an authorized content successfully", async () => {
    state.selectedContent = contentForCompany(17);

    await expect(
      updateContentForOwner(42, 150001, { caption: "Legenda revisada" })
    ).resolves.toMatchObject({ id: 150001, companyId: 17 });
    expect(state.updateCalls).toBe(1);
  });

  it("rejects when the final update predicate blocks a concurrent ownership change", async () => {
    state.selectedContent = contentForCompany(17);
    state.afterUpdate = () => {
      state.selectedContent = undefined;
    };

    await expect(
      updateContentForOwner(42, 150001, { caption: "Tentativa concorrente" })
    ).rejects.toThrow("Content was not found after update");
  });

  it("deletes an authorized content when one row is affected", async () => {
    state.selectedContent = contentForCompany(17);

    await expect(deleteContentForOwner(42, 150001)).resolves.toBeUndefined();
    expect(state.deleteCalls).toBe(1);
  });

  it("rejects a delete when the final predicate affects zero rows", async () => {
    state.selectedContent = contentForCompany(17);
    state.deleteAffectedRows = 0;

    await expect(deleteContentForOwner(42, 150001)).rejects.toThrow(
      "Content not found"
    );
    expect(state.deleteCalls).toBe(1);
  });

  it("rejects creating content for a company that does not exist or belong to the owner", async () => {
    state.selectedCompany = undefined;

    await expect(createContentForOwner(42, contentInput)).rejects.toThrow(
      "Company not found"
    );
  });

  it("forces a new content record to draft even if an untyped caller sends a privileged status", async () => {
    state.selectedContent = contentForCompany(17);

    await createContentForOwner(42, {
      ...contentInput,
      status: "published",
    } as never);

    expect(state.insertValues).toMatchObject({ status: "draft" });
  });

  it.each(["published", "scheduled", "failed"])(
    "rejects a direct database update to %s",
    async status => {
      state.selectedContent = contentForCompany(17);

      await expect(
        updateContentForOwner(42, 150001, { status } as never)
      ).rejects.toThrow("transição controlada");
      expect(state.updateCalls).toBe(0);
    }
  );

  it("rejects transferring content to a company that does not exist or belong to the owner", async () => {
    state.selectedContent = contentForCompany(17);
    state.selectedCompany = undefined;

    await expect(
      updateContentForOwner(42, 150001, { companyId: 99 })
    ).rejects.toThrow("Company not found");
    expect(state.updateCalls).toBe(0);
  });

  it("rechecks the authenticated owner in the final update predicate", async () => {
    state.selectedContent = contentForCompany(17);

    await updateContentForOwner(42, 150001, { caption: "Legenda revisada" });

    expect(state.updateCalls).toBe(1);
    expect(sqlText(state.updateWhere)).toContain("`contents`.`id` = ?");
    expect(sqlText(state.updateWhere)).toContain(
      "`contents`.`companyId` in (select `companies`.`id` from `companies` where `companies`.`ownerId` = ?)"
    );
  });

  it("rechecks the authenticated owner in the final delete predicate", async () => {
    state.selectedContent = contentForCompany(17);

    await deleteContentForOwner(42, 150001);

    expect(state.deleteCalls).toBe(1);
    expect(sqlText(state.deleteWhere)).toContain("`contents`.`id` = ?");
    expect(sqlText(state.deleteWhere)).toContain(
      "`contents`.`companyId` in (select `companies`.`id` from `companies` where `companies`.`ownerId` = ?)"
    );
  });
});
