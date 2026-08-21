import type { ActorType } from "@voyzu/organization/types/modules/core";
export interface CompanyRow {
  id: number;
  code: string;
  name: string;
  country_code: string;
  country_name?: string;
  base_currency_code: string;
  currency_name?: string;
  report_line_1: string | null;
  report_line_2: string | null;
  report_footer: string | null;
  tax_filing_anchor_month: number;
  tax_filing_interval_months: number;
  use_organization_standard_settings: boolean;
  status: string;
  is_template: boolean;
  organization_id: number;
  has_postings: boolean;
  creation_date: string;
  creation_actor_type: ActorType;
  creation_user_id: string | null;
  creation_mutation_id: string | null;
  updated_date: string;
  updated_actor_type: ActorType;
  updated_user_id: string | null;
  updated_mutation_id: string | null;
}

export interface InsertCompanyRow {
  code: string;
  name: string;
  country_code: string;
  base_currency_code: string;
  report_line_1?: string | null;
  report_line_2?: string | null;
  report_footer?: string | null;
  tax_filing_anchor_month?: number;
  tax_filing_interval_months?: number;
  use_organization_standard_settings?: boolean;
  status?: string;
  organization_id?: number;
  creation_date?: string;
  creation_actor_type?: string;
  creation_user_id?: string | null;
  creation_mutation_id?: string | null;
  updated_date?: string;
  updated_actor_type?: string;
  updated_user_id?: string | null;
  updated_mutation_id?: string | null;
}

export interface UpdateCompanyRow {
  code: string;
  name: string;
  country_code: string;
  base_currency_code: string;
  report_line_1: string | null;
  report_line_2: string | null;
  report_footer: string | null;
  tax_filing_anchor_month: number;
  tax_filing_interval_months: number;
  use_organization_standard_settings: boolean;
  updated_user_id?: string | null;
  updated_date?: string;
  updated_actor_type?: string;
  updated_mutation_id?: string | null;
}

export type PatchCompanyRow = Partial<UpdateCompanyRow>;
