import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { DrCr } from "../../common/types/index";
import { ArInvoiceDetailedInvoiceDto } from "./ar-invoice.response.dto";
import { BusinessCode, CurrencyCode, IsoDate, NonBlankText, PositiveId } from "../../common/types/constraints";

export const ArInvoiceCancellationDetailedDocumentDto = StrictObject({
  company: StrictObject({
    code: BusinessCode,
    base_currency_code: CurrencyCode,
  }),
  ar_counterparty: StrictObject({
    code: BusinessCode,
    name: NonBlankText,
  }),
  document_id: Type.String(),
  document_memo: Type.Union([Type.String(), Type.Null()]),
  generated_description: Type.String(),
  source_invoice_document_id: Type.String(),
  source_invoice_journal_code: BusinessCode,
  source_invoice_ar_subledger_entry_code: BusinessCode,
  source_invoice_ar_subledger_entry_id: PositiveId,
  source_invoice_open_amount_before: Type.Number(),
  source_invoice_open_amount_after: Type.Number(),
  cancellation_date: IsoDate,
  posting_date: IsoDate,
  original_invoice: ArInvoiceDetailedInvoiceDto,
  net_amount: Type.Number(),
  tax_amount: Type.Number(),
  gross_amount: Type.Number(),
});
export type ArInvoiceCancellationDetailedDocumentDto = Type.Static<typeof ArInvoiceCancellationDetailedDocumentDto>;

export const ArInvoiceCancellationArSubledgerDetailDto = StrictObject({
  id: Type.Union([PositiveId, Type.Null()]),
  code: Type.Union([BusinessCode, Type.Null()]),
  company_code: BusinessCode,
  journal_header_id: Type.Union([PositiveId, Type.Null()]),
  ar_counterparty_code: BusinessCode,
  control_account_code: Type.Literal("AR_TRADE_RECEIVABLES"),
  applied_to_ar_subledger_entry_id: PositiveId,
  posting_date: IsoDate,
  financial_year_code: BusinessCode,
  financial_period_code: BusinessCode,
  base_currency_code: CurrencyCode,
  entry_type: Type.Literal("CREDIT"),
  base_currency_amount: Type.Number(),
  document_memo: Type.Union([Type.String(), Type.Null()]),
  status: Type.Union([Type.Literal("POSTED"), Type.Literal("EPHEMERAL")]),
});
export type ArInvoiceCancellationArSubledgerDetailDto = Type.Static<typeof ArInvoiceCancellationArSubledgerDetailDto>;

export const ArInvoiceCancellationTaxLedgerDetailDto = StrictObject({
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
  entry_type: Type.Literal("DEBIT"),
  base_currency_amount: Type.Number(),
  status: Type.Union([Type.Literal("POSTED"), Type.Literal("EPHEMERAL")]),
});
export type ArInvoiceCancellationTaxLedgerDetailDto = Type.Static<typeof ArInvoiceCancellationTaxLedgerDetailDto>;

export const ArInvoiceCancellationJournalHeaderDto = StrictObject({
  id: Type.Union([PositiveId, Type.Null()]),
  code: Type.Union([BusinessCode, Type.Null()]),
  document_type_code: Type.Literal("AR_INVOICE_CANCELLATION"),
  document_id: Type.String(),
  generated_description: Type.String(),
  posting_engine_code: Type.Literal("AR_INVOICE_CANCELLATION"),
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
export type ArInvoiceCancellationJournalHeaderDto = Type.Static<typeof ArInvoiceCancellationJournalHeaderDto>;

export const ArInvoiceCancellationJournalLineDimensionDto = StrictObject({
  dimension_code: BusinessCode,
  dimension_name: NonBlankText,
  dimension_value_name: NonBlankText,
});
export type ArInvoiceCancellationJournalLineDimensionDto = Type.Static<typeof ArInvoiceCancellationJournalLineDimensionDto>;

export const ArInvoiceCancellationJournalLineDto = StrictObject({
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
  dimensions: Type.Optional(Type.Array(ArInvoiceCancellationJournalLineDimensionDto)),
});
export type ArInvoiceCancellationJournalLineDto = Type.Static<typeof ArInvoiceCancellationJournalLineDto>;

export const ArInvoiceCancellationPostingDetailsDto = StrictObject({
  journal_header: ArInvoiceCancellationJournalHeaderDto,
  journal_lines: Type.Array(ArInvoiceCancellationJournalLineDto),
});
export type ArInvoiceCancellationPostingDetailsDto = Type.Static<typeof ArInvoiceCancellationPostingDetailsDto>;

export const ArInvoiceCancellationPostingResponseDto = StrictObject({
  detailed_document: ArInvoiceCancellationDetailedDocumentDto,
  ar_subledger_details: ArInvoiceCancellationArSubledgerDetailDto,
  tax_ledger_details: Type.Array(ArInvoiceCancellationTaxLedgerDetailDto),
  posting_details: ArInvoiceCancellationPostingDetailsDto,
});
export type ArInvoiceCancellationPostingResponseDto = Type.Static<typeof ArInvoiceCancellationPostingResponseDto>;
