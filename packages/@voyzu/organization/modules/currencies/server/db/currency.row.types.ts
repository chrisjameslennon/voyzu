import type { ActorType, OperationReference } from "@voyzu/organization/types/modules/core";
export interface CurrencyRow {
  code: string;
  name: string;
  symbol: string | null;
  status: string;
  has_postings: boolean;
  linked_by: OperationReference[];
  creation_date: string;
  creation_actor_type: ActorType;
  creation_user_id: string | null;
  creation_mutation_id: string | null;
  updated_date: string;
  updated_actor_type: ActorType;
  updated_user_id: string | null;
  updated_mutation_id: string | null;
}

export interface InsertCurrencyRow {
  code: string;
  name: string;
  symbol?: string | null;
  creation_user_id?: string | null;
}

export interface UpdateCurrencyRow {
  name: string;
  symbol?: string | null;
  updated_user_id?: string | null;
  updated_actor_type?: ActorType;
  updated_date?: string;
  updated_mutation_id?: string | null;
}

export interface PatchCurrencyRow {
  name?: string;
  symbol?: string | null;
  updated_user_id?: string | null;
  updated_actor_type?: ActorType;
  updated_date?: string;
  updated_mutation_id?: string | null;
}
