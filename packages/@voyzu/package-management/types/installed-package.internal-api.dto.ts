import Type from "typebox";
import { InstalledPackageResponseDto } from "./index";

export const InstalledPackageGetRequestDto = Type.Object({ id: Type.Integer({ minimum: 1 }) }, { additionalProperties: false });
export const InstalledPackageGetResponseDto = Type.Union([InstalledPackageResponseDto, Type.Null()]);
