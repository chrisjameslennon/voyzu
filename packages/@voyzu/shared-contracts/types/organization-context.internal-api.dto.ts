import Type from "typebox";
import { OrganizationSchema } from "./organization.internal-api.dto";

export const OrganizationContextSchema = Type.Object({ selectedOrganization: Type.Union([OrganizationSchema, Type.Null()]) }, { additionalProperties: false });

export const OrganizationContextGetSavedOrganizationIdRequestDto = Type.Object({  }, { additionalProperties: false });

export const OrganizationContextGetSavedOrganizationIdResponseDto = Type.Object({ organization_id: Type.Union([Type.Integer({ minimum: 1 }), Type.Null()]) }, { additionalProperties: false });

export const OrganizationContextGetAvailableOrganizationsRequestDto = Type.Object({  }, { additionalProperties: false });

export const OrganizationContextGetAvailableOrganizationsResponseDto = Type.Object({ organizations: Type.Array(OrganizationSchema) }, { additionalProperties: false });

export const OrganizationContextGetActiveOrganizationRequestDto = Type.Object({  }, { additionalProperties: false });

export const OrganizationContextSetActiveOrganizationRequestDto = Type.Object({ organization_id: Type.Integer({ minimum: 1 }) }, { additionalProperties: false });

export const OrganizationContextSetActiveOrganizationResponseDto = Type.Object({ organization_id: Type.Integer({ minimum: 1 }) }, { additionalProperties: false });
