import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { DrCr } from "../../common/types/index";
import { BusinessCode, CountryCode, CurrencyCode, IsoDate, NonBlankText, PositiveId } from "../../common/types/constraints";

export const ArInvoiceCompanySnapshotDto = StrictObject({
  code: BusinessCode,
  base_currency_code: CurrencyCode,
});
export type ArInvoiceCompanySnapshotDto = Type.Static<typeof ArInvoiceCompanySnapshotDto>;

export const ArInvoiceCounterpartySnapshotDto = StrictObject({
  code: BusinessCode,
  name: NonBlankText,
  status: Type.Union([Type.Literal("ACTIVE"), Type.Literal("INACTIVE")]),
  country_code: CountryCode,
  tax_region_or_province: Type.Union([Type.String(), Type.Null()]),
});
export type ArInvoiceCounterpartySnapshotDto = Type.Static<typeof ArInvoiceCounterpartySnapshotDto>;

export const ArInvoiceArCounterpartyDetailsDto = StrictObject({
  ...ArInvoiceCounterpartySnapshotDto.properties,
  id: Type.Union([PositiveId, Type.Null()]),
  company_code: BusinessCode,
  was_created: Type.Boolean(),
});
export type ArInvoiceArCounterpartyDetailsDto = Type.Static<typeof ArInvoiceArCounterpartyDetailsDto>;

export const ArInvoiceDetailedTaxComponentDto = StrictObject({
  tax_rule: Type.String(),
  tax_rule_id: Type.Optional(PositiveId),
  tax_component_id: Type.Optional(Type.Union([PositiveId, Type.Null()])),
  tax_authority_id: Type.Optional(PositiveId),
  tax_authority_code: BusinessCode,
  tax_authority_name: Type.Optional(NonBlankText),
  scheme_code: Type.Optional(BusinessCode),
  invoice_label: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  report_label: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  tax_rate: Type.Number(),
  taxable_amount: Type.Number(),
  raw_tax_amount: Type.Number(),
  tax_amount: Type.Number(),
});
export type ArInvoiceDetailedTaxComponentDto = Type.Static<typeof ArInvoiceDetailedTaxComponentDto>;

export const ArInvoiceDetailedLineDto = StrictObject({
  line_id: PositiveId,
  line_description: Type.String(),
  quantity: Type.Union([Type.Number(), Type.Null()]),
  net_unit_price: Type.Union([Type.Number(), Type.Null()]),
  revenue_posting_code: BusinessCode,
  inventory_item_code: Type.Union([BusinessCode, Type.Null()]),
  tax_rule: Type.String(),
  raw_net_line_total: Type.Number(),
  net_line_total: Type.Number(),
  tax_components: Type.Array(ArInvoiceDetailedTaxComponentDto),
  tax_amount: Type.Number(),
  gross_line_total: Type.Number(),
  dimensions: Type.Record(Type.String(), Type.String()),
});
export type ArInvoiceDetailedLineDto = Type.Static<typeof ArInvoiceDetailedLineDto>;

export const ArInvoiceDetailedInvoiceDto = StrictObject({
  company: ArInvoiceCompanySnapshotDto,
  ar_counterparty: ArInvoiceCounterpartySnapshotDto,
  document_id: Type.String(),
  document_memo: Type.Union([Type.String(), Type.Null()]),
  generated_description: Type.String(),
  invoice_date: IsoDate,
  posting_date: IsoDate,
  lines: Type.Array(ArInvoiceDetailedLineDto),
  net_amount: Type.Number(),
  tax_amount: Type.Number(),
  gross_amount: Type.Number(),
});
export type ArInvoiceDetailedInvoiceDto = Type.Static<typeof ArInvoiceDetailedInvoiceDto>;

export const ArInvoiceArSubledgerDetailsDto = StrictObject({
  id: Type.Union([PositiveId, Type.Null()]),
  code: Type.Union([BusinessCode, Type.Null()]),
  company_code: BusinessCode,
  journal_header_id: Type.Union([PositiveId, Type.Null()]),
  ar_counterparty_code: BusinessCode,
  control_account_code: Type.Literal("AR_TRADE_RECEIVABLES"),
  posting_date: IsoDate,
  financial_year_code: BusinessCode,
  financial_period_code: BusinessCode,
  base_currency_code: CurrencyCode,
  entry_type: Type.Literal("DEBIT"),
  base_currency_amount: Type.Number(),
  open_amount: Type.Number(),
  document_memo: Type.Union([Type.String(), Type.Null()]),
  status: Type.Union([Type.Literal("POSTED"), Type.Literal("EPHEMERAL")]),
});
export type ArInvoiceArSubledgerDetailsDto = Type.Static<typeof ArInvoiceArSubledgerDetailsDto>;

export const ArInvoiceTaxLedgerDetailDto = StrictObject({
  id: Type.Union([PositiveId, Type.Null()]),
  code: Type.Union([BusinessCode, Type.Null()]),
  tax_rule: Type.String(),
  tax_component_id: Type.Union([PositiveId, Type.Null()]),
  tax_authority_code: BusinessCode,
  tax_authority_name: Type.Optional(NonBlankText),
  tax_movement_type_code: Type.Literal("TAX_ON_SALES"),
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
  entry_type: Type.Literal("CREDIT"),
  base_currency_amount: Type.Number(),
  status: Type.Union([Type.Literal("POSTED"), Type.Literal("EPHEMERAL")]),
});
export type ArInvoiceTaxLedgerDetailDto = Type.Static<typeof ArInvoiceTaxLedgerDetailDto>;

export const ArInvoiceJournalHeaderDto = StrictObject({
  id: Type.Union([PositiveId, Type.Null()]),
  code: Type.Union([BusinessCode, Type.Null()]),
  document_type_code: Type.Literal("AR_INVOICE"),
  document_id: Type.String(),
  generated_description: Type.String(),
  posting_engine_code: Type.Literal("AR_INVOICE"),
  company_code: BusinessCode,
  document_date: IsoDate,
  posting_date: IsoDate,
  financial_year_code: BusinessCode,
  financial_period_code: BusinessCode,
  base_currency_code: CurrencyCode,
  total_debit_base_amount: Type.Number(),
  total_credit_base_amount: Type.Number(),
  document_memo: Type.Union([Type.String(), Type.Null()]),
  status: Type.Union([Type.Literal("POSTED"), Type.Literal("EPHEMERAL")]),
});
export type ArInvoiceJournalHeaderDto = Type.Static<typeof ArInvoiceJournalHeaderDto>;

export const ArInvoiceJournalLineDimensionDto = StrictObject({
  dimension_code: BusinessCode,
  dimension_name: NonBlankText,
  dimension_value_name: NonBlankText,
});
export type ArInvoiceJournalLineDimensionDto = Type.Static<typeof ArInvoiceJournalLineDimensionDto>;

export const ArInvoiceJournalLineDto = StrictObject({
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
  document_memo: Type.Union([Type.String(), Type.Null()]),
  dimensions: Type.Optional(Type.Array(ArInvoiceJournalLineDimensionDto)),
});
export type ArInvoiceJournalLineDto = Type.Static<typeof ArInvoiceJournalLineDto>;

export const ArInvoicePostingDetailsDto = StrictObject({
  journal_header: ArInvoiceJournalHeaderDto,
  journal_lines: Type.Array(ArInvoiceJournalLineDto),
});
export type ArInvoicePostingDetailsDto = Type.Static<typeof ArInvoicePostingDetailsDto>;

export const ArInvoicePostingResponseDto = StrictObject({
  detailed_document: ArInvoiceDetailedInvoiceDto,
  ar_subledger_details: ArInvoiceArSubledgerDetailsDto,
  ar_counterparty_details: ArInvoiceArCounterpartyDetailsDto,
  tax_ledger_details: Type.Array(ArInvoiceTaxLedgerDetailDto),
  posting_details: ArInvoicePostingDetailsDto,
});
export type ArInvoicePostingResponseDto = Type.Static<typeof ArInvoicePostingResponseDto>;
