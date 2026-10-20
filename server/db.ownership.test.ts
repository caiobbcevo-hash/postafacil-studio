import { beforeEach, describe, expect, it, vi } from "vitest";
import { MySqlDialect } from "drizzle-orm/mysql-core";

const state = vi.hoisted(() => ({
  selectedContent: undefined as Record<string, unknown> | undefined,
  updateWhere: undefined as unknown,
  deleteWhere: undefined as unknown,
  updateCalls: 0,
  deleteCalls: 0,
}));

vi.mock("drizzle-orm/mysql2", () => ({
  drizzle: vi.fn(() => ({
    select: () => ({
      from: () => ({
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
      }),
    }),
    update: () => ({
      set: () => ({
        where: async (condition: unknown) => {
          state.updateWhere = condition;
          state.updateCalls += 1;
        },
      }),
    }),
    delete: () => ({
      where: async (condition: unknown) => {
        state.deleteWhere = condition;
        state.deleteCalls += 1;
      },
    }),
  })),
}));

const { deleteContentForOwner, updateContentForOwner } = await import("./db");

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

describe("content mutation ownership", () => {
  beforeEach(() => {
    process.env.DATABASE_URL = "mysql://test-only";
    state.selectedContent = undefined;
    state.updateWhere = undefined;
    state.deleteWhere = undefined;
    state.updateCalls = 0;
    state.deleteCalls = 0;
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
