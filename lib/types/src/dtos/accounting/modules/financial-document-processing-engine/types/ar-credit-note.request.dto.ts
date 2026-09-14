import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { ArInvoiceCallerSuppliedTaxComponentDto, ArInvoiceDimensionsDto } from "./ar-invoice.request.dto";
import { BusinessCode, CountryCode, IsoDate, NonBlankText, PositiveId } from "../../common/types/constraints";

export const ArCreditNoteCounterpartyInputDto = StrictObject({
  code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  name: NonBlankText,
  status: Type.Union([Type.Literal("ACTIVE"), Type.Literal("INACTIVE")]),
  country_code: CountryCode,
  state_or_province_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
});
export type ArCreditNoteCounterpartyInputDto = Type.Static<typeof ArCreditNoteCounterpartyInputDto>;

export const ArCreditNoteLineRequestDto = StrictObject({
  line_id: Type.Optional(Type.Union([PositiveId, Type.Null()])),
  description: Type.String(),
  quantity: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
  net_unit_price: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
  net_line_total: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
  revenue_posting_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  tax_rule: Type.String(),
  tax_components: Type.Optional(Type.Union([Type.Array(ArInvoiceCallerSuppliedTaxComponentDto), Type.Null()])),
  dimensions: Type.Optional(Type.Union([ArInvoiceDimensionsDto, Type.Null()])),
});
export type ArCreditNoteLineRequestDto = Type.Static<typeof ArCreditNoteLineRequestDto>;

export const ArCreditNoteAllocationRequestDto = StrictObject({
  document_id: Type.String(),
  amount: Type.Union([Type.Number(), Type.String()]),
});
export type ArCreditNoteAllocationRequestDto = Type.Static<typeof ArCreditNoteAllocationRequestDto>;

export const ArCreditNoteRequestDto = StrictObject({
  document_type: Type.Optional(Type.Literal("AR_CREDIT_NOTE")),
  company_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  ar_counterparty_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  ar_counterparty: Type.Optional(Type.Union([ArCreditNoteCounterpartyInputDto, Type.Null()])),
  document_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  memo: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  credit_note_date: IsoDate,
  posting_date: Type.Optional(Type.Union([IsoDate, Type.Null()])),
  revenue_posting_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  dimensions: Type.Optional(Type.Union([ArInvoiceDimensionsDto, Type.Null()])),
  lines: Type.Array(ArCreditNoteLineRequestDto),
  allocations: Type.Optional(Type.Union([Type.Array(ArCreditNoteAllocationRequestDto), Type.Null()])),
});
export type ArCreditNoteRequestDto = Type.Static<typeof ArCreditNoteRequestDto>;
