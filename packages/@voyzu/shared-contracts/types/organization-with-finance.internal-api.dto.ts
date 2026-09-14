import Type from "typebox";
import { OrganizationSchema } from "./organization.internal-api.dto";
import { OrganizationFinanceSchema } from "./organization-finance.internal-api.dto";

export const OrganizationWithFinanceSchema = Type.Object({ ...OrganizationSchema.properties, finance: OrganizationFinanceSchema }, { additionalProperties: false });

export const OrganizationWithFinanceGetRequestDto = Type.Object({ organization_id: Type.Integer({ minimum: 1 }) }, { additionalProperties: false });

export const OrganizationWithFinanceGetResponseDto = Type.Union([OrganizationWithFinanceSchema, Type.Null()]);

export const OrganizationWithFinanceFindByCodeResponseDto = Type.Union([OrganizationWithFinanceSchema, Type.Null()]);

export const OrganizationWithFinanceFindByCodeRequestDto = Type.Object({ code: Type.String() }, { additionalProperties: false });
