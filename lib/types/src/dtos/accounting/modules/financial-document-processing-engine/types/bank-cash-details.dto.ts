import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { BusinessCode, NonBlankText, PositiveId } from "../../common/types/constraints";

export const BankCashDetailsRequestDto = StrictObject({
  code: BusinessCode,
  tx_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  tx_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  tx_ref: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  tx_details: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  payment_ref: Type.Optional(Type.Union([Type.String(), Type.Null()])),
});
export type BankCashDetailsRequestDto = Type.Static<typeof BankCashDetailsRequestDto>;

export const BankCashJournalDetailsDto = StrictObject({
  ...BankCashDetailsRequestDto.properties,
  id: PositiveId,
  type: Type.Union([Type.Literal("BANK"), Type.Literal("CASH"), Type.Literal("OTHER")]),
  gl_account_id: PositiveId,
  gl_account_code: BusinessCode,
  gl_account_name: NonBlankText,
  bank_name: Type.Optional(Type.Union([NonBlankText, Type.Null()])),
  bank_branch_name: Type.Optional(Type.Union([NonBlankText, Type.Null()])),
  bank_account_identifier: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  cash_account_identifier: Type.Optional(Type.Union([Type.String(), Type.Null()])),
});
export type BankCashJournalDetailsDto = Type.Static<typeof BankCashJournalDetailsDto>;
