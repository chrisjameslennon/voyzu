import type { ActorType } from "@voyzu/localization/types/modules/core";
export interface InsertCountryRow {
  code: string;
  name: string;
  currency_code: string;
  creation_user_id?: string | null;
  creation_mutation_id?: string | null;
}

export interface UpdateCountryRow {
  name: string;
  currency_code: string;
  updated_user_id?: string | null;
  updated_actor_type?: ActorType;
  updated_date?: string;
  updated_mutation_id?: string | null;
}

export interface PatchCountryRow {
  name?: string;
  currency_code?: string;
  updated_user_id?: string | null;
  updated_actor_type?: ActorType;
  updated_date?: string;
  updated_mutation_id?: string | null;
}

export interface CountryRow {
  code: string;
  name: string;
  currency_code: string;
  currency_name: string;
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
