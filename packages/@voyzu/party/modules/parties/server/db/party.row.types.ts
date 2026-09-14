import type { ActorType } from "@voyzu/party/types/modules/core";
export interface PartyRow {
  id: number;
  code: string;
  name: string;
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

export interface InsertPartyRow {
  code: string;
  name: string;
  creation_user_id?: string | null;
}

export interface UpdatePartyRow {
  name: string;
  updated_user_id?: string | null;
  updated_actor_type?: ActorType;
  updated_date?: string;
  updated_mutation_id?: string | null;
}

export interface PatchPartyRow {
  name?: string;
  updated_user_id?: string | null;
  updated_actor_type?: ActorType;
  updated_date?: string;
  updated_mutation_id?: string | null;
}
