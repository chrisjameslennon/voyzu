import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { BusinessCode, IsoDate } from "../../common/types/constraints";

export const ArInvoiceCancellationSourceInvoiceRequestDto = StrictObject({
  document_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
});
export type ArInvoiceCancellationSourceInvoiceRequestDto = Type.Static<typeof ArInvoiceCancellationSourceInvoiceRequestDto>;

export const ArInvoiceCancellationRequestDto = StrictObject({
  document_type: Type.Optional(Type.Literal("AR_INVOICE_CANCELLATION")),
  company_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  ar_counterparty_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  document_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  document_memo: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  source_invoice: Type.Optional(Type.Union([ArInvoiceCancellationSourceInvoiceRequestDto, Type.Null()])),
  cancellation_date: IsoDate,
  posting_date: Type.Optional(Type.Union([IsoDate, Type.Null()])),
});
export type ArInvoiceCancellationRequestDto = Type.Static<typeof ArInvoiceCancellationRequestDto>;
