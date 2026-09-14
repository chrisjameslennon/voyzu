import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { BusinessCode, IsoDate } from "../../common/types/constraints";

export const ArDocumentReferenceRequestDto = StrictObject({
  document_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
});
export type ArDocumentReferenceRequestDto = Type.Static<typeof ArDocumentReferenceRequestDto>;

export const ArReceiptApplicationLineRequestDto = StrictObject({
  source_receipt: Type.Optional(Type.Union([ArDocumentReferenceRequestDto, Type.Null()])),
  target_invoice: Type.Optional(Type.Union([ArDocumentReferenceRequestDto, Type.Null()])),
  amount: Type.Union([Type.Number(), Type.String()]),
});
export type ArReceiptApplicationLineRequestDto = Type.Static<typeof ArReceiptApplicationLineRequestDto>;

export const ArReceiptApplicationRequestDto = StrictObject({
  document_type: Type.Literal("AR_RECEIPT_APPLICATION"),
  company_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  ar_counterparty_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  document_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  document_memo: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  application_date: IsoDate,
  posting_date: Type.Optional(Type.Union([IsoDate, Type.Null()])),
  applications: Type.Array(ArReceiptApplicationLineRequestDto),
});
export type ArReceiptApplicationRequestDto = Type.Static<typeof ArReceiptApplicationRequestDto>;
