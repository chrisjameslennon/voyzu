import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { BankCashJournalDetailsDto } from "./bank-cash-details.dto";
import {
  LedgerJournalJournalLineDto,
  LedgerJournalPostingDetailsDto,
} from "./ledger-journal.response.dto";
import { BusinessCode, CurrencyCode, IsoDate } from "../../common/types/constraints";

export const LedgerJournalReversalDetailedDocumentDto = StrictObject({
  company: StrictObject({
    code: BusinessCode,
    base_currency_code: CurrencyCode,
  }),
  document_id: Type.String(),
  document_memo: Type.Union([Type.String(), Type.Null()]),
  bank_cash_details: Type.Optional(Type.Union([BankCashJournalDetailsDto, Type.Null()])),
  generated_description: Type.String(),
  source_journal_code: BusinessCode,
  source_document_id: Type.String(),
  posting_date: IsoDate,
  lines: Type.Array(LedgerJournalJournalLineDto),
  total_debit_base_amount: Type.Number(),
  total_credit_base_amount: Type.Number(),
});
export type LedgerJournalReversalDetailedDocumentDto = Type.Static<typeof LedgerJournalReversalDetailedDocumentDto>;

export const LedgerJournalReversalPostingResponseDto = StrictObject({
  detailed_document: LedgerJournalReversalDetailedDocumentDto,
  posting_details: LedgerJournalPostingDetailsDto,
});
export type LedgerJournalReversalPostingResponseDto = Type.Static<typeof LedgerJournalReversalPostingResponseDto>;
