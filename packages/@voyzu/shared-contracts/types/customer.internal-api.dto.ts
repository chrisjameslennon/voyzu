import Type from "typebox";
import { PartySchema } from "../../business-objects/types/party.internal-api.dto";
import { CustomerAccountSchema } from "./customer-account.internal-api.dto";

export const CustomerSchema = Type.Object({
  ...PartySchema.properties,
  account: CustomerAccountSchema,
}, { additionalProperties: false });

export const CustomerGetResponseDto = Type.Union([CustomerSchema, Type.Null()]);

export const CustomerFindByCodeResponseDto = Type.Union([CustomerSchema, Type.Null()]);
