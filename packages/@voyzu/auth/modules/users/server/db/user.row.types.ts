import type { ActorType } from "@voyzu/types/modules/core";
export interface UserRow {
  id: number;
  code: string;
  email: string | null;
  display_name: string;
  password_hash: string;
  role: string;
  access_mode: string;
  show_developer_links: boolean;
  status: string;
  creation_date: string;
  creation_actor_type: ActorType;
  creation_user_id: string | null;
  creation_mutation_id: string | null;
  updated_date: string;
  updated_actor_type: ActorType;
  updated_user_id: string | null;
  updated_mutation_id: string | null;
}

export interface UserAssignmentRow {
  id: number;
  user_id: number;
  company_id: number;
  company_code: string;
  company_name: string;
}
