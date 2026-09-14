import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { AuditMetadataDto } from "../../common/types/index";
import { JournalLineResponseDto } from "./journal-line.response.dto";
import { BusinessCode, CurrencyCode, IsoDate, NonBlankText, PositiveId } from "../../common/types/constraints";

export const JournalStatus = Type.Union([Type.Literal("DRAFT"), Type.Literal("POSTED")]);
export type JournalStatus = Type.Static<typeof JournalStatus>;

export const JournalResponseDto = StrictObject({
  id: PositiveId,
  code: BusinessCode,
  arSubledgerEntryCode: Type.Union([BusinessCode, Type.Null()]),
  apSubledgerEntryCode: Type.Union([BusinessCode, Type.Null()]),
  taxLedgerEntryCode: Type.Union([BusinessCode, Type.Null()]),
  companyId: PositiveId,
  companyCode: BusinessCode,
  companyName: NonBlankText,
  documentTypeCode: BusinessCode,
  documentTypeLabel: Type.String(),
  documentId: Type.String(),
  description: Type.String(),
  documentSnapshot: Type.Record(Type.String(), Type.Unknown()),
  detailedDocumentSnapshot: Type.Record(Type.String(), Type.Unknown()),
  postingEngineCode: BusinessCode,
  documentDate: IsoDate,
  postingDate: IsoDate,
  financialYearId: PositiveId,
  financialYearCode: BusinessCode,
  financialPeriodId: PositiveId,
  financialPeriodCode: BusinessCode,
  baseCurrencyCode: CurrencyCode,
  numberLines: Type.Number(),
  totalDr: Type.Number(),
  totalCr: Type.Number(),
  memo: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  status: JournalStatus,
  reversalOfJournalId: Type.Optional(Type.Union([PositiveId, Type.Null()])),
  reversalOfJournalCode: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  reversedByJournalId: Type.Optional(Type.Union([PositiveId, Type.Null()])),
  reversedByJournalCode: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  bankCashDetails: Type.Optional(Type.Union([StrictObject({
    id: Type.Union([PositiveId, Type.Null()]),
    code: Type.Union([BusinessCode, Type.Null()]),
    type: Type.Union([Type.String(), Type.Null()]),
    glAccountId: Type.Union([PositiveId, Type.Null()]),
    glAccountCode: Type.Union([BusinessCode, Type.Null()]),
    glAccountName: Type.Union([NonBlankText, Type.Null()]),
    bankName: Type.Union([NonBlankText, Type.Null()]),
    bankBranchName: Type.Union([NonBlankText, Type.Null()]),
    bankAccountIdentifier: Type.Union([Type.String(), Type.Null()]),
    cashAccountIdentifier: Type.Union([Type.String(), Type.Null()]),
    txId: Type.Union([Type.String(), Type.Null()]),
    txCode: Type.Union([BusinessCode, Type.Null()]),
    txRef: Type.Union([Type.String(), Type.Null()]),
    txDetails: Type.Union([Type.String(), Type.Null()]),
    paymentRef: Type.Union([Type.String(), Type.Null()]),
  }), Type.Null()])),
  lines: Type.Optional(Type.Array(JournalLineResponseDto)),
  audit: AuditMetadataDto,
});
export type JournalResponseDto = Type.Static<typeof JournalResponseDto>;
