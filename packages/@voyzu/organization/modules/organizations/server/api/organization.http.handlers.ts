import { type NextRequest, NextResponse } from "next/server";

import type { CodesRequestDto, FilterRequestDto } from "@voyzu/types/params";
import type {
  BusinessRuleErrorResponseDto,
  ConflictErrorResponseDto,
  EntityNotFoundErrorResponseDto,
  InternalServerErrorResponseDto,
  InputValidationErrorResponseDto,
} from "@voyzu/types/errors";
import type { OrganizationResponseDto } from "@voyzu/organization/types/modules/organizations";
import type { OrganizationCreateRequestDto } from "@voyzu/organization/types/modules/organizations";
import type { OrganizationUpdateRequestDto } from "@voyzu/organization/types/modules/organizations";
import type { OrganizationPatchRequestDto } from "@voyzu/organization/types/modules/organizations";
import type { OrganizationBatchUpdateRequestDto } from "@voyzu/organization/types/modules/organizations";
import type { OrganizationBatchPatchRequestDto } from "@voyzu/organization/types/modules/organizations";
import {
  SELECTED_ORGANIZATION_COOKIE,
  parseSelectedOrganizationId,
} from "@voyzu/organization/organization-switcher/server";

import { businessRuleError, conflictError, notFoundError, serverError, inputValidationError } from "@voyzu/capability/http";
import { BusinessRuleError, ConflictError, NotFoundError, InputValidationError } from "@voyzu/capability/errors";
import { created, noContent, ok } from "@voyzu/capability/http";
import { parseBody } from "@voyzu/capability/http";

import {
  listOrganizations,
  filterOrganizations,
  searchOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  patchOrganization,
  deleteOrganization,
  batchCreateOrganizations,
  batchGetOrganizations,
  batchUpdateOrganizations,
  batchPatchOrganizations,
  batchDeleteOrganizations,
  activateOrganizations,
  activateOrganization,
  deactivateOrganizations,
  deactivateOrganization,
} from "../lib/organization.service";

function clearSelectedOrganizationCookieIfDeleted(
  request: NextRequest,
  response: NextResponse,
  deletedOrganizations: OrganizationResponseDto[],
): void {
  const selectedOrganizationId = parseSelectedOrganizationId(
    request.cookies.get(SELECTED_ORGANIZATION_COOKIE)?.value,
  );
  if (!selectedOrganizationId || !deletedOrganizations.some((organization) => organization.id === selectedOrganizationId)) return;

  response.cookies.set(SELECTED_ORGANIZATION_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
  });
}




export async function handleList(
  _req: NextRequest,
): Promise<NextResponse<OrganizationResponseDto[] | InternalServerErrorResponseDto>> {
  try {
    const organizations = await listOrganizations();
    return ok(organizations satisfies OrganizationResponseDto[]);
  } catch (err) {
    return serverError(err);
  }
}


export async function handleFilter(
  req: NextRequest,
): Promise<NextResponse<OrganizationResponseDto[] | InternalServerErrorResponseDto>> {
  try {
    const { filters, options } = await parseBody<FilterRequestDto>(req);
    const organizations = await filterOrganizations(filters ?? [], options);
    return ok(organizations satisfies OrganizationResponseDto[]);
  } catch (err) {
    return serverError(err);
  }
}



export async function handleSearch(
  req: NextRequest,
): Promise<
  NextResponse<OrganizationResponseDto[] | InputValidationErrorResponseDto | InternalServerErrorResponseDto>
> {
  try {
    const q = req.nextUrl.searchParams.get("q");
    if (!q) {
      return inputValidationError("Query parameter 'q' is required");
    }

    const organizations = await searchOrganizations(q);
    return ok(organizations satisfies OrganizationResponseDto[]);
  } catch (err) {
    return serverError(err);
  }
}



export async function handleGet(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
): Promise<
  NextResponse<
    | OrganizationResponseDto
    | EntityNotFoundErrorResponseDto
    | InternalServerErrorResponseDto
  >
> {
  try {
    const { code } = await params;
    const organization = await getOrganization(code);
    if (!organization) {
      return notFoundError(`Organization code ${code} was not found`);
    }
    return ok(organization satisfies OrganizationResponseDto);
  } catch (err) {
    return serverError(err);
  }
}


export async function handleCreate(
  req: NextRequest,
): Promise<NextResponse<OrganizationResponseDto | InputValidationErrorResponseDto | ConflictErrorResponseDto | InternalServerErrorResponseDto>> {
  try {
    const body = await parseBody<OrganizationCreateRequestDto>(req);
    const organization = await createOrganization(body);
    return created(organization satisfies OrganizationResponseDto);
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof BusinessRuleError) return businessRuleError(err.message) as never;
    if (err instanceof ConflictError) return conflictError(err.message);
    return serverError(err);
  }
}


export async function handleUpdate(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
): Promise<
  NextResponse<
    | OrganizationResponseDto
    | InputValidationErrorResponseDto
    | EntityNotFoundErrorResponseDto
    | ConflictErrorResponseDto
    | InternalServerErrorResponseDto
  >
> {
  try {
    const { code } = await params;
    const body = await parseBody<OrganizationUpdateRequestDto>(req);
    const organization = await updateOrganization(code, body);
    return ok(organization satisfies OrganizationResponseDto);
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof BusinessRuleError) return businessRuleError(err.message) as never;
    if (err instanceof NotFoundError) return notFoundError(err.message);
    if (err instanceof ConflictError) return conflictError(err.message);
    return serverError(err);
  }
}


export async function handlePatch(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
): Promise<
  NextResponse<
    | OrganizationResponseDto
    | InputValidationErrorResponseDto
    | EntityNotFoundErrorResponseDto
    | ConflictErrorResponseDto
    | InternalServerErrorResponseDto
  >
> {
  try {
    const { code } = await params;
    const body = await parseBody<OrganizationPatchRequestDto>(req);
    const organization = await patchOrganization(code, body);
    return ok(organization satisfies OrganizationResponseDto);
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof BusinessRuleError) return businessRuleError(err.message) as never;
    if (err instanceof NotFoundError) return notFoundError(err.message);
    if (err instanceof ConflictError) return conflictError(err.message);
    return serverError(err);
  }
}


export async function handleDelete(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
): Promise<
  NextResponse<
    | null
    | BusinessRuleErrorResponseDto
    | EntityNotFoundErrorResponseDto
    | InternalServerErrorResponseDto
  >
> {
  try {
    const { code } = await params;
    const organization = await getOrganization(code);
    await deleteOrganization(code);
    const response = noContent();
    if (organization) clearSelectedOrganizationCookieIfDeleted(req, response, [organization]);
    return response;
  } catch (err) {
    if (err instanceof BusinessRuleError) return businessRuleError(err.message) as never;
    if (err instanceof NotFoundError) return notFoundError(err.message);
    return serverError(err);
  }
}






export async function handleBatchCreate(
  req: NextRequest,
): Promise<
  NextResponse<OrganizationResponseDto[] | InputValidationErrorResponseDto | ConflictErrorResponseDto | InternalServerErrorResponseDto>
> {
  try {
    const body = await parseBody<OrganizationCreateRequestDto[]>(req);
    const organizations = await batchCreateOrganizations(body);
    return created(organizations satisfies OrganizationResponseDto[]);
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof BusinessRuleError) return businessRuleError(err.message) as never;
    if (err instanceof ConflictError) return conflictError(err.message);
    return serverError(err);
  }
}


export async function handleBatchGet(
  req: NextRequest,
): Promise<
  NextResponse<OrganizationResponseDto[] | InputValidationErrorResponseDto | InternalServerErrorResponseDto>
> {
  try {
    const { codes } = await parseBody<CodesRequestDto>(req);
    const organizations = await batchGetOrganizations(codes);
    return ok(organizations satisfies OrganizationResponseDto[]);
  } catch (err) {
    return serverError(err);
  }
}


export async function handleBatchUpdate(
  req: NextRequest,
): Promise<
  NextResponse<OrganizationResponseDto[] | InputValidationErrorResponseDto | EntityNotFoundErrorResponseDto | ConflictErrorResponseDto | InternalServerErrorResponseDto>
> {
  try {
    const body = await parseBody<OrganizationBatchUpdateRequestDto[]>(req);
    const organizations = await batchUpdateOrganizations(body);
    return ok(organizations satisfies OrganizationResponseDto[]);
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof BusinessRuleError) return businessRuleError(err.message) as never;
    if (err instanceof NotFoundError) return notFoundError(err.message);
    if (err instanceof ConflictError) return conflictError(err.message);
    return serverError(err);
  }
}


export async function handleBatchPatch(
  req: NextRequest,
): Promise<
  NextResponse<OrganizationResponseDto[] | InputValidationErrorResponseDto | EntityNotFoundErrorResponseDto | ConflictErrorResponseDto | InternalServerErrorResponseDto>
> {
  try {
    const body = await parseBody<OrganizationBatchPatchRequestDto[]>(req);
    for (const item of body) {
      if (!item.code) {
        return inputValidationError("Each item must include a 'code' field");
      }
    }

    const organizations = await batchPatchOrganizations(body);
    return ok(organizations satisfies OrganizationResponseDto[]);
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof BusinessRuleError) return businessRuleError(err.message) as never;
    if (err instanceof NotFoundError) return notFoundError(err.message);
    if (err instanceof ConflictError) return conflictError(err.message);
    return serverError(err);
  }
}


export async function handleBatchDelete(
  req: NextRequest,
): Promise<
  NextResponse<null | InputValidationErrorResponseDto | BusinessRuleErrorResponseDto | EntityNotFoundErrorResponseDto | InternalServerErrorResponseDto>
> {
  try {
    const { codes } = await parseBody<CodesRequestDto>(req);
    const organizations = await batchGetOrganizations(codes);
    await batchDeleteOrganizations(codes);
    const response = noContent();
    clearSelectedOrganizationCookieIfDeleted(req, response, organizations);
    return response;
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof BusinessRuleError) return businessRuleError(err.message) as never;
    if (err instanceof NotFoundError) return notFoundError(err.message);
    return serverError(err);
  }
}

export async function handleBatchActivate(
  req: NextRequest,
): Promise<NextResponse<OrganizationResponseDto[] | InputValidationErrorResponseDto | EntityNotFoundErrorResponseDto | InternalServerErrorResponseDto>> {
  try {
    const { codes } = await parseBody<CodesRequestDto>(req);
    const organizations = await activateOrganizations(codes);
    return ok(organizations satisfies OrganizationResponseDto[]);
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof NotFoundError) return notFoundError(err.message);
    return serverError(err);
  }
}

export async function handleBatchDeactivate(
  req: NextRequest,
): Promise<NextResponse<OrganizationResponseDto[] | InputValidationErrorResponseDto | EntityNotFoundErrorResponseDto | InternalServerErrorResponseDto>> {
  try {
    const { codes } = await parseBody<CodesRequestDto>(req);
    const organizations = await deactivateOrganizations(codes);
    return ok(organizations satisfies OrganizationResponseDto[]);
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof NotFoundError) return notFoundError(err.message);
    return serverError(err);
  }
}

export async function handleActivate(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
): Promise<NextResponse<OrganizationResponseDto | InputValidationErrorResponseDto | EntityNotFoundErrorResponseDto | InternalServerErrorResponseDto>> {
  try {
    const { code } = await params;
    const organization = await activateOrganization(code);
    return ok(organization satisfies OrganizationResponseDto);
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof NotFoundError) return notFoundError(err.message);
    return serverError(err);
  }
}

export async function handleDeactivate(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
): Promise<NextResponse<OrganizationResponseDto | InputValidationErrorResponseDto | BusinessRuleErrorResponseDto | EntityNotFoundErrorResponseDto | InternalServerErrorResponseDto>> {
  try {
    const { code } = await params;
    const organization = await deactivateOrganization(code);
    return ok(organization satisfies OrganizationResponseDto);
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof BusinessRuleError) return businessRuleError(err.message) as never;
    if (err instanceof NotFoundError) return notFoundError(err.message);
    return serverError(err);
  }
}
