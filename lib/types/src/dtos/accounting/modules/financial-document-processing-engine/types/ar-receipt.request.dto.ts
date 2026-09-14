import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { BankCashDetailsRequestDto } from "./bank-cash-details.dto";
import { BusinessCode, CountryCode, IsoDate, NonBlankText } from "../../common/types/constraints";

export const ArReceiptCounterpartyInputDto = StrictObject({
  code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  name: NonBlankText,
  status: Type.Union([Type.Literal("ACTIVE"), Type.Literal("INACTIVE")]),
  country_code: CountryCode,
  state_or_province_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
});
export type ArReceiptCounterpartyInputDto = Type.Static<typeof ArReceiptCounterpartyInputDto>;

export const ArReceiptAllocationRequestDto = StrictObject({
  document_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  amount: Type.Number(),
});
export type ArReceiptAllocationRequestDto = Type.Static<typeof ArReceiptAllocationRequestDto>;

export const ArReceiptRequestDto = StrictObject({
  document_type: Type.Optional(Type.Literal("AR_RECEIPT")),
  company_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  ar_counterparty_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  ar_counterparty: Type.Optional(Type.Union([ArReceiptCounterpartyInputDto, Type.Null()])),
  document_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  memo: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  payment_date: IsoDate,
  posting_date: Type.Optional(Type.Union([IsoDate, Type.Null()])),
  receipt_amount: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
  bank_cash_account_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  bank_cash_details: Type.Optional(Type.Union([BankCashDetailsRequestDto, Type.Null()])),
  allocations: Type.Optional(Type.Union([Type.Array(ArReceiptAllocationRequestDto), Type.Null()])),
});
export type ArReceiptRequestDto = Type.Static<typeof ArReceiptRequestDto>;
