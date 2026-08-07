export interface FieldDescriptor {
  label: string;
  value: string;
  rules: FieldRule[];
  enabled?: boolean;
}

export type RequiredRule = { kind: "required" };
export type FormatRule = { kind: "format"; test: (v: string) => boolean; message: string };
export type FieldRule = RequiredRule | FormatRule;

export const required = (): RequiredRule => ({ kind: "required" });

export const pattern = (re: RegExp, message: string): FormatRule => ({
  kind: "format",
  test: (value) => re.test(value),
  message,
});

export const maxLength = (max: number, message?: string): FormatRule => ({
  kind: "format",
  test: (value) => value.length <= max,
  message: message ?? `Must be ${max} characters or less`,
});

export const minLength = (min: number, message?: string): FormatRule => ({
  kind: "format",
  test: (value) => value.length >= min,
  message: message ?? `Must be at least ${min} characters`,
});

function withIndefiniteArticle(label: string): string {
  return `${/^[aeiou]/i.test(label) ? "an" : "a"} ${label}`;
}

function formatRequiredList(labels: string[]): string {
  const values = labels.map(withIndefiniteArticle);
  if (values.length === 1) return values[0];
  if (values.length === 2) return `${values[0]}, and ${values[1]}`;
  return `${values.slice(0, -1).join(", ")}, and ${values[values.length - 1]}`;
}

export function computeErrors(fields: Record<string, FieldDescriptor>): string[] {
  const missing: string[] = [];
  const formatErrors: string[] = [];

  for (const field of Object.values(fields)) {
    if (field.enabled === false) continue;

    for (const rule of field.rules) {
      if (rule.kind === "required") {
        if (!field.value.trim()) {
          missing.push(field.label);
          break;
        }
      } else if (rule.kind === "format" && !rule.test(field.value)) {
        formatErrors.push(rule.message);
      }
    }
  }

  const errors: string[] = [];
  if (missing.length > 0) {
    errors.push(`You must supply ${formatRequiredList(missing)}`);
  }

  return [...errors, ...formatErrors];
}

export function fieldHasError(field: FieldDescriptor): boolean {
  for (const rule of field.rules) {
    if (rule.kind === "required" && !field.value.trim()) return true;
    if (rule.kind === "format" && !rule.test(field.value)) return true;
  }
  return false;
}
