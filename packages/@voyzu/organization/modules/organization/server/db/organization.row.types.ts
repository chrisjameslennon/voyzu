import type { ActorType } from "@voyzu/organization/types/modules/core";
export interface OrganizationRow {
  id: number;
  code: string;
  organization_name: string;
  status: string;
  has_postings: boolean;
  creation_date: string;
  creation_actor_type: ActorType;
  creation_user_id: string | null;
  creation_mutation_id: string | null;
  updated_date: string;
  updated_actor_type: ActorType;
  updated_user_id: string | null;
  updated_mutation_id: string | null;
  deletion_date: string | null;
  deletion_actor_type: ActorType | null;
  deletion_user_id: string | null;
  deletion_mutation_id: string | null;
}

export interface UpdateOrganizationRow {
  code?: string;
  organization_name: string;
  updated_actor_type?: string;
  updated_user_id?: string | null;
  updated_mutation_id?: string;
}
