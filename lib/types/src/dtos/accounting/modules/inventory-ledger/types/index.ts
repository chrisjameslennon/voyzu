import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { AuditMetadataDto } from "../../common/types/index";
import { BusinessCode, CurrencyCode, IsoDate, NonBlankText, PositiveId } from "../../common/types/constraints";

export const InventoryLedgerControlAccountBalanceDto = StrictObject({
  controlAccountCode: BusinessCode, controlAccountName: NonBlankText, glAccountCode: BusinessCode,
  glAccountName: NonBlankText, balance: Type.Number(),
});
export type InventoryLedgerControlAccountBalanceDto = Type.Static<typeof InventoryLedgerControlAccountBalanceDto>;

export const InventoryLedgerEntryResponseDto = StrictObject({
  id: PositiveId, code: BusinessCode, journalHeaderId: PositiveId, journalCode: BusinessCode,
  postingDate: IsoDate, sourceDocument: Type.String(), movement: Type.String(), documentId: Type.String(),
  itemCode: BusinessCode, itemName: NonBlankText, qtyDelta: Type.Number(),
  unitValueSupplied: Type.Union([Type.Number(), Type.Null()]), bookValueDelta: Type.Number(), qtyBalance: Type.Number(),
  avgUnitValue: Type.Number(), bookValueBalance: Type.Number(), baseCurrencyCode: CurrencyCode, status: Type.Literal("POSTED"),
  controlAccountCode: BusinessCode, controlAccountName: NonBlankText, glAccountCode: BusinessCode, glAccountName: NonBlankText,
  controlAccountBalances: Type.Array(InventoryLedgerControlAccountBalanceDto), audit: AuditMetadataDto,
});
export type InventoryLedgerEntryResponseDto = Type.Static<typeof InventoryLedgerEntryResponseDto>;

export const InventoryValuationResponseDto = StrictObject({
  id: PositiveId, itemCode: BusinessCode, itemName: NonBlankText, quantityOnHand: Type.Number(),
  averageUnitCost: Type.Number(), bookValue: Type.Number(), baseCurrencyCode: CurrencyCode, asAtDate: IsoDate,
});
export type InventoryValuationResponseDto = Type.Static<typeof InventoryValuationResponseDto>;

export const InventoryLedgerEntryDetailLineDto = StrictObject({
  id: PositiveId, lineNumber: PositiveId, movement: Type.String(), itemCode: BusinessCode, itemName: NonBlankText,
  qtyDelta: Type.Number(), unitValueSupplied: Type.Union([Type.Number(), Type.Null()]), bookValueDelta: Type.Number(),
  qtyBalance: Type.Number(), avgUnitValue: Type.Number(), bookValueBalance: Type.Number(),
  description: Type.Union([Type.String(), Type.Null()]), memo: Type.Union([Type.String(), Type.Null()]),
});
export type InventoryLedgerEntryDetailLineDto = Type.Static<typeof InventoryLedgerEntryDetailLineDto>;

export const InventoryLedgerEntryDetailResponseDto = StrictObject({
  id: PositiveId, code: BusinessCode, journalHeaderId: PositiveId, journalCode: BusinessCode, postingDate: IsoDate,
  documentDate: IsoDate, sourceDocument: Type.String(), documentId: Type.String(),
  upstreamDocumentTypeCode: Type.Union([BusinessCode, Type.Null()]), upstreamDocumentId: Type.Union([Type.String(), Type.Null()]),
  description: Type.Union([Type.String(), Type.Null()]), memo: Type.Union([Type.String(), Type.Null()]),
  baseCurrencyCode: CurrencyCode, status: Type.Literal("POSTED"), controlAccountCode: BusinessCode, controlAccountName: NonBlankText,
  glAccountCode: BusinessCode, glAccountName: NonBlankText, controlAccountBalances: Type.Array(InventoryLedgerControlAccountBalanceDto),
  documentSnapshot: Type.Record(Type.String(), Type.Unknown()), detailedDocumentSnapshot: Type.Record(Type.String(), Type.Unknown()),
  audit: AuditMetadataDto, lines: Type.Array(InventoryLedgerEntryDetailLineDto),
});
export type InventoryLedgerEntryDetailResponseDto = Type.Static<typeof InventoryLedgerEntryDetailResponseDto>;
