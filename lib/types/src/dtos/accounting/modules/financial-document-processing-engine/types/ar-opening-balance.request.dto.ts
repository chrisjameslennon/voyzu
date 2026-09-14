import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { BusinessCode, CountryCode, IsoDate, NonBlankText, PositiveId } from "../../common/types/constraints";

export const ArOpeningBalanceCounterpartyInputDto = StrictObject({
  code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  name: NonBlankText,
  status: Type.Union([Type.Literal("ACTIVE"), Type.Literal("INACTIVE")]),
  country_code: CountryCode,
  state_or_province_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
});
export type ArOpeningBalanceCounterpartyInputDto = Type.Static<typeof ArOpeningBalanceCounterpartyInputDto>;

export const ArOpeningBalanceItemRequestDto = StrictObject({
  line_id: Type.Optional(Type.Union([PositiveId, Type.Null()])),
  external_reference: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  description: Type.String(),
  original_invoice_date: Type.Optional(Type.Union([IsoDate, Type.Null()])),
  due_date: Type.Optional(Type.Union([IsoDate, Type.Null()])),
  amount: Type.Union([Type.Number(), Type.String()]),
});
export type ArOpeningBalanceItemRequestDto = Type.Static<typeof ArOpeningBalanceItemRequestDto>;

export const ArOpeningBalanceRequestDto = StrictObject({
  document_type: Type.Optional(Type.Literal("AR_OPENING_BALANCE")),
  company_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  ar_counterparty_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  ar_counterparty: Type.Optional(Type.Union([ArOpeningBalanceCounterpartyInputDto, Type.Null()])),
  document_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  memo: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  opening_balance_date: IsoDate,
  posting_date: Type.Optional(Type.Union([IsoDate, Type.Null()])),
  opening_balance_equity_posting_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  items: Type.Array(ArOpeningBalanceItemRequestDto),
  dimensions: Type.Optional(Type.Union([Type.Record(Type.String(), Type.String()), Type.Null()])),
});
export type ArOpeningBalanceRequestDto = Type.Static<typeof ArOpeningBalanceRequestDto>;
