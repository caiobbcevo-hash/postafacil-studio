import { afterEach, describe, expect, it, vi } from "vitest";
import { contentObjectiveSchema } from "./contracts";
import { IntelligenceError } from "./errors";
import { buildExecutionPlan } from "./planner";
import { authorizeObjective } from "./policy";
import { createCapabilityRegistry } from "./registry";
import {
  simulateDraft,
  simulateExecute,
  simulatePlan,
} from "./providers/simulator";
import { verifySimulationResult } from "./verification";

const objective = contentObjectiveSchema.parse({
  companyId: 17,
  taskType: "reel",
  goal: "Apresentar a nova coleção",
  briefing: "Mostrar os detalhes da coleção Aurora",
});

function plan(mode: "plan" | "draft" = "draft") {
  return buildExecutionPlan({
    objective,
    ownerId: 42,
    mode,
    registry: createCapabilityRegistry(),
  });
}

describe("intelligence core", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("validates structured objectives and rejects client ownerId", () => {
    expect(objective.requestedCapabilities).toEqual([]);
    expect(() =>
      contentObjectiveSchema.parse({ ...objective, ownerId: 84 })
    ).toThrow();
  });

  it("selects registered capabilities deterministically", () => {
    expect(plan().capabilities).toEqual([
      "content.brief",
      "content.script",
      "content.scenes",
      "content.caption",
    ]);
    expect(plan().planId).toBe(plan().planId);
  });

  it("rejects unavailable capabilities", () => {
    const registry = createCapabilityRegistry({
      "content.caption": { available: false },
    });
    expect(() =>
      buildExecutionPlan({
        objective: { ...objective, requestedCapabilities: ["content.caption"] },
        ownerId: 42,
        mode: "plan",
        registry,
      })
    ).toThrowError(/indisponível/);
  });

  it("enforces authenticated ownership and blocks execute", () => {
    expect(() =>
      authorizeObjective({
        authenticatedOwnerId: 42,
        objective,
        company: { id: 17, ownerId: 84 },
        mode: "draft",
      })
    ).toThrowError(
      new IntelligenceError(
        "COMPANY_NOT_OWNED",
        "A empresa não pertence ao usuário autenticado."
      )
    );
    expect(() =>
      authorizeObjective({
        authenticatedOwnerId: 42,
        objective,
        company: { id: 17, ownerId: 42 },
        mode: "execute",
      })
    ).toThrowError(/bloqueada/);
  });

  it("produces honest deterministic simulated results", () => {
    const draftPlan = plan("draft");
    const result = simulateDraft(draftPlan, objective);
    expect(result).toEqual(simulateDraft(draftPlan, objective));
    expect(result.simulated).toBe(true);
    expect(result.status).toBe("simulated_draft");
    expect(result.warnings.join(" ")).toMatch(/nenhum fornecedor externo/i);
    expect(() => verifySimulationResult(result, draftPlan)).not.toThrow();
  });

  it("returns a plan result without provider execution", () => {
    const planResult = plan("plan");
    expect(simulatePlan(planResult).status).toBe("planned");
    expect(simulatePlan(planResult).provider).toBe("none");
  });

  it("blocks execute and rejects mismatched results", () => {
    const draftPlan = plan("draft");
    expect(() => simulateExecute(draftPlan)).toThrowError(/bloqueado/);
    expect(() =>
      verifySimulationResult(
        { ...simulateDraft(draftPlan, objective), planId: "other" },
        draftPlan
      )
    ).toThrowError(/não corresponde/);
  });

  it("does not perform network or HTTP calls in any simulator mode", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const draftPlan = plan("draft");

    simulatePlan(plan("plan"));
    simulateDraft(draftPlan, objective);
    expect(() => simulateExecute(draftPlan)).toThrowError(/bloqueado/);

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("rejects a result that declares publication as completed", () => {
    const planResult = plan("plan");
    const publishedResult = {
      ...simulatePlan(planResult),
      status: "published",
    };

    expect(() =>
      verifySimulationResult(publishedResult, planResult)
    ).toThrowError(/não atende ao contrato/);
  });
});
