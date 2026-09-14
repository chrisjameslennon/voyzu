import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { DrCr } from "../../common/types/index";
import { BusinessCode, CountryCode, CurrencyCode, IsoDate, NonBlankText, PositiveId } from "../../common/types/constraints";

export const ApBillCompanySnapshotDto = StrictObject({
  code: BusinessCode,
  base_currency_code: CurrencyCode,
});
export type ApBillCompanySnapshotDto = Type.Static<typeof ApBillCompanySnapshotDto>;

export const ApBillCounterpartySnapshotDto = StrictObject({
  code: BusinessCode,
  name: NonBlankText,
  status: Type.Union([Type.Literal("ACTIVE"), Type.Literal("INACTIVE")]),
  country_code: CountryCode,
  tax_region_or_province: Type.Union([Type.String(), Type.Null()]),
});
export type ApBillCounterpartySnapshotDto = Type.Static<typeof ApBillCounterpartySnapshotDto>;

export const ApBillApCounterpartyDetailsDto = StrictObject({
  ...ApBillCounterpartySnapshotDto.properties,
  id: Type.Union([PositiveId, Type.Null()]),
  company_code: BusinessCode,
  was_created: Type.Boolean(),
});
export type ApBillApCounterpartyDetailsDto = Type.Static<typeof ApBillApCounterpartyDetailsDto>;

export const ApBillDetailedTaxComponentDto = StrictObject({
  tax_rule: Type.String(),
  tax_rule_id: Type.Optional(PositiveId),
  tax_component_id: Type.Optional(Type.Union([PositiveId, Type.Null()])),
  tax_authority_id: Type.Optional(PositiveId),
  tax_authority_code: BusinessCode,
  tax_authority_name: Type.Optional(NonBlankText),
  scheme_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  invoice_label: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  report_label: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  tax_rate: Type.Number(),
  taxable_amount: Type.Number(),
  raw_tax_amount: Type.Number(),
  tax_amount: Type.Number(),
  tax_recoverable: Type.Boolean(),
});
export type ApBillDetailedTaxComponentDto = Type.Static<typeof ApBillDetailedTaxComponentDto>;

export const ApBillDetailedLineDto = StrictObject({
  line_id: PositiveId,
  line_description: Type.String(),
  quantity: Type.Union([Type.Number(), Type.Null()]),
  purchase_posting_code: BusinessCode,
  inventory_item_code: Type.Union([BusinessCode, Type.Null()]),
  net_amount: Type.Number(),
  tax_rule: Type.String(),
  tax_amount: Type.Number(),
  gross_amount: Type.Number(),
  recoverable_tax_amount: Type.Number(),
  non_recoverable_tax_amount: Type.Number(),
  purchase_amount: Type.Number(),
  tax_components: Type.Array(ApBillDetailedTaxComponentDto),
  dimensions: Type.Record(Type.String(), Type.String()),
});
export type ApBillDetailedLineDto = Type.Static<typeof ApBillDetailedLineDto>;

export const ApBillDetailedDocumentDto = StrictObject({
  company: ApBillCompanySnapshotDto,
  ap_counterparty: ApBillCounterpartySnapshotDto,
  document_id: Type.String(),
  supplier_invoice_number: Type.String(),
  memo: Type.Union([Type.String(), Type.Null()]),
  generated_description: Type.String(),
  bill_date: IsoDate,
  posting_date: IsoDate,
  lines: Type.Array(ApBillDetailedLineDto),
  net_amount: Type.Number(),
  recoverable_tax_amount: Type.Number(),
  non_recoverable_tax_amount: Type.Number(),
  tax_amount: Type.Number(),
  gross_amount: Type.Number(),
});
export type ApBillDetailedDocumentDto = Type.Static<typeof ApBillDetailedDocumentDto>;

export const ApBillApSubledgerDetailsDto = StrictObject({
  id: Type.Union([PositiveId, Type.Null()]),
  code: Type.Union([BusinessCode, Type.Null()]),
  company_code: BusinessCode,
  journal_header_id: Type.Union([PositiveId, Type.Null()]),
  ap_counterparty_code: BusinessCode,
  control_account_code: Type.Literal("AP_TRADE_PAYABLES"),
  posting_date: IsoDate,
  financial_year_code: BusinessCode,
  financial_period_code: BusinessCode,
  base_currency_code: CurrencyCode,
  entry_type: Type.Literal("CREDIT"),
  base_currency_amount: Type.Number(),
  open_amount: Type.Number(),
  memo: Type.Union([Type.String(), Type.Null()]),
  status: Type.Union([Type.Literal("POSTED"), Type.Literal("EPHEMERAL")]),
});
export type ApBillApSubledgerDetailsDto = Type.Static<typeof ApBillApSubledgerDetailsDto>;

export const ApBillTaxLedgerDetailDto = StrictObject({
  id: Type.Union([PositiveId, Type.Null()]),
  code: Type.Union([BusinessCode, Type.Null()]),
  tax_rule: Type.String(),
  tax_component_id: Type.Union([PositiveId, Type.Null()]),
  tax_authority_code: BusinessCode,
  tax_authority_name: Type.Optional(NonBlankText),
  tax_movement_type_code: Type.Literal("TAX_ON_PURCHASES"),
  description: Type.String(),
  scheme_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  invoice_label: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  report_label: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  tax_rate: Type.Number(),
  taxable_amount: Type.Number(),
  posting_date: IsoDate,
  financial_year_code: BusinessCode,
  financial_period_code: BusinessCode,
  base_currency_code: CurrencyCode,
  entry_type: Type.Literal("DEBIT"),
  base_currency_amount: Type.Number(),
  status: Type.Union([Type.Literal("POSTED"), Type.Literal("EPHEMERAL")]),
});
export type ApBillTaxLedgerDetailDto = Type.Static<typeof ApBillTaxLedgerDetailDto>;

export const ApBillJournalHeaderDto = StrictObject({
  id: Type.Union([PositiveId, Type.Null()]),
  code: Type.Union([BusinessCode, Type.Null()]),
  document_type_code: Type.Literal("AP_BILL"),
  document_id: Type.String(),
  generated_description: Type.String(),
  posting_engine_code: Type.Literal("AP_BILL"),
  company_code: BusinessCode,
  document_date: IsoDate,
  posting_date: IsoDate,
  financial_year_code: BusinessCode,
  financial_period_code: BusinessCode,
  base_currency_code: CurrencyCode,
  total_debit_base_amount: Type.Number(),
  total_credit_base_amount: Type.Number(),
  memo: Type.Union([Type.String(), Type.Null()]),
  status: Type.Union([Type.Literal("POSTED"), Type.Literal("EPHEMERAL")]),
});
export type ApBillJournalHeaderDto = Type.Static<typeof ApBillJournalHeaderDto>;

export const ApBillJournalLineDimensionDto = StrictObject({
  dimension_code: BusinessCode,
  dimension_name: NonBlankText,
  dimension_value_name: NonBlankText,
});
export type ApBillJournalLineDimensionDto = Type.Static<typeof ApBillJournalLineDimensionDto>;

export const ApBillJournalLineDto = StrictObject({
  id: Type.Union([PositiveId, Type.Null()]),
  journal_header_id: Type.Union([PositiveId, Type.Null()]),
  line_number: PositiveId,
  gl_account_code: BusinessCode,
  gl_account_name: NonBlankText,
  source_ledger: Type.Union([Type.String(), Type.Null()]),
  source_control_account: Type.Union([Type.String(), Type.Null()]),
  dr_cr: DrCr,
  base_currency_amount: Type.Number(),
  description: Type.String(),
  memo: Type.Union([Type.String(), Type.Null()]),
  dimensions: Type.Optional(Type.Array(ApBillJournalLineDimensionDto)),
});
export type ApBillJournalLineDto = Type.Static<typeof ApBillJournalLineDto>;

export const ApBillPostingDetailsDto = StrictObject({
  journal_header: ApBillJournalHeaderDto,
  journal_lines: Type.Array(ApBillJournalLineDto),
});
export type ApBillPostingDetailsDto = Type.Static<typeof ApBillPostingDetailsDto>;

export const ApBillPostingResponseDto = StrictObject({
  detailed_document: ApBillDetailedDocumentDto,
  ap_subledger_details: ApBillApSubledgerDetailsDto,
  ap_counterparty_details: ApBillApCounterpartyDetailsDto,
  tax_ledger_details: Type.Array(ApBillTaxLedgerDetailDto),
  posting_details: ApBillPostingDetailsDto,
});
export type ApBillPostingResponseDto = Type.Static<typeof ApBillPostingResponseDto>;
