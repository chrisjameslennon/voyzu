import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { DrCr, EntryType } from "../../common/types/index";
import { ArInvoiceDetailedTaxComponentDto } from "./ar-invoice.response.dto";
import { BankCashJournalDetailsDto } from "./bank-cash-details.dto";
import { BusinessCode, CountryCode, CurrencyCode, IsoDate, NonBlankText, PositiveId } from "../../common/types/constraints";

export const ArAdjustmentDocumentType = Type.Union([Type.Literal("AR_CREDIT_NOTE"), Type.Literal("AR_OPENING_BALANCE"), Type.Literal("AR_REFUND"), Type.Literal("AR_WRITE_OFF")]);
export type ArAdjustmentDocumentType = Type.Static<typeof ArAdjustmentDocumentType>;

export const ArAdjustmentCompanySnapshotDto = StrictObject({
  code: BusinessCode,
  base_currency_code: CurrencyCode,
});
export type ArAdjustmentCompanySnapshotDto = Type.Static<typeof ArAdjustmentCompanySnapshotDto>;

export const ArAdjustmentCounterpartySnapshotDto = StrictObject({
  code: BusinessCode,
  name: NonBlankText,
  status: Type.Optional(Type.Union([Type.Literal("ACTIVE"), Type.Literal("INACTIVE")])),
  country_code: Type.Optional(CountryCode),
  tax_region_or_province: Type.Optional(Type.Union([Type.String(), Type.Null()])),
});
export type ArAdjustmentCounterpartySnapshotDto = Type.Static<typeof ArAdjustmentCounterpartySnapshotDto>;

export const ArCreditNoteDetailedLineDto = StrictObject({
  line_id: PositiveId,
  line_description: Type.String(),
  quantity: Type.Union([Type.Number(), Type.Null()]),
  net_unit_price: Type.Union([Type.Number(), Type.Null()]),
  revenue_posting_code: BusinessCode,
  tax_rule: Type.String(),
  raw_net_line_total: Type.Number(),
  net_line_total: Type.Number(),
  tax_components: Type.Array(ArInvoiceDetailedTaxComponentDto),
  tax_amount: Type.Number(),
  gross_line_total: Type.Number(),
  dimensions: Type.Record(Type.String(), Type.String()),
});
export type ArCreditNoteDetailedLineDto = Type.Static<typeof ArCreditNoteDetailedLineDto>;

export const ArCreditNoteDetailedAllocationDto = StrictObject({
  invoice_document_id: Type.String(),
  invoice_journal_code: BusinessCode,
  invoice_ar_subledger_entry_code: BusinessCode,
  invoice_ar_subledger_entry_id: PositiveId,
  invoice_open_amount_before: Type.Number(),
  requested_amount: Type.Number(),
  applied_amount: Type.Number(),
  invoice_open_amount_after: Type.Number(),
});
export type ArCreditNoteDetailedAllocationDto = Type.Static<typeof ArCreditNoteDetailedAllocationDto>;

export const ArOpeningBalanceDetailedItemDto = StrictObject({
  line_id: PositiveId,
  external_reference: Type.Union([Type.String(), Type.Null()]),
  description: Type.String(),
  original_invoice_date: Type.Union([IsoDate, Type.Null()]),
  due_date: Type.Union([IsoDate, Type.Null()]),
  amount: Type.Number(),
});
export type ArOpeningBalanceDetailedItemDto = Type.Static<typeof ArOpeningBalanceDetailedItemDto>;

export const ArWriteOffDetailedApplicationDto = StrictObject({
  target_invoice_document_id: Type.String(),
  target_invoice_journal_code: BusinessCode,
  target_invoice_ar_subledger_entry_code: BusinessCode,
  target_invoice_ar_subledger_entry_id: PositiveId,
  target_invoice_open_amount_before: Type.Number(),
  target_invoice_open_amount_after: Type.Number(),
  amount: Type.Number(),
});
export type ArWriteOffDetailedApplicationDto = Type.Static<typeof ArWriteOffDetailedApplicationDto>;

export const ArAdjustmentDetailedDocumentDto = Type.Union([StrictObject({
  document_type: Type.Literal("AR_CREDIT_NOTE"),
  company: ArAdjustmentCompanySnapshotDto,
  ar_counterparty: ArAdjustmentCounterpartySnapshotDto,
  document_id: Type.String(),
  memo: Type.Union([Type.String(), Type.Null()]),
  generated_description: Type.String(),
  credit_note_date: IsoDate,
  posting_date: IsoDate,
  lines: Type.Array(ArCreditNoteDetailedLineDto),
  allocations: Type.Array(ArCreditNoteDetailedAllocationDto),
  net_amount: Type.Number(),
  tax_amount: Type.Number(),
  gross_amount: Type.Number(),
  applied_amount: Type.Number(),
  unapplied_amount: Type.Number(),
}), StrictObject({
  document_type: Type.Literal("AR_OPENING_BALANCE"),
  company: ArAdjustmentCompanySnapshotDto,
  ar_counterparty: ArAdjustmentCounterpartySnapshotDto,
  document_id: Type.String(),
  memo: Type.Union([Type.String(), Type.Null()]),
  generated_description: Type.String(),
  opening_balance_date: IsoDate,
  posting_date: IsoDate,
  opening_balance_equity_posting_code: BusinessCode,
  items: Type.Array(ArOpeningBalanceDetailedItemDto),
  total_amount: Type.Number(),
}), StrictObject({
  document_type: Type.Literal("AR_REFUND"),
  company: ArAdjustmentCompanySnapshotDto,
  ar_counterparty: ArAdjustmentCounterpartySnapshotDto,
  document_id: Type.String(),
  memo: Type.Union([Type.String(), Type.Null()]),
  generated_description: Type.String(),
  refund_date: IsoDate,
  posting_date: IsoDate,
  bank_cash_account_code: BusinessCode,
  bank_cash_details: Type.Optional(Type.Union([BankCashJournalDetailsDto, Type.Null()])),
  refund_amount: Type.Number(),
  unapplied_balance_before: Type.Number(),
  unapplied_balance_after: Type.Number(),
}), StrictObject({
  document_type: Type.Literal("AR_WRITE_OFF"),
  company: ArAdjustmentCompanySnapshotDto,
  ar_counterparty: ArAdjustmentCounterpartySnapshotDto,
  document_id: Type.String(),
  memo: Type.Union([Type.String(), Type.Null()]),
  generated_description: Type.String(),
  write_off_date: IsoDate,
  posting_date: IsoDate,
  write_off_expense_posting_code: BusinessCode,
  applications: Type.Array(ArWriteOffDetailedApplicationDto),
  total_write_off_amount: Type.Number(),
})]);
export type ArAdjustmentDetailedDocumentDto = Type.Static<typeof ArAdjustmentDetailedDocumentDto>;

export const ArAdjustmentArSubledgerDetailDto = StrictObject({
  id: Type.Union([PositiveId, Type.Null()]),
  code: Type.Union([BusinessCode, Type.Null()]),
  company_code: BusinessCode,
  journal_header_id: Type.Union([PositiveId, Type.Null()]),
  ar_counterparty_code: BusinessCode,
  control_account_code: Type.Union([Type.Literal("AR_TRADE_RECEIVABLES"), Type.Literal("AR_UNAPPLIED_CASH")]),
  source_entry_header_id: Type.Optional(Type.Union([PositiveId, Type.Null()])),
  applied_to_ar_subledger_entry_id: Type.Optional(Type.Union([PositiveId, Type.Null()])),
  posting_date: IsoDate,
  financial_year_code: BusinessCode,
  financial_period_code: BusinessCode,
  base_currency_code: CurrencyCode,
  entry_type: EntryType,
  base_currency_amount: Type.Number(),
  memo: Type.Union([Type.String(), Type.Null()]),
  status: Type.Union([Type.Literal("POSTED"), Type.Literal("EPHEMERAL")]),
});
export type ArAdjustmentArSubledgerDetailDto = Type.Static<typeof ArAdjustmentArSubledgerDetailDto>;

export const ArAdjustmentTaxLedgerDetailDto = StrictObject({
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
export type ArAdjustmentTaxLedgerDetailDto = Type.Static<typeof ArAdjustmentTaxLedgerDetailDto>;

export const ArAdjustmentJournalHeaderDto = StrictObject({
  id: Type.Union([PositiveId, Type.Null()]),
  code: Type.Union([BusinessCode, Type.Null()]),
  document_type_code: ArAdjustmentDocumentType,
  document_id: Type.String(),
  generated_description: Type.String(),
  posting_engine_code: ArAdjustmentDocumentType,
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
export type ArAdjustmentJournalHeaderDto = Type.Static<typeof ArAdjustmentJournalHeaderDto>;

export const ArAdjustmentJournalLineDto = StrictObject({
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
  dimensions: Type.Optional(Type.Array(StrictObject({
    dimension_code: BusinessCode,
    dimension_name: NonBlankText,
    dimension_value_name: NonBlankText,
  }))),
});
export type ArAdjustmentJournalLineDto = Type.Static<typeof ArAdjustmentJournalLineDto>;

export const ArAdjustmentPostingResponseDto = StrictObject({
  detailed_document: ArAdjustmentDetailedDocumentDto,
  ar_subledger_details: Type.Array(ArAdjustmentArSubledgerDetailDto),
  tax_ledger_details: Type.Optional(Type.Array(ArAdjustmentTaxLedgerDetailDto)),
  posting_details: StrictObject({
    journal_header: ArAdjustmentJournalHeaderDto,
    journal_lines: Type.Array(ArAdjustmentJournalLineDto),
  }),
});
export type ArAdjustmentPostingResponseDto = Type.Static<typeof ArAdjustmentPostingResponseDto>;
