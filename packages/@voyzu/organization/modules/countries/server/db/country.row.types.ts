import type { ActorType } from "@voyzu/organization/types/modules/core";
import type { OperationReference } from "@voyzu/organization/types/modules/core";
export interface InsertCountryRow {
  code: string;
  name: string;
  currency_code: string;
  tax_filing_anchor_month?: number;
  tax_filing_interval_months?: number;
  creation_user_id?: string | null;
  creation_mutation_id?: string | null;
}

export interface UpdateCountryRow {
  name: string;
  currency_code: string;
  tax_filing_anchor_month: number;
  tax_filing_interval_months: number;
  updated_user_id?: string | null;
  updated_actor_type?: ActorType;
  updated_date?: string;
  updated_mutation_id?: string | null;
}

export interface PatchCountryRow {
  name?: string;
  currency_code?: string;
  tax_filing_anchor_month?: number;
  tax_filing_interval_months?: number;
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
  financial_period_start_month: string | null;
  tax_filing_anchor_month: number;
  tax_filing_interval_months: number;
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
