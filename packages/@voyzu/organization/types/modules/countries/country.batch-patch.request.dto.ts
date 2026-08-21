import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { CountryPatchRequestDto } from "./country.patch.request.dto";
import { BusinessCode } from "@voyzu/organization/types/constraints";

export const CountryBatchPatchRequestDto = StrictObject({
  ...CountryPatchRequestDto.properties,
  code: BusinessCode,
});
export type CountryBatchPatchRequestDto = Type.Static<typeof CountryBatchPatchRequestDto>;
