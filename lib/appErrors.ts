export type AppErrorCode =
  | "amount-minor-integer"
  | "amount-minor-positive"
  | "date-format-invalid"
  | "date-invalid"
  | "month-format-invalid"
  | "month-invalid"
  | "category-name-required"
  | "category-name-too-long"
  | "category-name-duplicate"
  | "category-in-use"
  | "category-not-found"
  | "transaction-not-found"
  | "category-missing"
  | "transaction-type-mismatch"
  | "opening-balance-integer";

const knownAppErrorCodes = [
  "amount-minor-integer",
  "amount-minor-positive",
  "date-format-invalid",
  "date-invalid",
  "month-format-invalid",
  "month-invalid",
  "category-name-required",
  "category-name-too-long",
  "category-name-duplicate",
  "category-in-use",
  "category-not-found",
  "transaction-not-found",
  "category-missing",
  "transaction-type-mismatch",
  "opening-balance-integer",
] as const satisfies readonly AppErrorCode[];

export class AppError extends Error {
  code: AppErrorCode;

  constructor(code: AppErrorCode) {
    super(code);
    this.name = "AppError";
    this.code = code;
  }
}

export function isAppError(error: unknown): error is AppError {
  if (error instanceof AppError) {
    return true;
  }

  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code?: unknown }).code === "string" &&
    knownAppErrorCodes.includes((error as { code: string }).code as AppErrorCode)
  );
}
