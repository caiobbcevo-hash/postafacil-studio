import { IntelligenceError } from "./errors";
import {
  simulationResultSchema,
  type ExecutionPlan,
  type SimulationResult,
} from "./contracts";

export function verifySimulationResult(
  result: unknown,
  plan: ExecutionPlan
): SimulationResult {
  const parsed = simulationResultSchema.safeParse(result);
  if (!parsed.success) {
    throw new IntelligenceError(
      "INVALID_RESULT",
      "O resultado do núcleo não atende ao contrato."
    );
  }
  if (parsed.data.planId !== plan.planId || !parsed.data.simulated) {
    throw new IntelligenceError(
      "INVALID_RESULT",
      "O resultado não corresponde ao plano simulado."
    );
  }
  if (plan.mode === "plan" && parsed.data.status !== "planned") {
    throw new IntelligenceError(
      "INVALID_RESULT",
      "O modo plan exige um resultado planejado."
    );
  }
  if (plan.mode === "draft" && parsed.data.status !== "simulated_draft") {
    throw new IntelligenceError(
      "INVALID_RESULT",
      "O modo draft exige um rascunho simulado."
    );
  }
  return parsed.data;
}
