import Type, { type Static } from "typebox";
import { OrganizationAccessDefinition, OrganizationAccessSchema } from "@voyzu/types/business-objects/organization-access";

export const UserOrganizationAccessUpdateRequestDto = Type.Omit(
  OrganizationAccessDefinition.methods.replace.input,
  ["userCode"],
);
export type UserOrganizationAccessUpdateRequestDto = Static<typeof UserOrganizationAccessUpdateRequestDto>;

export const UserOrganizationAccessResponseDto = Type.Object({
  access: OrganizationAccessSchema,
  organizations: Type.Array(Type.Object({
    id: Type.Integer({ minimum: 1 }),
    code: Type.String(),
    name: Type.String(),
    status: Type.Union([Type.Literal("ACTIVE"), Type.Literal("INACTIVE")]),
  }, { additionalProperties: false })),
}, { additionalProperties: false });
export type UserOrganizationAccessResponseDto = Static<typeof UserOrganizationAccessResponseDto>;
