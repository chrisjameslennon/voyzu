import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { BusinessCode, CountryCode, IsoDate, NonBlankText, PositiveId } from "../../common/types/constraints";

export const ApBillCounterpartyInputDto = StrictObject({
  code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  name: NonBlankText,
  status: Type.Union([Type.Literal("ACTIVE"), Type.Literal("INACTIVE")]),
  country_code: CountryCode,
  state_or_province_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
});
export type ApBillCounterpartyInputDto = Type.Static<typeof ApBillCounterpartyInputDto>;

export const ApBillDimensionsDto = Type.Record(Type.String(), Type.String());
export type ApBillDimensionsDto = Type.Static<typeof ApBillDimensionsDto>;
export const ApBillAmountDto = Type.Union([Type.Number(), Type.String()]);
export type ApBillAmountDto = Type.Static<typeof ApBillAmountDto>;

export const ApBillCallerSuppliedTaxComponentDto = StrictObject({
  tax_authority_code: BusinessCode,
  tax_rate: Type.Number(),
  invoice_label: Type.Optional(Type.Union([Type.String(), Type.Null()])),
});
export type ApBillCallerSuppliedTaxComponentDto = Type.Static<typeof ApBillCallerSuppliedTaxComponentDto>;

export const ApBillLineRequestDto = StrictObject({
  line_id: Type.Optional(Type.Union([PositiveId, Type.Null()])),
  description: Type.String(),
  quantity: Type.Optional(Type.Union([ApBillAmountDto, Type.Null()])),
  net_amount: Type.Optional(Type.Union([ApBillAmountDto, Type.Null()])),
  gross_amount: Type.Optional(Type.Union([ApBillAmountDto, Type.Null()])),
  tax_rule: Type.String(),
  tax_components: Type.Optional(Type.Union([Type.Array(ApBillCallerSuppliedTaxComponentDto), Type.Null()])),
  tax_recoverable: Type.Optional(Type.Union([Type.Boolean(), Type.Null()])),
  purchase_posting_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  inventory_item_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  dimensions: Type.Optional(Type.Union([ApBillDimensionsDto, Type.Null()])),
});
export type ApBillLineRequestDto = Type.Static<typeof ApBillLineRequestDto>;

export const ApBillRequestDto = StrictObject({
  document_type: Type.Optional(Type.Literal("AP_BILL")),
  company_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  ap_counterparty_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  ap_counterparty: Type.Optional(Type.Union([ApBillCounterpartyInputDto, Type.Null()])),
  document_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  supplier_invoice_number: Type.String(),
  memo: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  bill_date: IsoDate,
  posting_date: Type.Optional(Type.Union([IsoDate, Type.Null()])),
  tax_recoverable: Type.Optional(Type.Union([Type.Boolean(), Type.Null()])),
  purchase_posting_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  dimensions: Type.Optional(Type.Union([ApBillDimensionsDto, Type.Null()])),
  lines: Type.Array(ApBillLineRequestDto),
});
export type ApBillRequestDto = Type.Static<typeof ApBillRequestDto>;
