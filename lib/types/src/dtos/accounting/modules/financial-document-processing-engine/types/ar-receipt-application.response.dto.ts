import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { DrCr, EntryType } from "../../common/types/index";
import { BusinessCode, CurrencyCode, IsoDate, NonBlankText, PositiveId } from "../../common/types/constraints";

export const ArReceiptApplicationCompanySnapshotDto = StrictObject({
  code: BusinessCode,
  base_currency_code: CurrencyCode,
});
export type ArReceiptApplicationCompanySnapshotDto = Type.Static<typeof ArReceiptApplicationCompanySnapshotDto>;

export const ArReceiptApplicationCounterpartySnapshotDto = StrictObject({
  code: BusinessCode,
  name: NonBlankText,
});
export type ArReceiptApplicationCounterpartySnapshotDto = Type.Static<typeof ArReceiptApplicationCounterpartySnapshotDto>;

export const ArReceiptApplicationDetailedLineDto = StrictObject({
  source_receipt_document_id: Type.String(),
  source_receipt_journal_code: BusinessCode,
  source_receipt_ar_subledger_entry_code: BusinessCode,
  source_receipt_ar_subledger_entry_id: PositiveId,
  source_receipt_open_amount_before: Type.Number(),
  source_receipt_open_amount_after: Type.Number(),
  target_invoice_document_id: Type.String(),
  target_invoice_journal_code: BusinessCode,
  target_invoice_ar_subledger_entry_code: BusinessCode,
  target_invoice_ar_subledger_entry_id: PositiveId,
  target_invoice_open_amount_before: Type.Number(),
  target_invoice_open_amount_after: Type.Number(),
  amount: Type.Number(),
});
export type ArReceiptApplicationDetailedLineDto = Type.Static<typeof ArReceiptApplicationDetailedLineDto>;

export const ArReceiptApplicationDetailedDto = StrictObject({
  company: ArReceiptApplicationCompanySnapshotDto,
  ar_counterparty: ArReceiptApplicationCounterpartySnapshotDto,
  document_id: Type.String(),
  document_memo: Type.Union([Type.String(), Type.Null()]),
  generated_description: Type.String(),
  application_date: IsoDate,
  posting_date: IsoDate,
  applications: Type.Array(ArReceiptApplicationDetailedLineDto),
  total_application_amount: Type.Number(),
});
export type ArReceiptApplicationDetailedDto = Type.Static<typeof ArReceiptApplicationDetailedDto>;

export const ArReceiptApplicationArSubledgerDetailDto = StrictObject({
  id: Type.Union([PositiveId, Type.Null()]),
  code: Type.Union([BusinessCode, Type.Null()]),
  company_code: BusinessCode,
  journal_header_id: Type.Union([PositiveId, Type.Null()]),
  ar_counterparty_code: BusinessCode,
  control_account_code: Type.Union([Type.Literal("AR_TRADE_RECEIVABLES"), Type.Literal("AR_UNAPPLIED_CASH")]),
  applied_to_ar_subledger_entry_id: Type.Union([PositiveId, Type.Null()]),
  posting_date: IsoDate,
  financial_year_code: BusinessCode,
  financial_period_code: BusinessCode,
  base_currency_code: CurrencyCode,
  entry_type: EntryType,
  base_currency_amount: Type.Number(),
  document_memo: Type.Union([Type.String(), Type.Null()]),
  status: Type.Union([Type.Literal("POSTED"), Type.Literal("EPHEMERAL")]),
});
export type ArReceiptApplicationArSubledgerDetailDto = Type.Static<typeof ArReceiptApplicationArSubledgerDetailDto>;

export const ArReceiptApplicationJournalHeaderDto = StrictObject({
  id: Type.Union([PositiveId, Type.Null()]),
  code: Type.Union([BusinessCode, Type.Null()]),
  document_type_code: Type.Literal("AR_RECEIPT_APPLICATION"),
  document_id: Type.String(),
  generated_description: Type.String(),
  posting_engine_code: Type.Literal("AR_RECEIPT_APPLICATION"),
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
export type ArReceiptApplicationJournalHeaderDto = Type.Static<typeof ArReceiptApplicationJournalHeaderDto>;

export const ArReceiptApplicationJournalLineDto = StrictObject({
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
});
export type ArReceiptApplicationJournalLineDto = Type.Static<typeof ArReceiptApplicationJournalLineDto>;

export const ArReceiptApplicationPostingDetailsDto = StrictObject({
  journal_header: ArReceiptApplicationJournalHeaderDto,
  journal_lines: Type.Array(ArReceiptApplicationJournalLineDto),
});
export type ArReceiptApplicationPostingDetailsDto = Type.Static<typeof ArReceiptApplicationPostingDetailsDto>;

export const ArReceiptApplicationPostingResponseDto = StrictObject({
  detailed_document: ArReceiptApplicationDetailedDto,
  ar_subledger_details: Type.Array(ArReceiptApplicationArSubledgerDetailDto),
  posting_details: ArReceiptApplicationPostingDetailsDto,
});
export type ArReceiptApplicationPostingResponseDto = Type.Static<typeof ArReceiptApplicationPostingResponseDto>;
