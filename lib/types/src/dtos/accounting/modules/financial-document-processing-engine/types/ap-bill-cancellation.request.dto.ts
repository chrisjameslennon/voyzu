import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { BusinessCode, IsoDate } from "../../common/types/constraints";

export const ApBillCancellationRequestDto = StrictObject({
  document_type: Type.Optional(Type.Literal("AP_BILL_CANCELLATION")),
  company_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  ap_counterparty_code: Type.Optional(Type.Union([BusinessCode, Type.Null()])),
  document_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  memo: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  source_bill: Type.Optional(Type.Union([StrictObject({
    document_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  }), Type.Null()])),
  cancellation_date: IsoDate,
  posting_date: Type.Optional(Type.Union([IsoDate, Type.Null()])),
});
export type ApBillCancellationRequestDto = Type.Static<typeof ApBillCancellationRequestDto>;
