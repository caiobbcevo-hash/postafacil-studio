import { createHash } from "node:crypto";
import type {
  ContentObjective,
  ExecutionPlan,
  IntelligenceMode,
  CapabilityName,
} from "./contracts";
import type { CapabilityRegistry } from "./registry";

const defaults: Record<ContentObjective["taskType"], CapabilityName[]> = {
  reel: [
    "content.brief",
    "content.script",
    "content.scenes",
    "content.caption",
  ],
  caption: ["content.brief", "content.caption"],
  idea: ["content.brief"],
  campaign: ["content.brief", "content.script", "content.caption"],
};

export function buildExecutionPlan(input: {
  objective: ContentObjective;
  ownerId: number;
  mode: IntelligenceMode;
  registry: CapabilityRegistry;
}): ExecutionPlan {
  const selected =
    input.objective.requestedCapabilities.length > 0
      ? input.objective.requestedCapabilities
      : defaults[input.objective.taskType];
  input.registry.require(selected);
  const fingerprint = JSON.stringify({
    ownerId: input.ownerId,
    companyId: input.objective.companyId,
    taskType: input.objective.taskType,
    goal: input.objective.goal,
    briefing: input.objective.briefing,
    capabilities: selected,
    mode: input.mode,
  });
  const planId = `sim-${createHash("sha256").update(fingerprint).digest("hex").slice(0, 16)}`;

  return {
    planId,
    ownerId: input.ownerId,
    companyId: input.objective.companyId,
    taskType: input.objective.taskType,
    mode: input.mode,
    capabilities: [...selected],
    approvalRequired:
      input.objective.approvalRequired || input.mode === "draft",
    externalExecutionBlocked: true,
    warnings: ["Este plano é simulado e não chama fornecedores externos."],
  };
}
