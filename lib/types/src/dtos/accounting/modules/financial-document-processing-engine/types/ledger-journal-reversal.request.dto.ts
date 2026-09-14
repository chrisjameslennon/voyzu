import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { BankCashDetailsRequestDto } from "./bank-cash-details.dto";
import { BusinessCode, IsoDate } from "../../common/types/constraints";

export const LedgerJournalReversalRequestDto = StrictObject({
  document_type: Type.Optional(Type.Literal("LEDGER_JOURNAL_REVERSAL")),
  company_code: BusinessCode,
  document_id: Type.Optional(Type.String()),
  document_memo: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  bank_cash_details: Type.Optional(Type.Union([BankCashDetailsRequestDto, Type.Null()])),
  source_journal_code: BusinessCode,
  posting_date: Type.Optional(IsoDate),
});
export type LedgerJournalReversalRequestDto = Type.Static<typeof LedgerJournalReversalRequestDto>;
