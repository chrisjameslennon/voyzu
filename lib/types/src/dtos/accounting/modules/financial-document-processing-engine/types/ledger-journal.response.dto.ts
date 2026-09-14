import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { DrCr } from "../../common/types/index";
import { BankCashJournalDetailsDto } from "./bank-cash-details.dto";
import { BusinessCode, CurrencyCode, IsoDate, NonBlankText, PositiveId } from "../../common/types/constraints";

export const LedgerJournalDetailedLineDto = StrictObject({
  line_id: PositiveId,
  gl_account_code: BusinessCode,
  gl_account_name: NonBlankText,
  description: Type.String(),
  memo: Type.Union([Type.String(), Type.Null()]),
  dr_cr: DrCr,
  base_currency_amount: Type.Number(),
  dimensions: Type.Record(Type.String(), Type.String()),
});
export type LedgerJournalDetailedLineDto = Type.Static<typeof LedgerJournalDetailedLineDto>;

export const LedgerJournalDetailedDocumentDto = StrictObject({
  company: StrictObject({
    code: BusinessCode,
    base_currency_code: CurrencyCode,
  }),
  document_id: Type.String(),
  document_memo: Type.Union([Type.String(), Type.Null()]),
  bank_cash_details: Type.Optional(Type.Union([BankCashJournalDetailsDto, Type.Null()])),
  generated_description: Type.String(),
  posting_date: IsoDate,
  lines: Type.Array(LedgerJournalDetailedLineDto),
  total_debit_base_amount: Type.Number(),
  total_credit_base_amount: Type.Number(),
});
export type LedgerJournalDetailedDocumentDto = Type.Static<typeof LedgerJournalDetailedDocumentDto>;

export const LedgerJournalLineDimensionDto = StrictObject({
  dimension_code: BusinessCode,
  dimension_name: NonBlankText,
  dimension_value_name: NonBlankText,
});
export type LedgerJournalLineDimensionDto = Type.Static<typeof LedgerJournalLineDimensionDto>;

export const LedgerJournalJournalHeaderDto = StrictObject({
  id: Type.Union([PositiveId, Type.Null()]),
  code: Type.Union([BusinessCode, Type.Null()]),
  document_type_code: Type.Union([Type.Literal("LEDGER_JOURNAL"), Type.Literal("LEDGER_JOURNAL_REVERSAL")]),
  document_id: Type.String(),
  generated_description: Type.String(),
  posting_engine_code: Type.Union([Type.Literal("LEDGER_JOURNAL"), Type.Literal("LEDGER_JOURNAL_REVERSAL")]),
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
export type LedgerJournalJournalHeaderDto = Type.Static<typeof LedgerJournalJournalHeaderDto>;

export const LedgerJournalJournalLineDto = StrictObject({
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
  dimensions: Type.Optional(Type.Array(LedgerJournalLineDimensionDto)),
});
export type LedgerJournalJournalLineDto = Type.Static<typeof LedgerJournalJournalLineDto>;

export const LedgerJournalPostingDetailsDto = StrictObject({
  journal_header: LedgerJournalJournalHeaderDto,
  journal_lines: Type.Array(LedgerJournalJournalLineDto),
});
export type LedgerJournalPostingDetailsDto = Type.Static<typeof LedgerJournalPostingDetailsDto>;

export const LedgerJournalPostingResponseDto = StrictObject({
  detailed_document: LedgerJournalDetailedDocumentDto,
  posting_details: LedgerJournalPostingDetailsDto,
});
export type LedgerJournalPostingResponseDto = Type.Static<typeof LedgerJournalPostingResponseDto>;
