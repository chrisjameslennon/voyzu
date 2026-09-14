import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { BusinessCode, NonBlankText } from "../../common/types/constraints";

export const ApCounterpartySummaryResponseDto = StrictObject({
  counterpartyCode: BusinessCode,
  counterpartyName: NonBlankText,
  openBillsAmount: Type.Number(),
  unappliedPaymentsAmount: Type.Number(),
  netBalance: Type.Number(),
});
export type ApCounterpartySummaryResponseDto = Type.Static<typeof ApCounterpartySummaryResponseDto>;
