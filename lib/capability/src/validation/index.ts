import { runtime } from "../runtime";

export type FieldValidator<T> = (value: T) => string | null;

export type FieldValidators<T extends object> = {
  [K in keyof T]-?: FieldValidator<T[K]>;
};

export function validateFields<T extends object>(
  input: T,
  validators: FieldValidators<T>,
): string[] {
  return (Object.keys(validators) as Array<keyof T>).flatMap((key) => {
    try {
      const error = validators[key](input[key]);
      return error === null ? [] : [error];
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      return [`${String(key)} could not be validated: ${detail}`];
    }
  });
}

export function checkResponse<T>(
  response: T,
  errors: readonly string[],
  context: string,
): T {
  if (errors.length === 0) return response;

  const message = `Invalid ${context} response: ${errors.join("; ")}`;
  if (runtime.isDevLike) throw new Error(message);

  console.error(message);
  return response;
}

function validateDtoValue(
  value: unknown,
  path: string,
  ancestors: Set<object>,
  errors: string[],
): void {
  if (value === undefined) {
    errors.push(`${path} must not be undefined`);
    return;
  }

  if (value === null || typeof value === "string" || typeof value === "boolean") return;

  if (typeof value === "number") {
    if (!Number.isFinite(value)) errors.push(`${path} must be a finite number`);
    return;
  }

  if (typeof value !== "object") {
    errors.push(`${path} contains a non-DTO ${typeof value} value`);
    return;
  }

  if (value instanceof Date) {
    errors.push(`${path} must contain a date string, not a Date instance`);
    return;
  }

  const prototype = Object.getPrototypeOf(value);
  if (!Array.isArray(value) && prototype !== Object.prototype && prototype !== null) {
    errors.push(`${path} must be a plain DTO object`);
    return;
  }

  if (ancestors.has(value)) {
    errors.push(`${path} contains a circular reference`);
    return;
  }

  ancestors.add(value);
  if (Array.isArray(value)) {
    value.forEach((item, index) => validateDtoValue(item, `${path}[${index}]`, ancestors, errors));
  } else {
    for (const [key, item] of Object.entries(value)) {
      validateDtoValue(item, `${path}.${key}`, ancestors, errors);
    }
  }
  ancestors.delete(value);
}

/** Validates the runtime invariants common to all JSON response DTOs. */
export function validateDtoResponse(value: unknown): string[] {
  const errors: string[] = [];
  validateDtoValue(value, "response", new Set<object>(), errors);
  return errors;
}

/** Applies the standard response policy to a service function. */
export function withResponseValidation<TArgs extends unknown[], TResult>(
  service: (...args: TArgs) => Promise<TResult>,
  context: string,
): (...args: TArgs) => Promise<TResult> {
  return async (...args) => {
    const response = await service(...args);
    return checkResponse(response, validateDtoResponse(response), context);
  };
}
