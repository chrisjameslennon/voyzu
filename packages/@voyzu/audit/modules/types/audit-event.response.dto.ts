import type { ActorType } from "@voyzu/types/modules/core";
export interface AuditChangeResponseDto {
  id: number;
  fieldPath: string;
  oldValue: unknown;
  newValue: unknown;
}

export interface AuditEventResponseDto {
  id: number;
  code: string;
  packageCode: string;
  companyId: number | null;
  companyCode: string | null;
  actorType: ActorType | null;
  actorId: string | null;
  actorCode: string | null;
  actorDisplayName: string | null;
  action: string;
  entityType: string;
  entityId: string;
  entityCode: string | null;
  mutationId: string | null;
  creationDate: string;
  changes?: AuditChangeResponseDto[];
}

