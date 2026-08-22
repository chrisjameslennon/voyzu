import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { CountryUpdateRequestDto } from "./country.update.request.dto";
import { BusinessCode } from "@voyzu/localization/types/constraints";

export const CountryBatchUpdateRequestDto = StrictObject({
  ...CountryUpdateRequestDto.properties,
  code: BusinessCode,
});
export type CountryBatchUpdateRequestDto = Type.Static<typeof CountryBatchUpdateRequestDto>;
