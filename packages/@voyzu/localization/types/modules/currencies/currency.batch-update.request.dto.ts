import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { CurrencyUpdateRequestDto } from "./currency.update.request.dto";
import { BusinessCode } from "@voyzu/localization/types/constraints";

export const CurrencyBatchUpdateRequestDto = StrictObject({
  ...CurrencyUpdateRequestDto.properties,
  code: BusinessCode,
});
export type CurrencyBatchUpdateRequestDto = Type.Static<typeof CurrencyBatchUpdateRequestDto>;
