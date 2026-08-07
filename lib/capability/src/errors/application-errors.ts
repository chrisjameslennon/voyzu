import type { CapabilityErrorParams } from "@voyzu/types/errors";

export class CapabilityError extends Error {
  readonly capabilityName: string;
  readonly providerName: string;

  constructor(params: CapabilityErrorParams) {
    super(params.message);
    this.name = "CapabilityError";

    this.capabilityName = params.capabilityName;
    this.providerName = params.providerName;
  }
}

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseError";
  }
}

export class DataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DataError";
  }
}

export class InputValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InputValidationError";
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

export class BusinessRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BusinessRuleError";
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}
