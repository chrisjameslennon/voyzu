import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { BusinessCode, CountryCode, IsoDate, NonBlankText, PositiveId } from "../../common/types/constraints";

export const ArInvoiceCounterpartyInputDto = StrictObject({
  code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  name: NonBlankText,
  status: Type.Union([Type.Literal("ACTIVE"), Type.Literal("INACTIVE")]),
  country_code: CountryCode,
  state_or_province_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
});
export type ArInvoiceCounterpartyInputDto = Type.Static<typeof ArInvoiceCounterpartyInputDto>;

export const ArInvoiceDimensionsDto = Type.Record(Type.String(), Type.String());
export type ArInvoiceDimensionsDto = Type.Static<typeof ArInvoiceDimensionsDto>;

export const ArInvoiceCallerSuppliedTaxComponentDto = StrictObject({
  tax_authority_code: BusinessCode,
  tax_rate: Type.Number(),
  invoice_label: Type.Optional(Type.Union([Type.String(), Type.Null()])),
});
export type ArInvoiceCallerSuppliedTaxComponentDto = Type.Static<typeof ArInvoiceCallerSuppliedTaxComponentDto>;

export const ArInvoiceLineRequestDto = StrictObject({
  line_id: Type.Optional(Type.Union([PositiveId, Type.Null()])),
  description: Type.String(),
  quantity: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
  net_unit_price: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
  net_line_total: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
  revenue_posting_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  inventory_item_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  tax_rule: Type.String(),
  tax_components: Type.Optional(Type.Union([Type.Array(ArInvoiceCallerSuppliedTaxComponentDto), Type.Null()])),
  dimensions: Type.Optional(Type.Union([ArInvoiceDimensionsDto, Type.Null()])),
});
export type ArInvoiceLineRequestDto = Type.Static<typeof ArInvoiceLineRequestDto>;

export const ArInvoiceRequestDto = StrictObject({
  document_type: Type.Optional(Type.Literal("AR_INVOICE")),
  company_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  ar_counterparty_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  ar_counterparty: Type.Optional(Type.Union([ArInvoiceCounterpartyInputDto, Type.Null()])),
  document_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  document_memo: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  invoice_date: IsoDate,
  posting_date: Type.Optional(Type.Union([IsoDate, Type.Null()])),
  revenue_posting_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  dimensions: Type.Optional(Type.Union([ArInvoiceDimensionsDto, Type.Null()])),
  lines: Type.Array(ArInvoiceLineRequestDto),
});
export type ArInvoiceRequestDto = Type.Static<typeof ArInvoiceRequestDto>;
