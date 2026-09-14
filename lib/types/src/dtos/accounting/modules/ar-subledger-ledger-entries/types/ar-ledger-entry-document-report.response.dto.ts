import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { OrganizationResponseDto } from "../../organization-finance/types/organization.response.dto";
import { BusinessCode, IsoDate, NonBlankText } from "../../common/types/constraints";

export const ArLedgerEntryDocumentReportLineDto = StrictObject({
  line: Type.String(),
  description: Type.String(),
  quantity: Type.Union([Type.Number(), Type.Null()]),
  unitAmount: Type.Union([Type.Number(), Type.Null()]),
  netAmount: Type.Union([Type.Number(), Type.Null()]),
  taxAmount: Type.Union([Type.Number(), Type.Null()]),
  grossAmount: Type.Number(),
});
export type ArLedgerEntryDocumentReportLineDto = Type.Static<typeof ArLedgerEntryDocumentReportLineDto>;

export const ArLedgerEntryDocumentReportTransactionDto = StrictObject({
  code: BusinessCode,
  postingDate: IsoDate,
  documentDate: IsoDate,
  documentTypeLabel: Type.String(),
  documentId: Type.String(),
  amount: Type.Number(),
});
export type ArLedgerEntryDocumentReportTransactionDto = Type.Static<typeof ArLedgerEntryDocumentReportTransactionDto>;

export const ArLedgerEntryDocumentReportApplicationDto = StrictObject({
  sourceDocumentId: Type.Union([Type.String(), Type.Null()]),
  targetDocumentId: Type.Union([Type.String(), Type.Null()]),
  targetDocumentType: Type.Union([Type.String(), Type.Null()]),
  amount: Type.Number(),
  sourceOpenAmountBefore: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
  sourceOpenAmountAfter: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
  targetOpenAmountBefore: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
  targetOpenAmountAfter: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
});
export type ArLedgerEntryDocumentReportApplicationDto = Type.Static<typeof ArLedgerEntryDocumentReportApplicationDto>;

export const ArLedgerEntryDocumentReportTotalDto = StrictObject({
  label: Type.String(),
  amount: Type.Number(),
});
export type ArLedgerEntryDocumentReportTotalDto = Type.Static<typeof ArLedgerEntryDocumentReportTotalDto>;

export const ArLedgerEntryDocumentReportResponseDto = StrictObject({
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
  lines: Type.Array(ArLedgerEntryDocumentReportLineDto),
  totals: Type.Array(ArLedgerEntryDocumentReportTotalDto),
  appliedTransactions: Type.Array(ArLedgerEntryDocumentReportTransactionDto),
  applications: Type.Array(ArLedgerEntryDocumentReportApplicationDto),
});
export type ArLedgerEntryDocumentReportResponseDto = Type.Static<typeof ArLedgerEntryDocumentReportResponseDto>;
