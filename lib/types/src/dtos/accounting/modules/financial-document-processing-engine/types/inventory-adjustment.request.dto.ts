import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { InventoryDocumentSourceDto } from "./inventory-receipt.request.dto";
import { BusinessCode, IsoDate, PositiveId } from "../../common/types/constraints";

export const InventoryAdjustmentLineRequestDto = StrictObject({
  line_id: Type.Optional(Type.Union([PositiveId, Type.Null()])),
  inventory_item_code: BusinessCode,
  description: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  adjustment_type: Type.Union([Type.Literal("QUANTITY_ADJUSTMENT"), Type.Literal("VALUE_ADJUSTMENT")]),
  quantity_delta: Type.Optional(Type.Union([Type.Number(), Type.String(), Type.Null()])),
  unit_book_value: Type.Optional(Type.Union([Type.Number(), Type.String(), Type.Null()])),
  book_value_delta: Type.Optional(Type.Union([Type.Number(), Type.String(), Type.Null()])),
  reason_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  gl_account_code: BusinessCode,
  dimensions: Type.Optional(Type.Union([Type.Record(Type.String(), Type.String()), Type.Null()])),
});
export type InventoryAdjustmentLineRequestDto = Type.Static<typeof InventoryAdjustmentLineRequestDto>;

export const InventoryAdjustmentRequestDto = StrictObject({
  document_type: Type.Literal("INVENTORY_ADJUSTMENT"),
  company_code: BusinessCode,
  document_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  memo: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  adjustment_date: IsoDate,
  posting_date: Type.Optional(Type.Union([IsoDate, Type.Null()])),
  source: InventoryDocumentSourceDto,
  lines: Type.Array(InventoryAdjustmentLineRequestDto),
});
export type InventoryAdjustmentRequestDto = Type.Static<typeof InventoryAdjustmentRequestDto>;
