import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { BusinessCode, IsoDate } from "../../common/types/constraints";

export const ArWriteOffTargetInvoiceRequestDto = StrictObject({
  document_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
});
export type ArWriteOffTargetInvoiceRequestDto = Type.Static<typeof ArWriteOffTargetInvoiceRequestDto>;

export const ArWriteOffApplicationRequestDto = StrictObject({
  target_invoice: Type.Optional(Type.Union([ArWriteOffTargetInvoiceRequestDto, Type.Null()])),
  amount: Type.Union([Type.Number(), Type.String()]),
});
export type ArWriteOffApplicationRequestDto = Type.Static<typeof ArWriteOffApplicationRequestDto>;

export const ArWriteOffRequestDto = StrictObject({
  document_type: Type.Optional(Type.Literal("AR_WRITE_OFF")),
  company_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  ar_counterparty_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  document_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  memo: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  write_off_date: IsoDate,
  posting_date: Type.Optional(Type.Union([IsoDate, Type.Null()])),
  write_off_expense_posting_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  applications: Type.Array(ArWriteOffApplicationRequestDto),
  dimensions: Type.Optional(Type.Union([Type.Record(Type.String(), Type.String()), Type.Null()])),
});
export type ArWriteOffRequestDto = Type.Static<typeof ArWriteOffRequestDto>;
