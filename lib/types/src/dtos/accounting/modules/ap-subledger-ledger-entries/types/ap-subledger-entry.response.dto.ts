import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { AuditMetadataDto } from "../../common/types/index";
import { EntryType } from "../../common/types/index";
import { BusinessCode, CurrencyCode, IsoDate, NonBlankText, PositiveId } from "../../common/types/constraints";

export const ApSubledgerControlAccountBalanceDto = StrictObject({
  controlAccountCode: BusinessCode,
  controlAccountName: NonBlankText,
  glAccountCode: BusinessCode,
  glAccountName: NonBlankText,
  balance: Type.Number(),
});
export type ApSubledgerControlAccountBalanceDto = Type.Static<typeof ApSubledgerControlAccountBalanceDto>;

export const ApSubledgerEntryResponseDto = StrictObject({
  id: PositiveId,
  code: BusinessCode,
  journalHeaderId: PositiveId,
  journalCode: BusinessCode,
  hasBankCashDetails: Type.Boolean(),
  bankCashCode: Type.Union([BusinessCode, Type.Null()]),
  taxLedgerEntryCode: Type.Union([BusinessCode, Type.Null()]),
  postingDate: IsoDate,
  documentDate: IsoDate,
  baseCurrencyCode: CurrencyCode,
  entryType: EntryType,
  baseCurrencyAmount: Type.Number(),
  memo: Type.Union([Type.String(), Type.Null()]),
  status: Type.String(),
  documentTypeCode: BusinessCode,
  documentTypeLabel: Type.String(),
  documentId: Type.String(),
  description: Type.String(),
  appliedToDocumentId: Type.Union([Type.String(), Type.Null()]),
  counterpartyCode: BusinessCode,
  counterpartyName: NonBlankText,
  controlAccountCode: BusinessCode,
  controlAccountName: NonBlankText,
  glAccountCode: BusinessCode,
  glAccountName: NonBlankText,
  paymentStatus: Type.Union([Type.Literal("UNPAID"), Type.Literal("PART_PAID"), Type.Literal("SETTLED"), Type.Null()]),
  appliedAmount: Type.Union([Type.Number(), Type.Null()]),
  paymentAppliedAmount: Type.Union([Type.Number(), Type.Null()]),
  otherCreditAppliedAmount: Type.Union([Type.Number(), Type.Null()]),
  openBalance: Type.Union([Type.Number(), Type.Null()]),
  controlAccountBalances: Type.Optional(Type.Array(ApSubledgerControlAccountBalanceDto)),
  audit: AuditMetadataDto,
  documentSnapshot: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
  detailedDocumentSnapshot: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
});
export type ApSubledgerEntryResponseDto = Type.Static<typeof ApSubledgerEntryResponseDto>;
