import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { DrCr } from "../../common/types/index";
import { BankCashDetailsRequestDto } from "./bank-cash-details.dto";
import { BusinessCode, IsoDate, PositiveId } from "../../common/types/constraints";

export const LedgerJournalLineRequestDto = StrictObject({
  line_id: PositiveId,
  gl_account_code: BusinessCode,
  description: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  memo: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  dr_cr: DrCr,
  base_currency_amount: Type.Union([Type.Number(), Type.String()]),
  dimensions: Type.Optional(Type.Union([Type.Record(Type.String(), Type.String()), Type.Null()])),
});
export type LedgerJournalLineRequestDto = Type.Static<typeof LedgerJournalLineRequestDto>;

export const LedgerJournalRequestDto = StrictObject({
  document_type: Type.Optional(Type.Literal("LEDGER_JOURNAL")),
  company_code: BusinessCode,
  document_id: Type.Optional(Type.String()),
  document_memo: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  bank_cash_details: Type.Optional(Type.Union([BankCashDetailsRequestDto, Type.Null()])),
  posting_date: IsoDate,
  lines: Type.Array(LedgerJournalLineRequestDto),
});
export type LedgerJournalRequestDto = Type.Static<typeof LedgerJournalRequestDto>;
