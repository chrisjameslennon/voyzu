import assert from "node:assert/strict";
import { describe, it, before, after } from "node:test";

import type { CompanyCreateRequestDto } from "@voyzu/organization/types/modules/companies/company.create.request.dto";
import type { CompanyPatchRequestDto } from "@voyzu/organization/types/modules/companies/company.patch.request.dto";
import type { CompanyResponseDto } from "@voyzu/organization/types/modules/companies/company.response.dto";
import type { CompanyUpdateRequestDto } from "@voyzu/organization/types/modules/companies/company.update.request.dto";

import { getPool } from "@voyzu/capability/db";
import {
  createCompany,
  getCompany,
  updateCompany,
  patchCompany,
  deleteCompany,
  listCompanies,
  filterCompanies,
  searchCompanies,
  batchCreateCompanies,
  batchGetCompanies,
  batchUpdateCompanies,
  batchPatchCompanies,
  batchDeleteCompanies,
  activateCompany,
  deactivateCompany,
} from "../../../modules/companies/operations";

const createdCodes: string[] = [];
const testCodes = ["TEST-A", "TEST-B", "TEST-C", "TEST-D", "TEST-E"];

before(async () => {
  const existing = await batchGetCompanies(testCodes);
  if (existing.length) {
    await batchDeleteCompanies(existing.map((company) => company.code));
  }
});

after(async () => {
  if (createdCodes.length) {
    try {
      await batchDeleteCompanies([...createdCodes]);
    } catch {
      // best-effort cleanup
    }
  }
  await getPool().end();
});

describe("company.service", () => {
  it("creates a company", async () => {
    const input: CompanyCreateRequestDto = {
      code: "TEST-A",
      name: "Test Company A",
      countryCode: "NZ",
      baseCurrencyCode: "NZD",
    };
    const company: CompanyResponseDto = await createCompany(input);
    createdCodes.push(company.code);

    assert.equal(company.code, "TEST-A");
    assert.equal(company.name, "Test Company A");
    assert.equal(company.countryCode, "NZ");
    assert.equal(company.baseCurrencyCode, "NZD");
    assert.equal(company.status, "ACTIVE");
    assert.equal(company.hasPostings, false);
    assert.equal(company.reportLine1, undefined);
    assert.equal(company.reportLine2, undefined);
    assert.ok(company.id > 0);
  });

  it("creates a company with optional fields", async () => {
    const input: CompanyCreateRequestDto = {
      code: "TEST-B",
      name: "Test Company B",
      countryCode: "AU",
      baseCurrencyCode: "AUD",
      reportLine1: "Level 5, 123 George St",
      reportLine2: "Sydney NSW 2000",
    };
    const company: CompanyResponseDto = await createCompany(input);
    createdCodes.push(company.code);

    assert.equal(company.reportLine1, "Level 5, 123 George St");
    assert.equal(company.reportLine2, "Sydney NSW 2000");
  });

  it("gets a company by code", async () => {
    const company = await getCompany("TEST-A");
    assert.ok(company);
    assert.equal(company.code, "TEST-A");
  });

  it("returns null for non-existent code", async () => {
    const company = await getCompany("NO-SUCH");
    assert.equal(company, null);
  });

  it("updates a company by code (full replace)", async () => {
    const input: Omit<CompanyUpdateRequestDto, "id"> = {
      code: "TEST-A",
      name: "Test Company A Updated",
      countryCode: "NZ",
      baseCurrencyCode: "NZD",
      status: "ACTIVE",
    };
    const company: CompanyResponseDto = await updateCompany("TEST-A", input);

    assert.equal(company.name, "Test Company A Updated");
    assert.equal(company.status, "ACTIVE");
    assert.equal(company.reportLine1, undefined);
  });

  it("patches a company by code (partial update)", async () => {
    const input: CompanyPatchRequestDto = { name: "Test Company A Patched" };
    const company: CompanyResponseDto = await patchCompany("TEST-A", input);

    assert.equal(company.name, "Test Company A Patched");
    assert.equal(company.status, "ACTIVE");
  });

  it("lists all companies (includes test companies)", async () => {
    const companies: CompanyResponseDto[] = await listCompanies();
    const testCodes = companies.map((c) => c.code).filter((c) => c.startsWith("TEST-"));
    assert.ok(testCodes.includes("TEST-A"));
    assert.ok(testCodes.includes("TEST-B"));
  });

  it("filters companies", async () => {
    const companies: CompanyResponseDto[] = await filterCompanies([
      { field: "country_code", operator: "=", value: "AU" },
    ]);
    const testCompanies = companies.filter((c) => c.code === "TEST-B");
    assert.equal(testCompanies.length, 1);
    assert.equal(testCompanies[0].baseCurrencyCode, "AUD");
  });

  it("searches companies by phrase", async () => {
    const companies: CompanyResponseDto[] = await searchCompanies("Patched");
    const found = companies.find((c) => c.code === "TEST-A");
    assert.ok(found);
    assert.equal(found.name, "Test Company A Patched");
  });

  it("de-couples once, archives as read only, and restores without re-coupling", async () => {
    const decoupled = await patchCompany("TEST-A", { useOrganizationStandardSettings: false });
    assert.equal(decoupled.useOrganizationStandardSettings, false);

    await assert.rejects(
      () => patchCompany("TEST-A", { useOrganizationStandardSettings: true }),
      /cannot be switched back to Organization base financial settings/,
    );

    const archived = await deactivateCompany("TEST-A");
    assert.equal(archived.status, "INACTIVE");
    assert.equal(archived.useOrganizationStandardSettings, false);

    await assert.rejects(
      () => patchCompany("TEST-A", { name: "Archived edit" }),
      /Archived companies are read only/,
    );

    const restored = await activateCompany("TEST-A");
    assert.equal(restored.status, "ACTIVE");
    assert.equal(restored.useOrganizationStandardSettings, false);
  });
  it("batch creates companies", async () => {
    const inputs: CompanyCreateRequestDto[] = [
      { code: "TEST-C", name: "Test Company C", countryCode: "US", baseCurrencyCode: "USD" },
      { code: "TEST-D", name: "Test Company D", countryCode: "GB", baseCurrencyCode: "GBP" },
    ];
    const companies: CompanyResponseDto[] = await batchCreateCompanies(inputs);
    for (const c of companies) createdCodes.push(c.code);

    assert.equal(companies.length, 2);
    assert.equal(companies[0].code, "TEST-C");
    assert.equal(companies[1].code, "TEST-D");
  });

  it("batch gets companies by codes", async () => {
    const companies: CompanyResponseDto[] = await batchGetCompanies(["TEST-A", "TEST-B"]);
    assert.equal(companies.length, 2);
    const codes = companies.map((c) => c.code);
    assert.ok(codes.includes("TEST-A"));
    assert.ok(codes.includes("TEST-B"));
  });

  it("batch updates companies (full replace)", async () => {
    const inputs: CompanyUpdateRequestDto[] = [
      { code: "TEST-C", name: "Test Company C Updated", countryCode: "US", baseCurrencyCode: "USD", status: "ACTIVE" },
      { code: "TEST-D", name: "Test Company D Updated", countryCode: "GB", baseCurrencyCode: "GBP", status: "ACTIVE" },
    ];
    const companies = await batchUpdateCompanies(inputs);

    assert.equal(companies.length, 2);
    assert.equal(companies[0].name, "Test Company C Updated");
    assert.equal(companies[0].status, "ACTIVE");
    assert.equal(companies[1].name, "Test Company D Updated");
    assert.equal(companies[1].status, "ACTIVE");
  });

  it("batch patches companies (partial update)", async () => {
    const inputs: Array<CompanyPatchRequestDto & { code: string }> = [
      { code: "TEST-C", name: "Test Company C Patched", status: "ACTIVE" },
      { code: "TEST-D", name: "Test Company D Patched", status: "ACTIVE" },
    ];
    const companies = await batchPatchCompanies(inputs);

    assert.equal(companies.length, 2);
    assert.equal(companies[0].name, "Test Company C Patched");
    assert.equal(companies[0].status, "ACTIVE");
    assert.equal(companies[1].name, "Test Company D Patched");
    assert.equal(companies[1].status, "ACTIVE");
  });

  it("deletes a single company by code", async () => {
    const code = createdCodes.shift()!;
    await deleteCompany(code);

    const company = await getCompany(code);
    assert.equal(company, null);
  });

  it("deletes a company with posted financial records", async () => {
    const company = await createCompany({
      code: "TEST-E",
      name: "Test Company E",
      countryCode: "NZ",
      baseCurrencyCode: "NZD",
      useOrganizationStandardSettings: false,
    });
    createdCodes.push(company.code);

    const pool = getPool();
    const { rows: periods } = await pool.query(
      `SELECT fy.id AS financial_year_id,
              fy.code AS financial_year_code,
              fp.id AS financial_period_id,
              fp.code AS financial_period_code
       FROM fiscal_year fy
       JOIN fiscal_period fp ON fp.fiscal_year_id = fy.id
       WHERE fy.company_id = $1
       ORDER BY fp.start_date
       LIMIT 1`,
      [company.id],
    );
    assert.equal(periods.length, 1);

    const period = periods[0];
    const { rows: journals } = await pool.query(
      `INSERT INTO journal_header (
         code, company_id, company_code, company_name,
         document_type_code, document_type_label, document_id, description,
         posting_engine_code, document_date, posting_date,
         financial_year_id, financial_year_code,
         financial_period_id, financial_period_code,
         base_currency_code, total_debit_base_amount, total_credit_base_amount, status
       ) VALUES (
         $1, $2, $3, $4,
         'TEST', 'Test', 'TEST-DELETE', 'Deletion test posting',
         'TEST', CURRENT_DATE, CURRENT_DATE,
         $5, $6, $7, $8,
         $9, 1, 1, 'DRAFT'
       )
       RETURNING id`,
      [
        "TEST-JRN-E",
        company.id,
        company.code,
        company.name,
        period.financial_year_id,
        period.financial_year_code,
        period.financial_period_id,
        period.financial_period_code,
        company.baseCurrencyCode,
      ],
    );
    const { rows: accounts } = await pool.query(
      `SELECT id, code, name
       FROM gl_account
       WHERE company_id = $1
       ORDER BY id
       LIMIT 2`,
      [company.id],
    );
    assert.equal(accounts.length, 2);
    await pool.query(
      `INSERT INTO journal_line (
         journal_header_id, line_number, gl_account_id, gl_account_code,
         gl_account_name, dr_cr, base_currency_amount, description
       ) VALUES
         ($1, 1, $2, $3, $4, 'DR', 1, 'Deletion test debit'),
         ($1, 2, $5, $6, $7, 'CR', 1, 'Deletion test credit')`,
      [
        journals[0].id,
        accounts[0].id,
        accounts[0].code,
        accounts[0].name,
        accounts[1].id,
        accounts[1].code,
        accounts[1].name,
      ],
    );
    await pool.query("UPDATE journal_header SET status = 'POSTED' WHERE id = $1", [journals[0].id]);
    await pool.query(
      `INSERT INTO posting_batch (code, company_id, source_type, doc_type, doc_ref, status)
       VALUES ('TEST-BATCH-E', $1, 'TEST', 'TEST', 'TEST-DELETE', 'POSTED')`,
      [company.id],
    );

    const inUseCompany = await getCompany(company.code);
    assert.equal(inUseCompany?.hasPostings, true);

    await deleteCompany(company.code);

    assert.equal(await getCompany(company.code), null);
    const { rows: journalRows } = await pool.query(
      "SELECT id FROM journal_header WHERE code = $1",
      ["TEST-JRN-E"],
    );
    assert.equal(journalRows.length, 0);
    const { rows: batchRows } = await pool.query(
      "SELECT id FROM posting_batch WHERE code = $1",
      ["TEST-BATCH-E"],
    );
    assert.equal(batchRows.length, 0);
    createdCodes.splice(createdCodes.indexOf(company.code), 1);
  });

  it("batch deletes remaining companies by codes", async () => {
    await batchDeleteCompanies([...createdCodes]);

    for (const code of createdCodes) {
      const company = await getCompany(code);
      assert.equal(company, null);
    }

    createdCodes.length = 0;
  });

  it("validates required fields on create", async () => {
    await assert.rejects(
      () => createCompany({ code: "", name: "Bad", countryCode: "NZ", baseCurrencyCode: "NZD" }),
      (err: Error) => {
        assert.ok(err.message.includes("Code is required"));
        return true;
      },
    );
  });

  it("validates ISO codes on create", async () => {
    await assert.rejects(
      () => createCompany({ code: "BAD", name: "Bad", countryCode: "ZZZ", baseCurrencyCode: "X" }),
      (err: Error) => {
        assert.ok(err.message.includes("Country code"));
        assert.ok(err.message.includes("Base currency code"));
        return true;
      },
    );
  });
});
