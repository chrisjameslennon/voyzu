import type { AuditEventResponseDto } from "./audit-event.response.dto";

export interface AuditEventListResponseDto {
  items: AuditEventResponseDto[];
  nextCursor: string | null;
  totalMatching: number;
}

