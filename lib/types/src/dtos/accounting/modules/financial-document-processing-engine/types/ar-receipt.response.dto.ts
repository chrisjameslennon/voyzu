import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { DrCr } from "../../common/types/index";
import { BankCashJournalDetailsDto } from "./bank-cash-details.dto";
import { BusinessCode, CountryCode, CurrencyCode, IsoDate, NonBlankText, PositiveId } from "../../common/types/constraints";

export const ArReceiptCompanySnapshotDto = StrictObject({
  code: BusinessCode,
  base_currency_code: CurrencyCode,
});
export type ArReceiptCompanySnapshotDto = Type.Static<typeof ArReceiptCompanySnapshotDto>;

export const ArReceiptCounterpartySnapshotDto = StrictObject({
  code: BusinessCode,
  name: NonBlankText,
  status: Type.Union([Type.Literal("ACTIVE"), Type.Literal("INACTIVE")]),
  country_code: CountryCode,
  tax_region_or_province: Type.Union([Type.String(), Type.Null()]),
});
export type ArReceiptCounterpartySnapshotDto = Type.Static<typeof ArReceiptCounterpartySnapshotDto>;

export const ArReceiptDetailedAllocationDto = StrictObject({
  invoice_document_id: Type.String(),
  invoice_journal_code: BusinessCode,
  invoice_ar_subledger_entry_code: BusinessCode,
  invoice_ar_subledger_entry_id: PositiveId,
  invoice_open_amount_before: Type.Number(),
  requested_amount: Type.Number(),
  applied_amount: Type.Number(),
  surplus_to_unapplied_amount: Type.Number(),
  invoice_open_amount_after: Type.Number(),
});
export type ArReceiptDetailedAllocationDto = Type.Static<typeof ArReceiptDetailedAllocationDto>;

export const ArReceiptDetailedReceiptDto = StrictObject({
  company: ArReceiptCompanySnapshotDto,
  ar_counterparty: ArReceiptCounterpartySnapshotDto,
  document_id: Type.String(),
  memo: Type.Union([Type.String(), Type.Null()]),
  generated_description: Type.String(),
  payment_date: IsoDate,
  posting_date: IsoDate,
  bank_cash_account_code: BusinessCode,
  bank_cash_details: Type.Optional(Type.Union([BankCashJournalDetailsDto, Type.Null()])),
  receipt_amount: Type.Number(),
  allocations: Type.Array(ArReceiptDetailedAllocationDto),
  applied_amount: Type.Number(),
  unapplied_amount: Type.Number(),
});
export type ArReceiptDetailedReceiptDto = Type.Static<typeof ArReceiptDetailedReceiptDto>;

export const ArReceiptArSubledgerDetailDto = StrictObject({
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
  entry_type: Type.Literal("CREDIT"),
  base_currency_amount: Type.Number(),
  memo: Type.Union([Type.String(), Type.Null()]),
  status: Type.Union([Type.Literal("POSTED"), Type.Literal("EPHEMERAL")]),
});
export type ArReceiptArSubledgerDetailDto = Type.Static<typeof ArReceiptArSubledgerDetailDto>;

export const ArReceiptJournalHeaderDto = StrictObject({
  id: Type.Union([PositiveId, Type.Null()]),
  code: Type.Union([BusinessCode, Type.Null()]),
  document_type_code: Type.Literal("AR_RECEIPT"),
  document_id: Type.String(),
  generated_description: Type.String(),
  posting_engine_code: Type.Literal("AR_RECEIPT"),
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
export type ArReceiptJournalHeaderDto = Type.Static<typeof ArReceiptJournalHeaderDto>;

export const ArReceiptJournalLineDto = StrictObject({
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
export type ArReceiptJournalLineDto = Type.Static<typeof ArReceiptJournalLineDto>;

export const ArReceiptPostingDetailsDto = StrictObject({
  journal_header: ArReceiptJournalHeaderDto,
  journal_lines: Type.Array(ArReceiptJournalLineDto),
});
export type ArReceiptPostingDetailsDto = Type.Static<typeof ArReceiptPostingDetailsDto>;

export const ArReceiptPostingResponseDto = StrictObject({
  detailed_document: ArReceiptDetailedReceiptDto,
  ar_subledger_details: Type.Array(ArReceiptArSubledgerDetailDto),
  posting_details: ArReceiptPostingDetailsDto,
});
export type ArReceiptPostingResponseDto = Type.Static<typeof ArReceiptPostingResponseDto>;
