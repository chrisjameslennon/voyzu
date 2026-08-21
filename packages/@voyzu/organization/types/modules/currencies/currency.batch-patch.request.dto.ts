import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { CurrencyPatchRequestDto } from "./currency.patch.request.dto";
import { BusinessCode } from "@voyzu/organization/types/constraints";

export const CurrencyBatchPatchRequestDto = StrictObject({
  ...CurrencyPatchRequestDto.properties,
  code: BusinessCode,
});
export type CurrencyBatchPatchRequestDto = Type.Static<typeof CurrencyBatchPatchRequestDto>;
