import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { BankCashDetailsRequestDto } from "./bank-cash-details.dto";
import { ApBillCounterpartyInputDto } from "./ap-bill.request.dto";
import { BusinessCode, IsoDate } from "../../common/types/constraints";

export const ApPaymentAllocationRequestDto = StrictObject({
  document_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  amount: Type.Union([Type.Number(), Type.String()]),
});
export type ApPaymentAllocationRequestDto = Type.Static<typeof ApPaymentAllocationRequestDto>;

export const ApPaymentRequestDto = StrictObject({
  document_type: Type.Optional(Type.Literal("AP_PAYMENT")),
  company_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  ap_counterparty_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  ap_counterparty: Type.Optional(Type.Union([ApBillCounterpartyInputDto, Type.Null()])),
  document_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  memo: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  payment_date: IsoDate,
  posting_date: Type.Optional(Type.Union([IsoDate, Type.Null()])),
  payment_amount: Type.Optional(Type.Union([Type.Number(), Type.String(), Type.Null()])),
  bank_cash_account_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  bank_cash_details: Type.Optional(Type.Union([BankCashDetailsRequestDto, Type.Null()])),
  allocations: Type.Optional(Type.Union([Type.Array(ApPaymentAllocationRequestDto), Type.Null()])),
});
export type ApPaymentRequestDto = Type.Static<typeof ApPaymentRequestDto>;
