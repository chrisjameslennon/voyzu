import Type from "typebox";
import { StrictObject } from "./api";
import { ActorType, AuditUserDto } from "./modules/core";

/** Platform identity/access boundary; Auth owns the implementation. */
export const UserRole = Type.Union([Type.Literal("ADMIN"), Type.Literal("STANDARD")]);
export const UserAccessMode = Type.Union([Type.Literal("UI"), Type.Literal("API"), Type.Literal("UI_AND_API")]);
export const UserStatus = Type.Union([Type.Literal("ACTIVE"), Type.Literal("INACTIVE")]);
export const CurrentIdentityUser = StrictObject({
  ...AuditUserDto.properties,
  role: UserRole,
  status: UserStatus,
  accessMode: UserAccessMode,
});
export type CurrentIdentityUser = Type.Static<typeof CurrentIdentityUser>;

export const CurrentIdentity = StrictObject({
  user: Type.Union([CurrentIdentityUser, Type.Null()]),
  actorType: ActorType,
  permissions: Type.Array(Type.String()),
});
export type CurrentIdentity = Type.Static<typeof CurrentIdentity>;
