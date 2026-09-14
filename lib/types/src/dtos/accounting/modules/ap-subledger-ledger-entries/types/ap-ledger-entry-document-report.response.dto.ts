import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { OrganizationResponseDto } from "../../organization-finance/types/organization.response.dto";
import { BusinessCode, IsoDate, NonBlankText } from "../../common/types/constraints";

export const ApLedgerEntryDocumentReportLineDto = StrictObject({
  line: Type.String(),
  description: Type.String(),
  quantity: Type.Union([Type.Number(), Type.Null()]),
  unitAmount: Type.Union([Type.Number(), Type.Null()]),
  netAmount: Type.Union([Type.Number(), Type.Null()]),
  taxAmount: Type.Union([Type.Number(), Type.Null()]),
  grossAmount: Type.Number(),
});
export type ApLedgerEntryDocumentReportLineDto = Type.Static<typeof ApLedgerEntryDocumentReportLineDto>;

export const ApLedgerEntryDocumentReportTaxSummaryDto = StrictObject({
  taxAuthorityCode: BusinessCode,
  taxAuthorityName: NonBlankText,
  invoiceLabel: Type.Union([Type.String(), Type.Null()]),
  taxRate: Type.Number(),
  taxableAmount: Type.Number(),
  taxAmount: Type.Number(),
});
export type ApLedgerEntryDocumentReportTaxSummaryDto = Type.Static<typeof ApLedgerEntryDocumentReportTaxSummaryDto>;

export const ApLedgerEntryDocumentReportTransactionDto = StrictObject({
  code: BusinessCode,
  postingDate: IsoDate,
  documentDate: IsoDate,
  documentTypeLabel: Type.String(),
  documentId: Type.String(),
  amount: Type.Number(),
});
export type ApLedgerEntryDocumentReportTransactionDto = Type.Static<typeof ApLedgerEntryDocumentReportTransactionDto>;

export const ApLedgerEntryDocumentReportApplicationDto = StrictObject({
  sourceDocumentId: Type.Union([Type.String(), Type.Null()]),
  targetDocumentId: Type.Union([Type.String(), Type.Null()]),
  targetDocumentType: Type.Union([Type.String(), Type.Null()]),
  amount: Type.Number(),
  sourceOpenAmountBefore: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
  sourceOpenAmountAfter: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
  targetOpenAmountBefore: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
  targetOpenAmountAfter: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
});
export type ApLedgerEntryDocumentReportApplicationDto = Type.Static<typeof ApLedgerEntryDocumentReportApplicationDto>;

export const ApLedgerEntryDocumentReportTotalDto = StrictObject({
  label: Type.String(),
  amount: Type.Number(),
});
export type ApLedgerEntryDocumentReportTotalDto = Type.Static<typeof ApLedgerEntryDocumentReportTotalDto>;

export const ApLedgerEntryDocumentReportResponseDto = StrictObject({
  company: OrganizationResponseDto,
  documentTypeCode: BusinessCode,
  documentTypeLabel: Type.String(),
  documentId: Type.String(),
  documentDate: Type.Union([IsoDate, Type.Null()]),
  postingDate: Type.Union([IsoDate, Type.Null()]),
  memo: Type.Union([Type.String(), Type.Null()]),
  description: Type.Union([Type.String(), Type.Null()]),
  counterpartyCode: Type.Union([BusinessCode, Type.Null()]),
  counterpartyName: Type.Union([NonBlankText, Type.Null()]),
  counterpartyCountryCode: Type.Union([BusinessCode, Type.Null()]),
  lines: Type.Array(ApLedgerEntryDocumentReportLineDto),
  taxSummary: Type.Array(ApLedgerEntryDocumentReportTaxSummaryDto),
  totals: Type.Array(ApLedgerEntryDocumentReportTotalDto),
  appliedTransactions: Type.Array(ApLedgerEntryDocumentReportTransactionDto),
  applications: Type.Array(ApLedgerEntryDocumentReportApplicationDto),
});
export type ApLedgerEntryDocumentReportResponseDto = Type.Static<typeof ApLedgerEntryDocumentReportResponseDto>;
