import Type from "typebox";

export const OrganizationAccessSchema = Type.Object({ userId: Type.Integer({ minimum: 1 }), organization_ids: Type.Array(Type.Integer({ minimum: 1 })) }, { additionalProperties: false });

export const OrganizationAccessGetRequestDto = Type.Object({ userId: Type.Integer({ minimum: 1 }) }, { additionalProperties: false });

export const OrganizationAccessReplaceRequestDto = Type.Object({ userCode: Type.String(), organization_ids: Type.Array(Type.Integer({ minimum: 1 })) }, { additionalProperties: false });
