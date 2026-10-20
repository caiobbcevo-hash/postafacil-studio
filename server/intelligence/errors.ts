export type IntelligenceErrorCode =
  | "INVALID_OBJECTIVE"
  | "UNAUTHENTICATED"
  | "COMPANY_NOT_FOUND"
  | "COMPANY_NOT_OWNED"
  | "CAPABILITY_UNAVAILABLE"
  | "EXTERNAL_EXECUTION_BLOCKED"
  | "INVALID_RESULT";

export class IntelligenceError extends Error {
  constructor(
    public readonly code: IntelligenceErrorCode,
    message: string
  ) {
    super(message);
    this.name = "IntelligenceError";
  }
}
