export type DetailBackSource =
  | "journals"
  | "journal"
  | "arLedgerEntry"
  | "apLedgerEntry"
  | "arLedgerEntryEnquiry"
  | "apLedgerEntryEnquiry"
  | "taxLedgerEntry"
  | "inventoryLedgerEntry"
  | "arInvoices"
  | "apBills"
  | "arStatements"
  | "apStatements"
  | "financialDocumentType"
  | "organizationAudit"
  | "companyAudit";

export interface DetailBackContext {
  from?: DetailBackSource;
  fromCode?: string;
  fallbackHref: string;
}

export interface DetailBackSearchContext extends DetailBackContext {
  searchParams: URLSearchParams;
  preserveSearchParams?: boolean;
}

export function normalizeDetailBackSource(value: string | undefined): DetailBackSource | undefined {
  if (value === "journal") return "journal";
  if (value === "journals") return "journals";
  if (value === "ar-ledger-entry") return "arLedgerEntry";
  if (value === "ap-ledger-entry") return "apLedgerEntry";
  if (value === "ar-ledger-entry-enquiry") return "arLedgerEntryEnquiry";
  if (value === "ap-ledger-entry-enquiry") return "apLedgerEntryEnquiry";
  if (value === "tax-ledger-entry") return "taxLedgerEntry";
  if (value === "inventory-ledger-entry") return "inventoryLedgerEntry";
  if (value === "ar-invoices") return "arInvoices";
  if (value === "ap-bills") return "apBills";
  if (value === "ar-statements") return "arStatements";
  if (value === "ap-statements") return "apStatements";
  if (value === "financial-document-type") return "financialDocumentType";
  if (value === "organization-audit") return "organizationAudit";
  if (value === "company-audit") return "companyAudit";
  return undefined;
}

function organizationAuditReturnHref(value: string | undefined): string | undefined {
  if (!value || (value !== "/organization" && !value.startsWith("/organization/"))) return undefined;
  if (value.includes("?") || value.includes("#") || value.includes("\\") || value.includes("//")) return undefined;
  if (value.split("/").some((segment) => segment === "." || segment === "..")) return undefined;
  return value;
}

function companyAuditReturnHref(value: string | undefined): string | undefined {
  if (!value || (value !== "/finance" && !value.startsWith("/finance/"))) return undefined;
  if (value.includes("?") || value.includes("#") || value.includes("\\") || value.includes("//")) return undefined;
  if (value.split("/").some((segment) => segment === "." || segment === "..")) return undefined;
  return value;
}

export function detailBackHref({ from, fromCode, fallbackHref }: DetailBackContext) {
  if (from === "journal" && fromCode) return `/finance/journals/${encodeURIComponent(fromCode)}`;
  if (from === "arLedgerEntry" && fromCode) return `/finance/subledgers/ar/ledger-entries/${encodeURIComponent(fromCode)}`;
  if (from === "apLedgerEntry" && fromCode) return `/finance/subledgers/ap/ledger-entries/${encodeURIComponent(fromCode)}`;
  if (from === "arLedgerEntryEnquiry" && fromCode) return `/finance/subledgers/ar/ledger-entry-enquiry/${encodeURIComponent(fromCode)}`;
  if (from === "apLedgerEntryEnquiry" && fromCode) return `/finance/subledgers/ap/ledger-entry-enquiry/${encodeURIComponent(fromCode)}`;
  if (from === "taxLedgerEntry" && fromCode) return `/finance/subledgers/tax/ledger-entries/${encodeURIComponent(fromCode)}`;
  if (from === "inventoryLedgerEntry" && fromCode) return `/finance/inventory/ledger/${encodeURIComponent(fromCode)}`;
  if (from === "arInvoices") return "/finance/subledgers/ar/invoices";
  if (from === "apBills") return "/finance/subledgers/ap/bills";
  if (from === "arStatements") return "/finance/subledgers/ar/statements";
  if (from === "apStatements") return "/finance/subledgers/ap/statements";
  if (from === "financialDocumentType" && fromCode) return `/organization/financial-document-types/${encodeURIComponent(fromCode)}`;
  if (from === "organizationAudit") return organizationAuditReturnHref(fromCode) ?? fallbackHref;
  if (from === "companyAudit") return companyAuditReturnHref(fromCode) ?? fallbackHref;
  return fallbackHref;
}

export function detailBackHrefFromSearchParams({
  searchParams,
  fallbackHref,
  preserveSearchParams = false,
  from,
  fromCode,
}: DetailBackSearchContext) {
  const resolvedHref = detailBackHref({
    from: from ?? normalizeDetailBackSource(searchParams.get("from") ?? undefined),
    fromCode: fromCode ?? searchParams.get("fromCode") ?? undefined,
    fallbackHref,
  });

  if (resolvedHref !== fallbackHref || !preserveSearchParams) return resolvedHref;

  const fallbackSearchParams = new URLSearchParams(searchParams);
  fallbackSearchParams.delete("from");
  fallbackSearchParams.delete("fromCode");
  const query = fallbackSearchParams.toString();
  if (!query) return fallbackHref;
  const separator = fallbackHref.includes("?") ? "&" : "?";
  return `${fallbackHref}${separator}${query}`;
}

export function detailLinkWithBackContext(href: string, from: Exclude<DetailBackSource, "journals">, fromCode: string) {
  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}from=${sourceQueryValue(from)}&fromCode=${encodeURIComponent(fromCode)}`;
}

function sourceQueryValue(from: Exclude<DetailBackSource, "journals">) {
  if (from === "journal") return "journal";
  if (from === "arLedgerEntry") return "ar-ledger-entry";
  if (from === "apLedgerEntry") return "ap-ledger-entry";
  if (from === "arLedgerEntryEnquiry") return "ar-ledger-entry-enquiry";
  if (from === "apLedgerEntryEnquiry") return "ap-ledger-entry-enquiry";
  if (from === "taxLedgerEntry") return "tax-ledger-entry";
  if (from === "inventoryLedgerEntry") return "inventory-ledger-entry";
  if (from === "arInvoices") return "ar-invoices";
  if (from === "apBills") return "ap-bills";
  if (from === "arStatements") return "ar-statements";
  if (from === "financialDocumentType") return "financial-document-type";
  if (from === "organizationAudit") return "organization-audit";
  if (from === "companyAudit") return "company-audit";
  return "ap-statements";
}
