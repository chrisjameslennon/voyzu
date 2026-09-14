import Type from "typebox";
import { OrganizationSchema } from "./organization.internal-api.dto";

export const OrganizationContextSchema = Type.Object({
  organization_id: Type.Union([Type.Integer({ minimum: 1 }), Type.Null()]),
  organizations: Type.Array(OrganizationSchema),
  selectedOrganization: Type.Union([OrganizationSchema, Type.Null()]),
}, { additionalProperties: false });
export const OrganizationContextGetRequestDto = Type.Object({}, { additionalProperties: false });
export const OrganizationContextSetActiveOrganizationRequestDto = Type.Object({ organization_id: Type.Integer({ minimum: 1 }) }, { additionalProperties: false });

export const OrganizationContextSetActiveOrganizationResponseDto = Type.Object({ organization_id: Type.Integer({ minimum: 1 }) }, { additionalProperties: false });
