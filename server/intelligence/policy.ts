import { IntelligenceError } from "./errors";
import type { ContentObjective, IntelligenceMode } from "./contracts";

export type OwnedCompany = { id: number; ownerId: number };

export function authorizeObjective(input: {
  authenticatedOwnerId: number | null | undefined;
  objective: ContentObjective;
  company: OwnedCompany | null | undefined;
  mode: IntelligenceMode;
}) {
  if (!input.authenticatedOwnerId) {
    throw new IntelligenceError(
      "UNAUTHENTICATED",
      "Usuário autenticado é necessário."
    );
  }
  if (!input.company) {
    throw new IntelligenceError("COMPANY_NOT_FOUND", "Empresa não encontrada.");
  }
  if (
    input.company.id !== input.objective.companyId ||
    input.company.ownerId !== input.authenticatedOwnerId
  ) {
    throw new IntelligenceError(
      "COMPANY_NOT_OWNED",
      "A empresa não pertence ao usuário autenticado."
    );
  }
  if (input.mode === "execute") {
    throw new IntelligenceError(
      "EXTERNAL_EXECUTION_BLOCKED",
      "Execução externa está bloqueada nesta fase."
    );
  }

  return {
    ownerId: input.authenticatedOwnerId,
    companyId: input.company.id,
    approvalRequired:
      input.objective.approvalRequired || input.mode === "draft",
    externalExecutionBlocked: true as const,
  };
}
