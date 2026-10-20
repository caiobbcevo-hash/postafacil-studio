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
export type ContentTransitionActor =
  | "editor"
  | "approver"
  | "scheduler"
  | "publisher"
  | "executor";

export class ContentLifecycleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentLifecycleError";
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
  const allowed = transitions[input.from][input.actor] ?? [];
  if (!allowed.includes(input.to)) {
    throw new ContentLifecycleError(
      `Transição de conteúdo não permitida: ${input.from} -> ${input.to}`
    );
  }
  return input.to;
}

export function isContentTransitionAllowed(input: {
  from: ContentStatus;
  to: ContentStatus;
  actor: ContentTransitionActor;
}): boolean {
  try {
    assertContentTransition(input);
    return true;
  } catch (error) {
    if (error instanceof ContentLifecycleError) return false;
    throw error;
  }
}

export function assertCrudStatusIsNotChanged(input: object): void {
  if (Object.prototype.hasOwnProperty.call(input, "status")) {
    throw new ContentLifecycleError(
      "Alterações de status devem usar uma transição controlada do ciclo de vida."
    );
  }
}
