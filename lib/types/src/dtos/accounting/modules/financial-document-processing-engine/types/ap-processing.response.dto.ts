import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { DrCr, EntryType } from "../../common/types/index";
import { BusinessCode, CurrencyCode, IsoDate, NonBlankText, PositiveId } from "../../common/types/constraints";

export const ApProcessingDocumentType = Type.Union([Type.Literal("AP_CREDIT_NOTE"), Type.Literal("AP_OPENING_BALANCE"), Type.Literal("AP_PAYMENT"), Type.Literal("AP_PAYMENT_APPLICATION"), Type.Literal("AP_REFUND"), Type.Literal("AP_WRITE_OFF"), Type.Literal("AP_BILL_CANCELLATION")]);
export type ApProcessingDocumentType = Type.Static<typeof ApProcessingDocumentType>;

export const ApProcessingJournalLineDto = StrictObject({
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
});
export type ApProcessingJournalLineDto = Type.Static<typeof ApProcessingJournalLineDto>;

export const ApProcessingSubledgerDetailDto = StrictObject({
  id: Type.Union([PositiveId, Type.Null()]),
  code: Type.Union([BusinessCode, Type.Null()]),
  company_code: BusinessCode,
  journal_header_id: Type.Union([PositiveId, Type.Null()]),
  ap_counterparty_code: BusinessCode,
  control_account_code: Type.Union([Type.Literal("AP_TRADE_PAYABLES"), Type.Literal("AP_UNAPPLIED_PAYMENTS")]),
  source_entry_header_id: Type.Optional(Type.Union([PositiveId, Type.Null()])),
  applied_to_ap_subledger_entry_id: Type.Optional(Type.Union([PositiveId, Type.Null()])),
  posting_date: IsoDate,
  financial_year_code: BusinessCode,
  financial_period_code: BusinessCode,
  base_currency_code: CurrencyCode,
  entry_type: EntryType,
  base_currency_amount: Type.Number(),
  memo: Type.Union([Type.String(), Type.Null()]),
  status: Type.Union([Type.Literal("POSTED"), Type.Literal("EPHEMERAL")]),
});
export type ApProcessingSubledgerDetailDto = Type.Static<typeof ApProcessingSubledgerDetailDto>;

export const ApProcessingTaxLedgerDetailDto = StrictObject({
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
  entry_type: Type.Literal("CREDIT"),
  base_currency_amount: Type.Number(),
  status: Type.Union([Type.Literal("POSTED"), Type.Literal("EPHEMERAL")]),
});
export type ApProcessingTaxLedgerDetailDto = Type.Static<typeof ApProcessingTaxLedgerDetailDto>;

export const ApProcessingPostingResponseDto = StrictObject({
  detailed_document: Type.Record(Type.String(), Type.Unknown()),
  ap_subledger_details: Type.Array(ApProcessingSubledgerDetailDto),
  tax_ledger_details: Type.Optional(Type.Array(ApProcessingTaxLedgerDetailDto)),
  posting_details: StrictObject({
    journal_header: StrictObject({
      id: Type.Union([PositiveId, Type.Null()]),
      code: Type.Union([BusinessCode, Type.Null()]),
      document_type_code: ApProcessingDocumentType,
      document_id: Type.String(),
      generated_description: Type.String(),
      posting_engine_code: ApProcessingDocumentType,
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
    }),
    journal_lines: Type.Array(ApProcessingJournalLineDto),
  }),
});
export type ApProcessingPostingResponseDto = Type.Static<typeof ApProcessingPostingResponseDto>;
