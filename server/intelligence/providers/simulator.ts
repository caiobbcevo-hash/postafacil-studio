import { IntelligenceError } from "../errors";
import {
  simulationResultSchema,
  type ContentObjective,
  type ExecutionPlan,
  type SimulationResult,
} from "../contracts";

export function simulatePlan(plan: ExecutionPlan): SimulationResult {
  return simulationResultSchema.parse({
    planId: plan.planId,
    status: "planned",
    simulated: true,
    provider: "none",
    content: {
      title: "Plano simulado do PostaFácil",
      briefing:
        "Nenhum conteúdo foi gerado; este resultado descreve apenas o plano.",
      script: "Execução de fornecedor bloqueada nesta fase.",
      caption: "Rascunho simulado — não publicado.",
    },
    warnings: [
      ...plan.warnings,
      "Nenhum conteúdo real foi gerado ou publicado.",
    ],
  });
}

export function simulateDraft(
  plan: ExecutionPlan,
  objective: ContentObjective
): SimulationResult {
  return simulationResultSchema.parse({
    planId: plan.planId,
    status: "simulated_draft",
    simulated: true,
    provider: "simulator",
    content: {
      title: `Rascunho simulado: ${objective.taskType}`,
      briefing: objective.briefing,
      script: `Roteiro simulado para o objetivo: ${objective.goal}`,
      caption: `Legenda simulada para: ${objective.goal}`,
    },
    warnings: [
      ...plan.warnings,
      "Resultado determinístico de teste; nenhum fornecedor externo foi chamado.",
    ],
  });
}

export function simulateExecute(plan: ExecutionPlan): never {
  throw new IntelligenceError(
    "EXTERNAL_EXECUTION_BLOCKED",
    `Modo execute bloqueado para o plano ${plan.planId}.`
  );
}
