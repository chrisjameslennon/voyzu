import Type from "typebox";
import { OrganizationResponseDto } from "./organization.response.dto";

export const Fields = Type.Object({
  ...Type.Pick(OrganizationResponseDto, ["code", "name", "countryCode", "baseCurrencyCode"]).properties,
  code: Type.String({ pattern: "^[A-Z0-9][A-Z0-9_-]{0,13}$" }),
}, { additionalProperties: false });

export const OrganizationSchema = Type.Object({
  ...Type.Omit(OrganizationResponseDto, ["id"]).properties,
  ...Fields.properties,
  organization_id: OrganizationResponseDto.properties.id,
  // Keep the internal API's existing reference-label validation.
  country: Type.Optional(Type.Object({ code: Type.String(), name: Type.String() }, { additionalProperties: false })),
  baseCurrency: Type.Optional(Type.Object({ code: Type.String(), name: Type.String() }, { additionalProperties: false })),
}, { additionalProperties: false });

export const OrganizationGetRequestDto = Type.Union([Type.Object({ organization_id: Type.Integer({ minimum: 1 }) }, { additionalProperties: false }), Type.Object({ code: Type.String() }, { additionalProperties: false })]);

export const OrganizationGetResponseDto = Type.Union([OrganizationSchema, Type.Null()]);

export const OrganizationUpdateRequestDto = Type.Object({ organization_id: Type.Integer({ minimum: 1 }), changes: Type.Partial(Fields) }, { additionalProperties: false });

export const OrganizationActivateRequestDto = Type.Object({ organization_id: Type.Integer({ minimum: 1 }) }, { additionalProperties: false });

export const OrganizationDeactivateRequestDto = Type.Object({ organization_id: Type.Integer({ minimum: 1 }) }, { additionalProperties: false });

export const OrganizationDeleteRequestDto = Type.Object({ organization_id: Type.Integer({ minimum: 1 }) }, { additionalProperties: false });

export const OrganizationDeleteResponseDto = Type.Undefined();
