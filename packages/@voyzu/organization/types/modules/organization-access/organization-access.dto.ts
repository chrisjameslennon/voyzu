import Type from "typebox";

import { StrictObject } from "@voyzu/types/api";

const PositiveId = Type.Integer({ minimum: 1 });

export const OrganizationAccessOrganizationDto = StrictObject({
  id: PositiveId,
  code: Type.String(),
  name: Type.String(),
  status: Type.Union([Type.Literal("ACTIVE"), Type.Literal("INACTIVE")]),
});
export type OrganizationAccessOrganizationDto = Type.Static<typeof OrganizationAccessOrganizationDto>;

export const OrganizationAccessUserDto = StrictObject({
  userId: PositiveId,
  userCode: Type.String(),
  displayName: Type.String(),
  userRole: Type.Union([Type.Literal("ADMIN"), Type.Literal("STANDARD")]),
  userStatus: Type.Union([Type.Literal("ACTIVE"), Type.Literal("INACTIVE")]),
  organizationIds: Type.Array(PositiveId),
});
export type OrganizationAccessUserDto = Type.Static<typeof OrganizationAccessUserDto>;

export const OrganizationAccessPageDto = StrictObject({
  users: Type.Array(OrganizationAccessUserDto),
  organizations: Type.Array(OrganizationAccessOrganizationDto),
});
export type OrganizationAccessPageDto = Type.Static<typeof OrganizationAccessPageDto>;

export const OrganizationAccessUpdateRequestDto = StrictObject({
  organizationIds: Type.Array(PositiveId),
});
export type OrganizationAccessUpdateRequestDto = Type.Static<typeof OrganizationAccessUpdateRequestDto>;
