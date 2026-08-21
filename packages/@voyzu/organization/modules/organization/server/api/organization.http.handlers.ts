import type { NextRequest, NextResponse } from "next/server";

import {
  inputValidationError,
  businessRuleError,
  notFoundError,
  ok,
  parseBody,
  serverError,
} from "@voyzu/capability/http";
import type {
  EntityNotFoundErrorResponseDto,
  InputValidationErrorResponseDto,
  BusinessRuleErrorResponseDto,
  InternalServerErrorResponseDto,
} from "@voyzu/types/errors";
import type {
  OrganizationResponseDto,
  OrganizationUpdateRequestDto,
} from "@voyzu/organization/types/modules/organization";
import { BusinessRuleError } from "@voyzu/capability/errors";

import { getOrganization, updateOrganization } from "../lib/organization.service";

export async function handleGetOrganization(
  _request: NextRequest,
): Promise<
  NextResponse<
    | OrganizationResponseDto
    | EntityNotFoundErrorResponseDto
    | InternalServerErrorResponseDto
  >
> {
  try {
    const organization = await getOrganization();
    if (!organization) return notFoundError("Organization was not found");
    return ok(organization);
  } catch (err) {
    return serverError(err);
  }
}

export async function handleUpdateOrganization(
  request: NextRequest,
): Promise<
  NextResponse<
    | OrganizationResponseDto
    | BusinessRuleErrorResponseDto
    | InputValidationErrorResponseDto
    | EntityNotFoundErrorResponseDto
    | InternalServerErrorResponseDto
  >
> {
  try {
    const input = await parseBody<OrganizationUpdateRequestDto>(request);
    const organization = await updateOrganization(input);
    return ok(organization);
  } catch (err) {
    if (err instanceof BusinessRuleError) return businessRuleError(err.message);
    if (err instanceof Error) {
      if (err.message === "Organization not found") {
        return notFoundError(err.message);
      }
      if (
        err.message.includes("required")
        || err.message.includes("Code can")
        || err.message.includes("Code must")
      ) {
        return inputValidationError(err.message);
      }
    }
    return serverError(err);
  }
}
