import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { BankCashDetailsRequestDto } from "./bank-cash-details.dto";
import { BusinessCode, IsoDate } from "../../common/types/constraints";

export const ArRefundRequestDto = StrictObject({
  document_type: Type.Optional(Type.Literal("AR_REFUND")),
  company_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  ar_counterparty_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  document_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  memo: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  refund_date: IsoDate,
  posting_date: Type.Optional(Type.Union([IsoDate, Type.Null()])),
  refund_amount: Type.Union([Type.Number(), Type.String()]),
  bank_cash_account_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  bank_cash_details: Type.Optional(Type.Union([BankCashDetailsRequestDto, Type.Null()])),
  dimensions: Type.Optional(Type.Union([Type.Record(Type.String(), Type.String()), Type.Null()])),
});
export type ArRefundRequestDto = Type.Static<typeof ArRefundRequestDto>;
