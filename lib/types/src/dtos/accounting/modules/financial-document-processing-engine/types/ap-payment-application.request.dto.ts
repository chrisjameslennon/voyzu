import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { BusinessCode, IsoDate } from "../../common/types/constraints";

export const ApPaymentApplicationRequestDto = StrictObject({
  document_type: Type.Optional(Type.Literal("AP_PAYMENT_APPLICATION")),
  company_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  ap_counterparty_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  document_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  memo: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  application_date: IsoDate,
  posting_date: Type.Optional(Type.Union([IsoDate, Type.Null()])),
  applications: Type.Array(StrictObject({
    source_payment: Type.Optional(Type.Union([StrictObject({
      document_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    }), Type.Null()])),
    target_bill: Type.Optional(Type.Union([StrictObject({
      document_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    }), Type.Null()])),
    amount: Type.Union([Type.Number(), Type.String()]),
  })),
});
export type ApPaymentApplicationRequestDto = Type.Static<typeof ApPaymentApplicationRequestDto>;
