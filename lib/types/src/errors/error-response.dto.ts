import Type from "typebox";
import { StrictObject } from "../api";

export const ErrorResponseBaseDto = StrictObject({ code: Type.String(), message: Type.String() });
export type ErrorResponseBaseDto = Type.Static<typeof ErrorResponseBaseDto>;

function errorResponse<Code extends string>(code: Code) {
  return StrictObject({ code: Type.Literal(code), message: Type.String() });
}

export const InputValidationErrorResponseDto = errorResponse("INPUT_VALIDATION_ERROR");
export type InputValidationErrorResponseDto = Type.Static<typeof InputValidationErrorResponseDto>;
export const EntityNotFoundErrorResponseDto = errorResponse("ENTITY_NOT_FOUND");
export type EntityNotFoundErrorResponseDto = Type.Static<typeof EntityNotFoundErrorResponseDto>;
export const UnauthorizedErrorResponseDto = errorResponse("UNAUTHORIZED");
export type UnauthorizedErrorResponseDto = Type.Static<typeof UnauthorizedErrorResponseDto>;
export const ForbiddenErrorResponseDto = errorResponse("FORBIDDEN");
export type ForbiddenErrorResponseDto = Type.Static<typeof ForbiddenErrorResponseDto>;
export const ConflictErrorResponseDto = errorResponse("CONFLICT");
export type ConflictErrorResponseDto = Type.Static<typeof ConflictErrorResponseDto>;
export const BusinessRuleErrorResponseDto = errorResponse("BUSINESS_RULE");
export type BusinessRuleErrorResponseDto = Type.Static<typeof BusinessRuleErrorResponseDto>;
export const InternalServerErrorResponseDto = errorResponse("INTERNAL_SERVER_ERROR");
export type InternalServerErrorResponseDto = Type.Static<typeof InternalServerErrorResponseDto>;
