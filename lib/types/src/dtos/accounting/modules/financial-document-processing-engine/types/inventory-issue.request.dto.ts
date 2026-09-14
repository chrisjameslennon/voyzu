import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { InventoryDocumentSourceDto } from "./inventory-receipt.request.dto";
import { BusinessCode, IsoDate, PositiveId } from "../../common/types/constraints";

export const InventoryIssueLineRequestDto = StrictObject({
  line_id: Type.Optional(Type.Union([PositiveId, Type.Null()])),
  inventory_item_code: BusinessCode,
  description: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  quantity_delta: Type.Union([Type.Number(), Type.String()]),
  gl_account_code: BusinessCode,
  issue_purpose: Type.Union([Type.Literal("SOLD"), Type.Literal("CONSUMED")]),
  dimensions: Type.Optional(Type.Union([Type.Record(Type.String(), Type.String()), Type.Null()])),
});
export type InventoryIssueLineRequestDto = Type.Static<typeof InventoryIssueLineRequestDto>;

export const InventoryIssueRequestDto = StrictObject({
  document_type: Type.Literal("INVENTORY_ISSUE"),
  company_code: BusinessCode,
  document_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  memo: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  issue_date: IsoDate,
  posting_date: Type.Optional(Type.Union([IsoDate, Type.Null()])),
  source: InventoryDocumentSourceDto,
  lines: Type.Array(InventoryIssueLineRequestDto),
});
export type InventoryIssueRequestDto = Type.Static<typeof InventoryIssueRequestDto>;
