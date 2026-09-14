import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { BusinessCode, IsoDate, PositiveId } from "../../common/types/constraints";

export const InventoryDocumentSourceDto = StrictObject({
  source_document: Type.String(),
  source_document_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  source_type: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  source_line_id: Type.Optional(Type.Union([PositiveId, Type.Null()])),
});
export type InventoryDocumentSourceDto = Type.Static<typeof InventoryDocumentSourceDto>;

export const InventoryReceiptLineRequestDto = StrictObject({
  line_id: Type.Optional(Type.Union([PositiveId, Type.Null()])),
  inventory_item_code: BusinessCode,
  description: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  quantity_delta: Type.Union([Type.Number(), Type.String()]),
  gl_account_code: BusinessCode,
  valuation_method: Type.Union([Type.Literal("SUPPLIED_UNIT_BOOK_VALUE"), Type.Literal("CURRENT_AVERAGE_BOOK_VALUE"), Type.Literal("SOURCE_LINE_UNIT_VALUE")]),
  unit_book_value: Type.Optional(Type.Union([Type.Number(), Type.String(), Type.Null()])),
  dimensions: Type.Optional(Type.Union([Type.Record(Type.String(), Type.String()), Type.Null()])),
});
export type InventoryReceiptLineRequestDto = Type.Static<typeof InventoryReceiptLineRequestDto>;

export const InventoryReceiptRequestDto = StrictObject({
  document_type: Type.Literal("INVENTORY_RECEIPT"),
  company_code: BusinessCode,
  document_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  memo: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  receipt_date: IsoDate,
  posting_date: Type.Optional(Type.Union([IsoDate, Type.Null()])),
  source: InventoryDocumentSourceDto,
  lines: Type.Array(InventoryReceiptLineRequestDto),
});
export type InventoryReceiptRequestDto = Type.Static<typeof InventoryReceiptRequestDto>;
