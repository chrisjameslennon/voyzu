import Type from "typebox";
import { PartySchema } from "@voyzu/types/dtos/party";
import { CustomerAccountSchema } from "./customer-account.internal-api.dto";

export const CustomerSchema = Type.Object({
  ...PartySchema.properties,
  account: CustomerAccountSchema,
}, { additionalProperties: false });

export const CustomerGetResponseDto = Type.Union([CustomerSchema, Type.Null()]);

export const CustomerFindByCodeResponseDto = Type.Union([CustomerSchema, Type.Null()]);

export const CustomerGetRequestDto = Type.Object({ party_id: Type.Number() }, { additionalProperties: false });
export const CustomerFindByCodeRequestDto = Type.Object({ code: Type.String() }, { additionalProperties: false });
