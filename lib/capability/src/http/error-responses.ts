import { NextResponse } from "next/server";

import type {
  BusinessRuleErrorResponseDto,
  ConflictErrorResponseDto,
  EntityNotFoundErrorResponseDto,
  InputValidationErrorResponseDto,
  InternalServerErrorResponseDto,
  UnauthorizedErrorResponseDto,
} from "@voyzu/types/errors";

export function inputValidationError(message: string): NextResponse<InputValidationErrorResponseDto> {
  return NextResponse.json(
    {
      code: "INPUT_VALIDATION_ERROR",
      message,
    } satisfies InputValidationErrorResponseDto,
    { status: 400 },
  );
}

export function unauthorizedError(message: string): NextResponse<UnauthorizedErrorResponseDto> {
  return NextResponse.json(
    {
      code: "UNAUTHORIZED",
      message,
    } satisfies UnauthorizedErrorResponseDto,
    { status: 401 },
  );
}

export function conflictError(message: string): NextResponse<ConflictErrorResponseDto> {
  return NextResponse.json(
    {
      code: "CONFLICT",
      message,
    } satisfies ConflictErrorResponseDto,
    { status: 409 },
  );
}

export function businessRuleError(message: string): NextResponse<BusinessRuleErrorResponseDto> {
  return NextResponse.json(
    {
      code: "BUSINESS_RULE",
      message,
    } satisfies BusinessRuleErrorResponseDto,
    { status: 422 },
  );
}

export function notFoundError(message: string): NextResponse<EntityNotFoundErrorResponseDto> {
  return NextResponse.json(
    {
      code: "ENTITY_NOT_FOUND",
      message,
    } satisfies EntityNotFoundErrorResponseDto,
    { status: 404 },
  );
}

export function serverError(err: unknown): NextResponse<InternalServerErrorResponseDto> {
  const message = err instanceof Error ? err.message : "Internal server error";

  if (err instanceof Error) {
    console.error("[SERVER ERROR]", err.message, err.stack);
  } else {
    console.error("[SERVER ERROR]", err);
  }

  return NextResponse.json(
    {
      code: "INTERNAL_SERVER_ERROR",
      message,
    } satisfies InternalServerErrorResponseDto,
    { status: 500 },
  );
}
