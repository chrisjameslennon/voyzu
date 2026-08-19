import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { PositiveId } from "./user.fields";
export const UserCompanyAccessUpdateRequestDto = StrictObject({ companyIds: Type.Array(PositiveId) });
export type UserCompanyAccessUpdateRequestDto = Type.Static<typeof UserCompanyAccessUpdateRequestDto>;
