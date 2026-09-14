import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { AuditMetadataDto, DrCr, EntryType } from "../../common/types/index";
import { BusinessCode, CurrencyCode, IsoDate, NonBlankText, PositiveId } from "../../common/types/constraints";

export const TaxSubledgerEntryLineResponseDto = StrictObject({
  lineNumber: PositiveId, taxRuleCode: BusinessCode, taxControlAccountCode: BusinessCode,
  taxControlAccountName: Type.Union([NonBlankText, Type.Null()]), taxAuthorityCode: BusinessCode,
  taxAuthorityName: NonBlankText, schemeLabel: Type.Union([Type.String(), Type.Null()]),
  taxRate: Type.Union([Type.Number(), Type.Null()]), taxableBaseCurrencyAmount: Type.Number(),
  drCr: DrCr, baseCurrencyAmount: Type.Number(),
});
export type TaxSubledgerEntryLineResponseDto = Type.Static<typeof TaxSubledgerEntryLineResponseDto>;

export const TaxSubledgerEntryResponseDto = StrictObject({
  id: PositiveId, code: BusinessCode, journalHeaderId: PositiveId, journalCode: BusinessCode,
  hasBankCashDetails: Type.Boolean(), arSubledgerEntryCode: Type.Union([BusinessCode, Type.Null()]),
  apSubledgerEntryCode: Type.Union([BusinessCode, Type.Null()]), postingDate: IsoDate, documentDate: IsoDate,
  baseCurrencyCode: CurrencyCode, entryType: EntryType, baseCurrencyAmount: Type.Number(), status: Type.String(),
  documentTypeCode: BusinessCode, documentTypeLabel: Type.String(), documentId: Type.String(), description: Type.String(),
  taxRuleCode: BusinessCode, taxControlAccountCode: Type.Union([BusinessCode, Type.Null()]),
  taxControlAccountName: Type.Union([NonBlankText, Type.Null()]), taxAuthorityCode: BusinessCode, taxAuthorityName: NonBlankText,
  schemeLabel: Type.Union([Type.String(), Type.Null()]), taxRate: Type.Union([Type.Number(), Type.Null()]),
  taxLines: Type.Array(TaxSubledgerEntryLineResponseDto), audit: AuditMetadataDto,
  documentSnapshot: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
  detailedDocumentSnapshot: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
});
export type TaxSubledgerEntryResponseDto = Type.Static<typeof TaxSubledgerEntryResponseDto>;
