import { z } from "zod";

export const contentStatusSchema = z.enum([
  "draft",
  "pending_approval",
  "approved",
  "scheduled",
  "published",
  "failed",
]);

export type ContentStatus = z.infer<typeof contentStatusSchema>;
const contentTransitionActorSchema = z.enum([
  "editor",
  "approver",
  "scheduler",
  "publisher",
  "executor",
]);

export type ContentTransitionActor =
  | "editor"
  | "approver"
  | "scheduler"
  | "publisher"
  | "executor";

const contentTransitionInputSchema = z.object({
  from: contentStatusSchema,
  to: contentStatusSchema,
  actor: contentTransitionActorSchema,
});

export class ContentLifecycleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentLifecycleError";
  }
}

export class ContentNotFoundError extends Error {
  constructor() {
    super("Conteúdo não encontrado.");
    this.name = "ContentNotFoundError";
  }
}

export class ContentTransitionConflictError extends Error {
  constructor() {
    super("O conteúdo foi alterado durante a transição. Recarregue e tente novamente.");
    this.name = "ContentTransitionConflictError";
  }
}

const transitions: Record<
  ContentStatus,
  Partial<Record<ContentTransitionActor, ContentStatus[]>>
> = {
  draft: { editor: ["pending_approval"] },
  pending_approval: {
    editor: ["draft"],
    approver: ["approved"],
  },
  approved: {
    editor: ["draft"],
    scheduler: ["scheduled"],
  },
  scheduled: {
    publisher: ["published"],
    executor: ["failed"],
  },
  published: {},
  failed: {},
};

export function assertContentTransition(input: {
  from: ContentStatus;
  to: ContentStatus;
  actor: ContentTransitionActor;
}): ContentStatus {
  const parsed = contentTransitionInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new ContentLifecycleError(
      "Entrada inválida para transição de ciclo de vida do conteúdo."
    );
  }

  const { from, to, actor } = parsed.data;
  const allowed = transitions[from][actor] ?? [];
  if (!allowed.includes(to)) {
    throw new ContentLifecycleError(
      `Transição de conteúdo não permitida: ${from} -> ${to}`
    );
  }
  return to;
}

export function isContentTransitionAllowed(input: {
  from: ContentStatus;
  to: ContentStatus;
  actor: ContentTransitionActor;
}): boolean {
  try {
    assertContentTransition(input);
    return true;
  } catch {
    return false;
  }
}

export function assertCrudStatusIsNotChanged(input: object): void {
  if (Object.prototype.hasOwnProperty.call(input, "status")) {
    throw new ContentLifecycleError(
      "Alterações de status devem usar uma transição controlada do ciclo de vida."
    );
  }
}
