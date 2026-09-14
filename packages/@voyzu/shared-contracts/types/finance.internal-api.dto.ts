import Type from "typebox";
import { PartySchema } from "@voyzu/types/dtos/party";
export const FinanceScopeDto = Type.Object({ organization_id: Type.Integer({ minimum: 1 }) }, { additionalProperties: false });
export const FinanceCounterpartyGetDto = Type.Object({ organization_id: Type.Integer({ minimum: 1 }), party_id: Type.Integer({ minimum: 1 }) }, { additionalProperties: false });
export const FinanceCounterpartyDto = Type.Object({
 ...PartySchema.properties,
 organization_id: Type.Integer({ minimum: 1 }),
 status: Type.Union([Type.Literal("ACTIVE"), Type.Literal("INACTIVE")]),
 country_code: Type.Union([Type.String(), Type.Null()]),
 tax_region_or_province: Type.Union([Type.String(), Type.Null()]),
}, { additionalProperties: false });
export const FinanceCounterpartyGetResponseDto = Type.Union([FinanceCounterpartyDto, Type.Null()]);
export const FinanceCounterpartyListDto = Type.Array(FinanceCounterpartyDto);
export const FinanceCounterpartyEnsureDto = Type.Object({ ...FinanceScopeDto.properties, code: Type.String({ minLength: 1 }), name: Type.String({ minLength: 1 }), country_code: Type.Optional(Type.String()), tax_region_or_province: Type.Optional(Type.String()) }, { additionalProperties: false });
export const FinanceDocumentGetDto = Type.Object({ ...FinanceScopeDto.properties, document_type: Type.String({ minLength: 1 }), code: Type.String({ minLength: 1 }) }, { additionalProperties: false });
export const FinanceDocumentDto = Type.Object({ ...FinanceDocumentGetDto.properties, document: Type.Record(Type.String(), Type.Unknown()), details: Type.Record(Type.String(), Type.Unknown()) }, { additionalProperties: false });
export const FinanceDocumentGetResponseDto = Type.Union([FinanceDocumentDto, Type.Null()]);
