import type { ActorType } from "@voyzu/organization/types/modules/core";
import { randomUUID } from "node:crypto";

import type { DbExecutor } from "@voyzu/capability/db";
import { getDb, withTransaction } from "@voyzu/capability/db";
import { BusinessRuleError, ConflictError, DataError, InputValidationError, NotFoundError } from "@voyzu/capability/errors";
import { ChangeCode } from "@voyzu/organization/companies/domain/operation-policy";
import type { CompanyBatchPatchRequestDto, CompanyBatchUpdateRequestDto, CompanyCreateRequestDto, CompanyPatchRequestDto, CompanyResponseDto, CompanyUpdateRequestDto } from "@voyzu/organization/types/modules/companies";
import type { Filter, ListOptions } from "@voyzu/types/params";

import { getCurrentActorType, getCurrentUser, UserRepo } from "@voyzu/auth/users/server";
import { CompanyRepo } from "../db/company.repo";
import type { CompanyRow } from "../db/company.row.types";

import { toDto, toInsertRow, toPatchRow, toUpdateRow } from "./company.mapper";

interface CompanyAuditStamp {
  actorType: ActorType;
  userId: string | null;
  mutationId: string;
  timestamp: string;
}

interface CompanyMutationOptions {
  actorType?: ActorType;
}

interface CopyCompanyDefaultsOptions {
  copyLinkedSettings: boolean;
}

const COMPANY_FINANCIAL_SETTINGS_TABLE_DELETE_ORDER = [
  "financial_document_default",
  "dimension_value",
  "dimension",
  "bank_cash_control_account",
  "inventory_control_account",
  "tax_control_account",
  "ar_control_account",
  "ap_control_account",
  "gl_account",
  "gl_account_category",
] as const;

const MONTH_CODES = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const BACK_YEARS = 2;
const FORWARD_YEARS = 5;

const AUDIT_COLUMNS = `
  creation_date, creation_actor_type, creation_user_id, creation_mutation_id,
  updated_date, updated_actor_type, updated_user_id, updated_mutation_id
`;

const AUDIT_SELECT_VALUES = `
  now(), $3::actor_type, $4, $5::uuid,
  now(), $3::actor_type, $4, $5::uuid
`;

async function createAuditStamp(options: CompanyMutationOptions = {}): Promise<CompanyAuditStamp> {
  const currentUser = await getCurrentUser();
  return {
    actorType: options.actorType ?? getCurrentActorType(),
    userId: currentUser ? String(currentUser.id) : null,
    mutationId: randomUUID(),
    timestamp: new Date().toISOString(),
  };
}

function auditParams(audit: CompanyAuditStamp): [string, string | null, string] {
  return [audit.actorType, audit.userId, audit.mutationId];
}

function withCreationAudit<T extends object>(row: T, audit: CompanyAuditStamp): T & {
  creation_date: string;
  creation_actor_type: ActorType;
  creation_user_id: string | null;
  creation_mutation_id: string;
  updated_date: string;
  updated_actor_type: ActorType;
  updated_user_id: string | null;
  updated_mutation_id: string;
} {
  return {
    ...row,
    creation_date: audit.timestamp,
    creation_actor_type: audit.actorType,
    creation_user_id: audit.userId,
    creation_mutation_id: audit.mutationId,
    updated_date: audit.timestamp,
    updated_actor_type: audit.actorType,
    updated_user_id: audit.userId,
    updated_mutation_id: audit.mutationId,
  };
}

function withUpdateAudit<T extends object>(row: T, audit: CompanyAuditStamp): T & {
  updated_date: string;
  updated_actor_type: ActorType;
  updated_user_id: string | null;
  updated_mutation_id: string;
} {
  return {
    ...row,
    updated_date: audit.timestamp,
    updated_actor_type: audit.actorType,
    updated_user_id: audit.userId,
    updated_mutation_id: audit.mutationId,
  };
}

interface CountryTaxProfileRow {
  financial_period_start_month: string | null;
  tax_filing_anchor_month: number | null;
  tax_filing_interval_months: number | null;
}

class OrganizationRepo {
  constructor(private readonly db: DbExecutor) { }

  async get(): Promise<{ id: number } | null> {
    const { rows } = await this.db.query("SELECT id FROM organization LIMIT 1");
    return rows[0] ? { id: Number(rows[0].id) } : null;
  }
}

class CountryRepo {
  constructor(private readonly db: DbExecutor) { }

  async get(code: string): Promise<CountryTaxProfileRow | null> {
    const { rows } = await this.db.query(
      `SELECT financial_period_start_month, tax_filing_anchor_month, tax_filing_interval_months
       FROM country
       WHERE code = $1 AND status != 'DELETED'`,
      [code],
    );
    if (!rows[0]) return null;
    return {
      financial_period_start_month: rows[0].financial_period_start_month == null ? null : String(rows[0].financial_period_start_month),
      tax_filing_anchor_month: rows[0].tax_filing_anchor_month == null ? null : Number(rows[0].tax_filing_anchor_month),
      tax_filing_interval_months: rows[0].tax_filing_interval_months == null ? null : Number(rows[0].tax_filing_interval_months),
    };
  }
}

class FinancialYearRepo {
  constructor(private readonly db: DbExecutor) { }

  async insert(row: {
    company_id: number;
    code: string;
    name: string;
    start_date: string;
    end_date: string;
    status: string;
  }, audit: CompanyAuditStamp): Promise<{ id: number }> {
    const { rows } = await this.db.query(
      `INSERT INTO fiscal_year (
         company_id, code, name, start_date, end_date, status,
         ${AUDIT_COLUMNS}
       )
       VALUES (
         $1, $2, $3, $4, $5, $6,
         now(), $7::actor_type, $8, $9::uuid,
         now(), $7::actor_type, $8, $9::uuid
       )
       RETURNING id`,
      [row.company_id, row.code, row.name, row.start_date, row.end_date, row.status, ...auditParams(audit)],
    );
    return { id: Number(rows[0].id) };
  }
}

class FinancialPeriodRepo {
  constructor(private readonly db: DbExecutor) { }

  async seedMonthlyPeriods(
    companyId: number,
    fiscalYearId: number,
    startDate: string,
    endDate: string,
    audit: CompanyAuditStamp,
  ): Promise<void> {
    const fyStart = new Date(`${startDate}T00:00:00`);
    const fyEnd = new Date(`${endDate}T00:00:00`);
    const sql = `
      INSERT INTO fiscal_period (
        company_id, fiscal_year_id, code, name, start_date, end_date, status,
        ${AUDIT_COLUMNS}
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, 'OPEN',
        now(), $7::actor_type, $8, $9::uuid,
        now(), $7::actor_type, $8, $9::uuid
      )
      ON CONFLICT (fiscal_year_id, code) DO NOTHING
    `;

    let current = new Date(fyStart.getFullYear(), fyStart.getMonth(), 1);
    while (current <= fyEnd) {
      const monthIndex = current.getMonth();
      const year = current.getFullYear();
      const periodStart = localDateString(new Date(year, monthIndex, 1));
      const periodEnd = localDateString(new Date(year, monthIndex + 1, 0));
      await this.db.query(sql, [companyId, fiscalYearId, MONTH_CODES[monthIndex], MONTH_NAMES[monthIndex], periodStart, periodEnd, ...auditParams(audit)]);
      current = new Date(year, monthIndex + 1, 1);
    }
  }
}

function localDateString(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startMonthIndex(financialPeriodStartMonth: string | null): number {
  const idx = MONTH_CODES.indexOf(financialPeriodStartMonth ?? "JAN");
  return idx >= 0 ? idx : 0;
}

function currentFyCode(today: Date, smIndex: number): number {
  if (smIndex === 0) return today.getFullYear();
  return today.getMonth() >= smIndex ? today.getFullYear() + 1 : today.getFullYear();
}

function fyDates(fyCode: number, smIndex: number): { startDate: string; endDate: string } {
  const startYear = smIndex === 0 ? fyCode : fyCode - 1;
  const sm = String(smIndex + 1).padStart(2, "0");
  const startDate = `${startYear}-${sm}-01`;

  const emIndex = (smIndex + 11) % 12;
  const lastDay = new Date(fyCode, emIndex + 1, 0).getDate();
  const em = String(emIndex + 1).padStart(2, "0");
  const endDate = `${fyCode}-${em}-${String(lastDay).padStart(2, "0")}`;

  return { startDate, endDate };
}

function fyStatus(startDate: string, endDate: string, todayStr: string): "INACTIVE" | "OPEN" | "PLANNED" {
  if (endDate < todayStr) return "INACTIVE";
  if (startDate <= todayStr) return "OPEN";
  return "PLANNED";
}

async function seedFiscalCalendar(
  companyId: number,
  countryCode: string,
  db: DbExecutor,
  audit: CompanyAuditStamp,
): Promise<void> {
  const country = await new CountryRepo(db).get(countryCode);
  const smIndex = startMonthIndex(country?.financial_period_start_month ?? null);

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const baseFyCode = currentFyCode(today, smIndex);

  const fyRepo = new FinancialYearRepo(db);
  const periodRepo = new FinancialPeriodRepo(db);

  for (let offset = -BACK_YEARS; offset <= FORWARD_YEARS; offset++) {
    const fyCode = baseFyCode + offset;
    const { startDate, endDate } = fyDates(fyCode, smIndex);
    const status = fyStatus(startDate, endDate, todayStr);

    const year = await fyRepo.insert({
      company_id: companyId,
      code: `FY-${fyCode}`,
      name: `Financial Year ${fyCode}`,
      start_date: startDate,
      end_date: endDate,
      status,
    }, audit);

    if (status === "OPEN") {
      await periodRepo.seedMonthlyPeriods(companyId, year.id, startDate, endDate, audit);
    }
  }
}

async function copyCompanyDefaultsFromTemplate(
  companyId: number,
  db: DbExecutor,
  audit: CompanyAuditStamp,
  options: CopyCompanyDefaultsOptions = { copyLinkedSettings: true },
): Promise<void> {
  const template = await db.query(
    `SELECT id FROM company WHERE is_template = true AND status = 'ACTIVE' ORDER BY id LIMIT 1`,
  );
  const templateCompanyId = template.rows[0]?.id == null ? null : Number(template.rows[0].id);
  if (!templateCompanyId) throw new Error("Template company not found");
  if (templateCompanyId === companyId) return;

  if (options.copyLinkedSettings) {
    await db.query(
      `
      INSERT INTO gl_account_category (company_id, code, name, account_type, sequence, status, ${AUDIT_COLUMNS})
      SELECT $1, code, name, account_type, sequence, status, ${AUDIT_SELECT_VALUES}
      FROM gl_account_category
      WHERE company_id = $2 AND status = 'ACTIVE'
      ON CONFLICT (company_id, code) DO NOTHING
      `,
      [companyId, templateCompanyId, ...auditParams(audit)],
    );

    await db.query(
      `
    INSERT INTO gl_account (company_id, code, name, account_type, account_category_id, status, ${AUDIT_COLUMNS})
    SELECT $1, ga.code, ga.name, ga.account_type, target_category.id, ga.status, ${AUDIT_SELECT_VALUES}
    FROM gl_account ga
    LEFT JOIN gl_account_category source_category
      ON source_category.company_id = ga.company_id AND source_category.id = ga.account_category_id
    LEFT JOIN gl_account_category target_category
      ON target_category.company_id = $1 AND target_category.code = source_category.code
    WHERE ga.company_id = $2 AND ga.status = 'ACTIVE'
    ON CONFLICT (company_id, code) DO NOTHING
    `,
      [companyId, templateCompanyId, ...auditParams(audit)],
    );

    for (const table of ["ar_control_account", "ap_control_account"]) {
      await db.query(
        `
      INSERT INTO ${table} (company_id, code, ledger, name, gl_account_id, status, ${AUDIT_COLUMNS})
      SELECT $1, source.code, source.ledger, source.name, target_gl.id, source.status, ${AUDIT_SELECT_VALUES}
      FROM ${table} source
      JOIN gl_account source_gl ON source_gl.company_id = source.company_id AND source_gl.id = source.gl_account_id
      JOIN gl_account target_gl ON target_gl.company_id = $1 AND target_gl.code = source_gl.code
      WHERE source.company_id = $2 AND source.status = 'ACTIVE'
      ON CONFLICT (company_id, code) DO NOTHING
      `,
        [companyId, templateCompanyId, ...auditParams(audit)],
      );
    }

    await db.query(
      `
    INSERT INTO tax_control_account (company_id, code, ledger, name, description, tax_family_code, gl_account_id, status, ${AUDIT_COLUMNS})
    SELECT $1, source.code, source.ledger, source.name, source.description, source.tax_family_code, target_gl.id, source.status, ${AUDIT_SELECT_VALUES}
    FROM tax_control_account source
    JOIN gl_account source_gl ON source_gl.company_id = source.company_id AND source_gl.id = source.gl_account_id
    JOIN gl_account target_gl ON target_gl.company_id = $1 AND target_gl.code = source_gl.code
    WHERE source.company_id = $2 AND source.status = 'ACTIVE'
    ON CONFLICT (company_id, code) DO NOTHING
    `,
      [companyId, templateCompanyId, ...auditParams(audit)],
    );

    await db.query(
      `
    INSERT INTO inventory_control_account (company_id, code, ledger, name, description, gl_account_id, status, ${AUDIT_COLUMNS})
    SELECT $1, source.code, source.ledger, source.name, source.description, target_gl.id, source.status, ${AUDIT_SELECT_VALUES}
    FROM inventory_control_account source
    JOIN gl_account source_gl ON source_gl.company_id = source.company_id AND source_gl.id = source.gl_account_id
    JOIN gl_account target_gl ON target_gl.company_id = $1 AND target_gl.code = source_gl.code
    WHERE source.company_id = $2 AND source.status = 'ACTIVE'
    ON CONFLICT (company_id, code) DO NOTHING
    `,
      [companyId, templateCompanyId, ...auditParams(audit)],
    );

    await db.query(
      `
    INSERT INTO bank_cash_control_account (
      company_id, code, ledger, type, gl_account_id,
      bank_name, bank_branch_name, bank_account_identifier, cash_account_identifier, status, ${AUDIT_COLUMNS}
    )
    SELECT
      $1, source.code, source.ledger, source.type, target_gl.id,
      source.bank_name, source.bank_branch_name, source.bank_account_identifier, source.cash_account_identifier, source.status, ${AUDIT_SELECT_VALUES}
    FROM bank_cash_control_account source
    JOIN gl_account source_gl ON source_gl.company_id = source.company_id AND source_gl.id = source.gl_account_id
    JOIN gl_account target_gl ON target_gl.company_id = $1 AND target_gl.code = source_gl.code
    WHERE source.company_id = $2 AND source.status = 'ACTIVE'
    ON CONFLICT (company_id, code) DO NOTHING
    `,
      [companyId, templateCompanyId, ...auditParams(audit)],
    );

    await db.query(
      `
    INSERT INTO dimension (company_id, code, name, status, ${AUDIT_COLUMNS})
    SELECT $1, code, name, status, ${AUDIT_SELECT_VALUES}
    FROM dimension
    WHERE company_id = $2 AND status = 'ACTIVE'
    ON CONFLICT (company_id, code) DO NOTHING
    `,
      [companyId, templateCompanyId, ...auditParams(audit)],
    );

    await db.query(
      `
    INSERT INTO dimension_value (company_id, dimension_id, name, status, ${AUDIT_COLUMNS})
    SELECT $1, target_dimension.id, source_value.name, source_value.status, ${AUDIT_SELECT_VALUES}
    FROM dimension_value source_value
    JOIN dimension source_dimension
      ON source_dimension.company_id = source_value.company_id AND source_dimension.id = source_value.dimension_id
    JOIN dimension target_dimension
      ON target_dimension.company_id = $1 AND target_dimension.code = source_dimension.code
    WHERE source_value.company_id = $2 AND source_value.status = 'ACTIVE'
    ON CONFLICT (company_id, dimension_id, lower(name)) DO NOTHING
    `,
      [companyId, templateCompanyId, ...auditParams(audit)],
    );

    await db.query(
      `
    INSERT INTO financial_document_default (
      company_id, document_code, code, name, target_type, allowed_account_types,
      override_property_name, override_scope, gl_account_id, bank_cash_control_account_id, status, ${AUDIT_COLUMNS}
    )
    SELECT
      $1, source.document_code, source.code, source.name, source.target_type, source.allowed_account_types,
      source.override_property_name, source.override_scope, target_gl.id, target_bank.id, source.status, ${AUDIT_SELECT_VALUES}
    FROM financial_document_default source
    LEFT JOIN gl_account source_gl
      ON source_gl.company_id = source.company_id AND source_gl.id = source.gl_account_id
    LEFT JOIN gl_account target_gl
      ON target_gl.company_id = $1 AND target_gl.code = source_gl.code
    LEFT JOIN bank_cash_control_account source_bank
      ON source_bank.company_id = source.company_id AND source_bank.id = source.bank_cash_control_account_id
    LEFT JOIN bank_cash_control_account target_bank
      ON target_bank.company_id = $1 AND target_bank.code = source_bank.code
    WHERE source.company_id = $2 AND source.status = 'ACTIVE'
    ON CONFLICT (company_id, document_code, code) DO NOTHING
    `,
      [companyId, templateCompanyId, ...auditParams(audit)],
    );
  }

  await db.query(
    `
      INSERT INTO item_posting_profile (
        company_id, code, name, description, is_sold, is_purchased, is_consumed,
        revenue_gl_account_id, cogs_gl_account_id, purchase_expense_gl_account_id,
        consumption_gl_account_id, adjustment_gain_gl_account_id, adjustment_loss_gl_account_id,
        status, ${AUDIT_COLUMNS}
      )
      SELECT
        $1, source.code, source.name, source.description, source.is_sold, source.is_purchased, source.is_consumed,
        revenue_target.id, cogs_target.id, purchase_target.id,
        consumption_target.id, gain_target.id, loss_target.id,
        source.status, ${AUDIT_SELECT_VALUES}
      FROM item_posting_profile source
      LEFT JOIN gl_account revenue_source ON revenue_source.company_id = source.company_id AND revenue_source.id = source.revenue_gl_account_id
      LEFT JOIN gl_account revenue_target ON revenue_target.company_id = $1 AND $6::boolean AND revenue_target.code = revenue_source.code
      LEFT JOIN gl_account cogs_source ON cogs_source.company_id = source.company_id AND cogs_source.id = source.cogs_gl_account_id
      LEFT JOIN gl_account cogs_target ON cogs_target.company_id = $1 AND $6::boolean AND cogs_target.code = cogs_source.code
      LEFT JOIN gl_account purchase_source ON purchase_source.company_id = source.company_id AND purchase_source.id = source.purchase_expense_gl_account_id
      LEFT JOIN gl_account purchase_target ON purchase_target.company_id = $1 AND $6::boolean AND purchase_target.code = purchase_source.code
      LEFT JOIN gl_account consumption_source ON consumption_source.company_id = source.company_id AND consumption_source.id = source.consumption_gl_account_id
      LEFT JOIN gl_account consumption_target ON consumption_target.company_id = $1 AND $6::boolean AND consumption_target.code = consumption_source.code
      LEFT JOIN gl_account gain_source ON gain_source.company_id = source.company_id AND gain_source.id = source.adjustment_gain_gl_account_id
      LEFT JOIN gl_account gain_target ON gain_target.company_id = $1 AND $6::boolean AND gain_target.code = gain_source.code
      LEFT JOIN gl_account loss_source ON loss_source.company_id = source.company_id AND loss_source.id = source.adjustment_loss_gl_account_id
      LEFT JOIN gl_account loss_target ON loss_target.company_id = $1 AND $6::boolean AND loss_target.code = loss_source.code
      WHERE source.company_id = $2 AND source.status = 'ACTIVE'
      ON CONFLICT (company_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        is_sold = EXCLUDED.is_sold,
        is_purchased = EXCLUDED.is_purchased,
        is_consumed = EXCLUDED.is_consumed,
        revenue_gl_account_id = EXCLUDED.revenue_gl_account_id,
        cogs_gl_account_id = EXCLUDED.cogs_gl_account_id,
        purchase_expense_gl_account_id = EXCLUDED.purchase_expense_gl_account_id,
        consumption_gl_account_id = EXCLUDED.consumption_gl_account_id,
        adjustment_gain_gl_account_id = EXCLUDED.adjustment_gain_gl_account_id,
        adjustment_loss_gl_account_id = EXCLUDED.adjustment_loss_gl_account_id,
        status = EXCLUDED.status,
        updated_date = EXCLUDED.updated_date,
        updated_actor_type = EXCLUDED.updated_actor_type,
        updated_user_id = EXCLUDED.updated_user_id,
        updated_mutation_id = EXCLUDED.updated_mutation_id
      `,
    [companyId, templateCompanyId, ...auditParams(audit), options.copyLinkedSettings],
  );

  await db.query(
    `
    INSERT INTO inventory_category (company_id, code, name, description, posting_profile_id, status, ${AUDIT_COLUMNS})
    SELECT $1, source.code, source.name, source.description, target_profile.id, source.status, ${AUDIT_SELECT_VALUES}
    FROM inventory_category source
    JOIN item_posting_profile source_profile
      ON source_profile.company_id = source.company_id AND source_profile.id = source.posting_profile_id
    JOIN item_posting_profile target_profile
      ON target_profile.company_id = $1 AND target_profile.code = source_profile.code
    WHERE source.company_id = $2 AND source.status = 'ACTIVE'
    ON CONFLICT (company_id, code) DO NOTHING
    `,
    [companyId, templateCompanyId, ...auditParams(audit)],
  );

  await db.query(
    `
    INSERT INTO inventory_item (
      company_id, code, name, description, item_type, category_id, unit_code,
      status, quantity_on_hand_derived, book_value_derived, avg_unit_book_value_derived,
      ${AUDIT_COLUMNS}
    )
    SELECT
      $1, source.code, source.name, source.description, source.item_type, target_category.id, source.unit_code,
      source.status, source.quantity_on_hand_derived, source.book_value_derived, source.avg_unit_book_value_derived,
      ${AUDIT_SELECT_VALUES}
    FROM inventory_item source
    JOIN inventory_category source_category
      ON source_category.company_id = source.company_id AND source_category.id = source.category_id
    JOIN inventory_category target_category
      ON target_category.company_id = $1 AND target_category.code = source_category.code
    WHERE source.company_id = $2 AND source.status = 'ACTIVE'
    ON CONFLICT (company_id, code) DO NOTHING
    `,
    [companyId, templateCompanyId, ...auditParams(audit)],
  );
}

async function deleteCompanyFinancialSettings(companyId: number, db: DbExecutor): Promise<void> {
  await db.query(
    `UPDATE item_posting_profile
     SET revenue_gl_account_id = NULL,
         cogs_gl_account_id = NULL,
         purchase_expense_gl_account_id = NULL,
         consumption_gl_account_id = NULL,
         adjustment_gain_gl_account_id = NULL,
         adjustment_loss_gl_account_id = NULL
     WHERE company_id = $1`,
    [companyId],
  );

  for (const table of COMPANY_FINANCIAL_SETTINGS_TABLE_DELETE_ORDER) {
    await db.query(`DELETE FROM ${table} WHERE company_id = $1`, [companyId]);
  }
}

async function applyOrganizationStandardSettingsTransition(
  company: CompanyRow,
  nextUseOrganizationStandardSettings: boolean,
  db: DbExecutor,
  audit: CompanyAuditStamp,
): Promise<void> {
  if (company.use_organization_standard_settings === nextUseOrganizationStandardSettings) return;

  if (nextUseOrganizationStandardSettings) {
    throw new BusinessRuleError("A company that has been de-coupled cannot be switched back to Organization base financial settings.");
  }

  await deleteCompanyFinancialSettings(company.id, db);
  await copyCompanyDefaultsFromTemplate(company.id, db, audit, { copyLinkedSettings: true });
}

async function getAuditActor(
  repo: UserRepo,
  userId: string | null,
): Promise<CompanyResponseDto["audit"]["created"]["user"]> {
  if (!userId) return null;
  const parsed = Number(userId);
  if (!Number.isInteger(parsed)) return null;
  const row = await repo.getById(parsed);
  return row
    ? {
      id: row.id,
      code: row.code,
      displayName: row.display_name,
    }
    : null;
}

async function enrichRow(row: CompanyRow): Promise<CompanyResponseDto> {
  const userRepo = new UserRepo(getDb());
  const [creationUser, updatedUser] = await Promise.all([
    getAuditActor(userRepo, row.creation_user_id),
    getAuditActor(userRepo, row.updated_user_id),
  ]);
  const dto = toDto(row);
  return {
    ...dto,
    audit: {
      created: {
        ...dto.audit.created,
        user: creationUser,
      },
      updated: {
        ...dto.audit.updated,
        user: updatedUser,
      },
    },
  };
}

function enrichRows(rows: CompanyRow[]): Promise<CompanyResponseDto[]> {
  return Promise.all(rows.map((r) => enrichRow(r)));
}

async function applyInheritedTaxFilingProfile<T extends CompanyCreateRequestDto | CompanyUpdateRequestDto | CompanyPatchRequestDto>(
  input: T,
  db: DbExecutor,
): Promise<T> {
  if (!input.countryCode) return input;

  const needsInheritedProfile =
    input.taxFilingAnchorMonth === undefined ||
    input.taxFilingIntervalMonths === undefined;

  if (!needsInheritedProfile) return input;

  const country = await new CountryRepo(db).get(input.countryCode);
  if (!country) return input;

  return {
    ...input,
    taxFilingAnchorMonth: input.taxFilingAnchorMonth ?? country.tax_filing_anchor_month,
    taxFilingIntervalMonths: input.taxFilingIntervalMonths ?? (country.tax_filing_interval_months as 1 | 2 | 3 | 6 | 12),
  };
}

function normalizeCodes(codes: string[]): string[] {
  return [...new Set(codes.map((code) => code.trim().toUpperCase()).filter(Boolean))];
}

export async function createCompany(input: CompanyCreateRequestDto, options: CompanyMutationOptions = {}): Promise<CompanyResponseDto> {
  const org = await new OrganizationRepo(getDb()).get();
  const audit = await createAuditStamp(options);

  try {
    const row = await withTransaction(async (client) => {
      const inheritedInput = await applyInheritedTaxFilingProfile(input, client);
      const insertRow = withCreationAudit({ ...toInsertRow(inheritedInput), organization_id: org?.id }, audit);
      const inserted = await new CompanyRepo(client).insert(insertRow);
      await copyCompanyDefaultsFromTemplate(inserted.id, client, audit, {
        copyLinkedSettings: insertRow.use_organization_standard_settings !== true,
      });
      await seedFiscalCalendar(inserted.id, inheritedInput.countryCode, client, audit);
      return inserted;
    });
    return await enrichRow(row);
  } catch (err) {
    // "duplicate key value" originates from the PostgreSQL driver, not repo code,
    // so it is a plain Error — not a DataError — and requires a message string check.
    if (err instanceof Error && err.message.includes("duplicate key value")) {
      throw new ConflictError("A company with this code already exists");
    }
    throw err;
  }
}


export async function getCompany(code: string): Promise<CompanyResponseDto | null> {
  const row = await new CompanyRepo(getDb()).get(code);
  if (!row) return null;
  return enrichRow(row);
}

export async function updateCompany(code: string, input: CompanyUpdateRequestDto): Promise<CompanyResponseDto> {
  try {
    const audit = await createAuditStamp();
    const row = await withTransaction(async (client) => {
      const repo = new CompanyRepo(client);
      const existing = await repo.get(code);
      if (!existing) throw new DataError(`Company ${code} not found`);
      if (existing.status === "INACTIVE") throw new BusinessRuleError("Archived companies are read only. Restore the company before making changes.");
      const codeBlockers = ChangeCode({ code: existing.code, hasPostings: existing.has_postings }, input.code);
      if (codeBlockers.length) throw new BusinessRuleError(codeBlockers.map((blocker) => blocker.message).join("; "));
      await applyOrganizationStandardSettingsTransition(
        existing,
        input.useOrganizationStandardSettings ?? existing.use_organization_standard_settings,
        client,
        audit,
      );
      const inheritedInput = await applyInheritedTaxFilingProfile(input, client);
      return repo.update(code, withUpdateAudit(toUpdateRow({
        ...inheritedInput,
        useOrganizationStandardSettings: inheritedInput.useOrganizationStandardSettings ?? existing.use_organization_standard_settings,
      }), audit));
    });
    return enrichRow(row);
  } catch (err) {
    if (err instanceof Error && err.message.includes("duplicate key value")) {
      throw new ConflictError("A company with the target code already exists");
    }
    if (err instanceof DataError) {
      throw new NotFoundError(`Company ${code} not found`);
    }
    throw err;
  }
}

export async function patchCompany(code: string, input: CompanyPatchRequestDto): Promise<CompanyResponseDto> {
  try {
    const audit = await createAuditStamp();
    const row = await withTransaction(async (client) => {
      const repo = new CompanyRepo(client);
      const existing = await repo.get(code);
      if (!existing) throw new DataError(`Company ${code} not found`);
      if (existing.status === "INACTIVE") throw new BusinessRuleError("Archived companies are read only. Restore the company before making changes.");
      if (input.code !== undefined) {
        const codeBlockers = ChangeCode({ code: existing.code, hasPostings: existing.has_postings }, input.code);
        if (codeBlockers.length) throw new BusinessRuleError(codeBlockers.map((blocker) => blocker.message).join("; "));
      }
      if (input.useOrganizationStandardSettings !== undefined) {
        await applyOrganizationStandardSettingsTransition(existing, input.useOrganizationStandardSettings, client, audit);
      }
      return repo.patch(code, withUpdateAudit(toPatchRow(await applyInheritedTaxFilingProfile(input, client)), audit));
    });
    return enrichRow(row);
  } catch (err) {
    if (err instanceof Error && err.message.includes("duplicate key value")) {
      throw new ConflictError("A company with the target code already exists");
    }
    if (err instanceof DataError) {
      throw new NotFoundError(`Company ${code} not found`);
    }
    throw err;
  }
}

export async function deleteCompany(code: string): Promise<void> {
  const audit = await createAuditStamp();
  await withTransaction(async (client) => {
    const repo = new CompanyRepo(client);
    const existing = await repo.get(code);
    if (!existing) throw new NotFoundError(`Company ${code} not found`);
    await repo.delete(code, audit);
  });
}


export async function listCompanies(): Promise<CompanyResponseDto[]> {
  const rows = await new CompanyRepo(getDb()).listAll();
  return enrichRows(rows);
}

export async function filterCompanies(
  filters: Filter[],
  options?: ListOptions,
): Promise<CompanyResponseDto[]> {
  const rows = await new CompanyRepo(getDb()).filter(filters, options);
  return enrichRows(rows);
}

export async function searchCompanies(
  phrase: string,
  options?: ListOptions,
): Promise<CompanyResponseDto[]> {
  const rows = await new CompanyRepo(getDb()).search(phrase, options);
  return enrichRows(rows);
}
export async function batchCreateCompanies(inputs: CompanyCreateRequestDto[]): Promise<CompanyResponseDto[]> {
  const org = await new OrganizationRepo(getDb()).get();
  const audit = await createAuditStamp();

  try {
    return await withTransaction(async (client) => {
      const repo = new CompanyRepo(client);
      const results: CompanyResponseDto[] = [];
      for (const input of inputs) {
        const inheritedInput = await applyInheritedTaxFilingProfile(input, client);
        const insertRow = withCreationAudit({ ...toInsertRow(inheritedInput), organization_id: org?.id }, audit);
        const row = await repo.insert(insertRow);
        await copyCompanyDefaultsFromTemplate(row.id, client, audit, {
          copyLinkedSettings: insertRow.use_organization_standard_settings !== true,
        });
        await seedFiscalCalendar(row.id, inheritedInput.countryCode, client, audit);
        results.push(await enrichRow(row));
      }
      return results;
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes("duplicate key value")) {
      throw new ConflictError("One or more codes already exist");
    }
    throw err;
  }
}

export async function batchGetCompanies(codes: string[]): Promise<CompanyResponseDto[]> {
  const rows = await new CompanyRepo(getDb()).batchGet(codes);
  return enrichRows(rows);
}

export async function batchUpdateCompanies(inputs: CompanyBatchUpdateRequestDto[]): Promise<CompanyResponseDto[]> {
  try {
    const audit = await createAuditStamp();
    return await withTransaction(async (client) => {
      const repo = new CompanyRepo(client);
      const results: CompanyResponseDto[] = [];
      for (const input of inputs) {
        const existing = await repo.get(input.code);
        if (!existing) throw new DataError(`Company ${input.code} not found`);
        if (existing.status === "INACTIVE") throw new BusinessRuleError("Archived companies are read only. Restore the company before making changes.");
        await applyOrganizationStandardSettingsTransition(
          existing,
          input.useOrganizationStandardSettings ?? existing.use_organization_standard_settings,
          client,
          audit,
        );
        const inheritedInput = await applyInheritedTaxFilingProfile(input, client);
        const row = await repo.update(input.code, withUpdateAudit(toUpdateRow({
          ...inheritedInput,
          useOrganizationStandardSettings: inheritedInput.useOrganizationStandardSettings ?? existing.use_organization_standard_settings,
        }), audit));
        results.push(await enrichRow(row));
      }
      return results;
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes("duplicate key value")) {
      throw new ConflictError("One or more target codes already exist");
    }
    if (err instanceof DataError) {
      throw new NotFoundError("One or more codes not found");
    }
    throw err;
  }
}

export async function batchPatchCompanies(inputs: CompanyBatchPatchRequestDto[]): Promise<CompanyResponseDto[]> {
  try {
    const audit = await createAuditStamp();
    return await withTransaction(async (client) => {
      const repo = new CompanyRepo(client);
      const results: CompanyResponseDto[] = [];
      for (const input of inputs) {
        const existing = await repo.get(input.code);
        if (!existing) throw new DataError(`Company ${input.code} not found`);
        if (existing.status === "INACTIVE") throw new BusinessRuleError("Archived companies are read only. Restore the company before making changes.");
        if (input.useOrganizationStandardSettings !== undefined) {
          await applyOrganizationStandardSettingsTransition(existing, input.useOrganizationStandardSettings, client, audit);
        }
        const row = await repo.patch(input.code, withUpdateAudit(toPatchRow(await applyInheritedTaxFilingProfile(input, client)), audit));
        results.push(await enrichRow(row));
      }
      return results;
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes("duplicate key value")) {
      throw new ConflictError("One or more target codes already exist");
    }
    if (err instanceof DataError) {
      throw new NotFoundError("One or more codes not found");
    }
    throw err;
  }
}

export async function batchDeleteCompanies(codes: string[]): Promise<void> {
  const normalizedCodes = normalizeCodes(codes);
  if (normalizedCodes.length === 0) throw new InputValidationError("At least one company code is required");

  const audit = await createAuditStamp();
  await withTransaction(async (client) => {
    const repo = new CompanyRepo(client);
    const existing = await repo.batchGet(normalizedCodes);
    const found = new Set(existing.map((company) => company.code));
    const missing = normalizedCodes.filter((code) => !found.has(code));
    if (missing.length > 0) throw new NotFoundError(`Company ${missing.join(", ")} not found`);

    await repo.batchDelete(normalizedCodes, audit);
  });
}

export async function activateCompanies(codes: string[]): Promise<CompanyResponseDto[]> {
  return transitionCompanyStatus(codes, "ACTIVE");
}

export async function deactivateCompanies(codes: string[]): Promise<CompanyResponseDto[]> {
  return transitionCompanyStatus(codes, "INACTIVE");
}

export async function activateCompany(code: string): Promise<CompanyResponseDto> {
  const [company] = await activateCompanies([code]);
  return company;
}

export async function deactivateCompany(code: string): Promise<CompanyResponseDto> {
  const [company] = await deactivateCompanies([code]);
  return company;
}

async function transitionCompanyStatus(codes: string[], targetStatus: "ACTIVE" | "INACTIVE"): Promise<CompanyResponseDto[]> {
  const normalizedCodes = normalizeCodes(codes);
  if (normalizedCodes.length === 0) throw new InputValidationError("At least one company code is required");

  const audit = await createAuditStamp();
  return withTransaction(async (client) => {
    const repo = new CompanyRepo(client);
    const existing = await repo.batchGet(normalizedCodes);
    const found = new Set(existing.map((company) => company.code));
    const missing = normalizedCodes.filter((code) => !found.has(code));
    if (missing.length > 0) throw new NotFoundError(`Company ${missing.join(", ")} not found`);
    if (targetStatus === "INACTIVE") {
      for (const company of existing) {
        await applyOrganizationStandardSettingsTransition(company, false, client, audit);
        if (company.use_organization_standard_settings) {
          await repo.patch(company.code, withUpdateAudit({ use_organization_standard_settings: false }, audit));
        }
      }
    }
    const rows = await repo.batchUpdateStatus(normalizedCodes, targetStatus, audit);
    return enrichRows(rows);
  });
}
