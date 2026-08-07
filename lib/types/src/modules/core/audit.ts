import type { ActorType } from "./enums";

export interface AuditUserDto {
  /** User id. */
  id: number;
  /** User code. */
  code: string;
  /** User display name. */
  displayName: string;
}

export interface AuditStampDto {
  /** Date and time for the audit event. */
  date: string;
  /** Actor type for the audit event, when available. */
  actorType?: ActorType | null;
  /** User id for the audit event, when available. */
  userId?: string | null;
  /** Resolved user for the audit event, when available. */
  user?: AuditUserDto | null;
  /** Audit mutation id for the audit event, when available. */
  mutationId?: string | null;
}

export interface AuditMetadataDto {
  /** Audit details for creation. */
  created: AuditStampDto;
  /** Audit details for the latest update. */
  updated: AuditStampDto;
}
