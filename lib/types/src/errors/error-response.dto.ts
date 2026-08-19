export interface ErrorResponseBaseDto {
  code: string;
  message: string;
}

export interface InputValidationErrorResponseDto extends ErrorResponseBaseDto {
  code: "INPUT_VALIDATION_ERROR";
}

export interface EntityNotFoundErrorResponseDto extends ErrorResponseBaseDto {
  code: "ENTITY_NOT_FOUND";
}

export interface UnauthorizedErrorResponseDto extends ErrorResponseBaseDto {
  code: "UNAUTHORIZED";
}

export interface ForbiddenErrorResponseDto extends ErrorResponseBaseDto {
  code: "FORBIDDEN";
}

export interface ConflictErrorResponseDto extends ErrorResponseBaseDto {
  code: "CONFLICT";
}

export interface BusinessRuleErrorResponseDto extends ErrorResponseBaseDto {
  code: "BUSINESS_RULE";
}

export interface InternalServerErrorResponseDto extends ErrorResponseBaseDto {
  code: "INTERNAL_SERVER_ERROR";
}
