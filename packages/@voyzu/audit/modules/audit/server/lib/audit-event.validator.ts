import type { AuditChangeResponseDto, AuditEventResponseDto } from "@voyzu/audit/types";
import { validateFields, type FieldValidator } from "@voyzu/capability/validation";

function validateChange(value: AuditChangeResponseDto): boolean {
  return Number.isInteger(value.id) && value.id > 0 && Boolean(value.fieldPath?.trim());
}

function createResponseValidator() {
  return {
    id: (value) => Number.isInteger(value) && value > 0 ? null : "id must be a positive integer",
    code: (value) => value?.trim() ? null : "code is required",
    packageCode: (value) => value?.trim() ? null : "packageCode is required",
    companyId: (value) => value === null || Number.isInteger(value) && value > 0 ? null : "companyId must be a positive integer or null",
    companyCode: (value) => value === null || value.trim() ? null : "companyCode must be non-blank or null",
    actorType: (value) => value === null || value === "APP" || value === "API" || value === "SYSTEM" ? null : "actorType is invalid",
    actorId: (value) => value === null || value.trim() ? null : "actorId must be non-blank or null",
    actorCode: (value) => value === null || value.trim() ? null : "actorCode must be non-blank or null",
    actorDisplayName: (value) => value === null || value.trim() ? null : "actorDisplayName must be non-blank or null",
    action: (value) => value?.trim() ? null : "action is required",
    entityType: (value) => value?.trim() ? null : "entityType is required",
    entityId: (value) => value?.trim() ? null : "entityId is required",
    entityCode: (value) => value === null || value.trim() ? null : "entityCode must be non-blank or null",
    mutationId: (value) => value === null || value.trim() ? null : "mutationId must be non-blank or null",
    creationDate: (value) => value?.trim() ? null : "creationDate is required",
    changes: (value) => value === undefined || Array.isArray(value) && value.every(validateChange) ? null : "changes are invalid",
  } satisfies {
    [K in keyof AuditEventResponseDto]-?: FieldValidator<AuditEventResponseDto[K]>;
  };
}

export function validateResponse(input: AuditEventResponseDto): string[] {
  return validateFields(input, createResponseValidator());
}
