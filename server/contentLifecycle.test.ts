import { describe, expect, it } from "vitest";
import {
  assertContentTransition,
  assertCrudStatusIsNotChanged,
  ContentLifecycleError,
  isContentTransitionAllowed,
} from "./contentLifecycle";

describe("content lifecycle policy", () => {
  it("allows only the explicit editorial and operational transitions", () => {
    expect(
      assertContentTransition({
        from: "draft",
        to: "pending_approval",
        actor: "editor",
      })
    ).toBe("pending_approval");
    expect(
      assertContentTransition({
        from: "pending_approval",
        to: "approved",
        actor: "approver",
      })
    ).toBe("approved");
    expect(
      assertContentTransition({
        from: "approved",
        to: "scheduled",
        actor: "scheduler",
      })
    ).toBe("scheduled");
    expect(
      assertContentTransition({
        from: "scheduled",
        to: "published",
        actor: "publisher",
      })
    ).toBe("published");
    expect(
      assertContentTransition({
        from: "scheduled",
        to: "failed",
        actor: "executor",
      })
    ).toBe("failed");
  });

  it("allows the owner editorial actions represented by the existing policy", () => {
    expect(
      assertContentTransition({ from: "draft", to: "pending_approval", actor: "editor" })
    ).toBe("pending_approval");
    expect(
      assertContentTransition({ from: "pending_approval", to: "approved", actor: "approver" })
    ).toBe("approved");
    expect(
      assertContentTransition({ from: "pending_approval", to: "draft", actor: "editor" })
    ).toBe("draft");
    expect(
      assertContentTransition({ from: "approved", to: "draft", actor: "editor" })
    ).toBe("draft");
  });

  it("rejects invalid editorial transition directions", () => {
    expect(() =>
      assertContentTransition({ from: "draft", to: "approved", actor: "approver" })
    ).toThrow(ContentLifecycleError);
    expect(() =>
      assertContentTransition({ from: "approved", to: "pending_approval", actor: "editor" })
    ).toThrow(ContentLifecycleError);
  });

  it("rejects invalid transitions and keeps published terminal", () => {
    expect(
      isContentTransitionAllowed({
        from: "draft",
        to: "published",
        actor: "editor",
      })
    ).toBe(false);
    expect(
      isContentTransitionAllowed({
        from: "scheduled",
        to: "published",
        actor: "scheduler",
      })
    ).toBe(false);
    expect(() =>
      assertContentTransition({
        from: "published",
        to: "draft",
        actor: "editor",
      })
    ).toThrow(ContentLifecycleError);
  });

  it.each([
    { from: "unknown", to: "draft", actor: "editor" },
    { from: "draft", to: "unknown", actor: "editor" },
    { from: "draft", to: "pending_approval", actor: "owner" },
  ])("rejects invalid runtime transition values with a controlled error", input => {
    expect(() => assertContentTransition(input as never)).toThrow(
      ContentLifecycleError
    );
    expect(isContentTransitionAllowed(input as never)).toBe(false);
  });

  it("returns false when the transition input itself is invalid", () => {
    expect(isContentTransitionAllowed(null as never)).toBe(false);
    expect(isContentTransitionAllowed(undefined as never)).toBe(false);
  });

  it("rejects status changes from the common CRUD path", () => {
    expect(() =>
      assertCrudStatusIsNotChanged({ caption: "ok", status: "published" })
    ).toThrow("transição controlada");
    expect(() => assertCrudStatusIsNotChanged({ status: "failed" })).toThrow(
      "transição controlada"
    );
    expect(() => assertCrudStatusIsNotChanged({ caption: "ok" })).not.toThrow();
  });
});
