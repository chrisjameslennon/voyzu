import Type from "typebox";

export const FinanceFields = Type.Object({
  financeCompanyId: Type.Integer({ minimum: 1 }),
  taxFilingAnchorMonth: Type.Integer({ minimum: 1, maximum: 12 }),
  taxFilingIntervalMonths: Type.Union([Type.Literal(1), Type.Literal(2), Type.Literal(3), Type.Literal(6), Type.Literal(12)]),
  reportLine1: Type.Optional(Type.String({ maxLength: 80 })),
  reportLine2: Type.Optional(Type.String({ maxLength: 80 })),
  reportFooter: Type.Optional(Type.String({ maxLength: 80 })),
  hasPostings: Type.Boolean(),
}, { additionalProperties: false });

export const OrganizationFinanceSchema = Type.Object({ organization_id: Type.Integer({ minimum: 1 }), ...FinanceFields.properties }, { additionalProperties: false });

export const OrganizationFinanceGetRequestDto = Type.Object({ organization_id: Type.Integer({ minimum: 1 }) }, { additionalProperties: false });

export const OrganizationFinanceGetResponseDto = Type.Union([OrganizationFinanceSchema, Type.Null()]);

export const OrganizationFinanceCreateFinancialEntityRequestDto = Type.Object({ organization_id: Type.Integer({ minimum: 1 }) }, { additionalProperties: false });

export const OrganizationFinanceCreateFinancialEntityResponseDto = Type.Object({ financialEntityId: Type.Integer({ minimum: 1 }) }, { additionalProperties: false });

export const OrganizationFinanceChangesDto = Type.Pick(FinanceFields, ["taxFilingAnchorMonth", "taxFilingIntervalMonths", "reportLine1", "reportLine2", "reportFooter"]);
export type OrganizationFinanceChanges = Type.Static<typeof OrganizationFinanceChangesDto>;
export const OrganizationFinanceUpdateRequestDto = Type.Object({ organization_id: Type.Integer({ minimum: 1 }), changes: OrganizationFinanceChangesDto }, { additionalProperties: false });
export const OrganizationFinanceUpdateResponseDto = OrganizationFinanceSchema;
