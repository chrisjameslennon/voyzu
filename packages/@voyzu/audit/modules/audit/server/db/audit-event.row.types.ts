import type { ActorType } from "@voyzu/types/modules/core";

export interface AuditEventRow {
  id: number;
  code: string;
  package_code: string;
  company_id: number | null;
  company_code: string | null;
  actor_type: ActorType | null;
  actor_id: string | null;
  actor_code: string | null;
  actor_display_name: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  entity_code: string | null;
  mutation_id: string | null;
  creation_date: string;
}

export interface AuditChangeRow {
  id: number;
  audit_event_id: number;
  field_path: string;
  old_value: unknown;
  new_value: unknown;
}

