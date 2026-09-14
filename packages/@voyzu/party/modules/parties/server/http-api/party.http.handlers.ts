import { type NextRequest, NextResponse } from "next/server";

import type { CodesRequestDto, FilterRequestDto } from "@voyzu/types/params";
import type {
  BusinessRuleErrorResponseDto,
  ConflictErrorResponseDto,
  EntityNotFoundErrorResponseDto,
  InternalServerErrorResponseDto,
  InputValidationErrorResponseDto,
} from "@voyzu/types/errors";
import type { PartyResponseDto } from "@voyzu/party/types/modules/parties";
import type { PartyCreateRequestDto } from "@voyzu/party/types/modules/parties";
import type { PartyUpdateRequestDto } from "@voyzu/party/types/modules/parties";
import type { PartyPatchRequestDto } from "@voyzu/party/types/modules/parties";
import type { PartyBatchUpdateRequestDto } from "@voyzu/party/types/modules/parties";
import type { PartyBatchPatchRequestDto } from "@voyzu/party/types/modules/parties";

import { businessRuleError, conflictError, notFoundError, serverError, inputValidationError } from "@voyzu/capability/http";
import { BusinessRuleError, ConflictError, NotFoundError, InputValidationError } from "@voyzu/capability/errors";
import { created, noContent, ok } from "@voyzu/capability/http";
import { parseBody } from "@voyzu/capability/http";

import {
  listParties,
  batchCreateParties,
  batchDeleteParties,
  batchGetParties,
  batchPatchParties,
  batchUpdateParties,
  filterParties,
  searchParties,
  getParty,
  activateParty,
  activateParties,
  createParty,
  deactivateParty,
  deactivateParties,
  updateParty,
  patchParty,
  deleteParty,
} from "../lib/party.service";




export async function handleList(
  _req: NextRequest,
): Promise<NextResponse<PartyResponseDto[] | InternalServerErrorResponseDto>> {
  try {
    const parties = await listParties();
    return ok(parties satisfies PartyResponseDto[]);
  } catch (err) {
    return serverError(err);
  }
}


export async function handleFilter(
  req: NextRequest,
): Promise<NextResponse<PartyResponseDto[] | InternalServerErrorResponseDto>> {
  try {
    const { filters, options } = await parseBody<FilterRequestDto>(req);
    const parties = await filterParties(filters ?? [], options);
    return ok(parties satisfies PartyResponseDto[]);
  } catch (err) {
    return serverError(err);
  }
}


export async function handleSearch(
  req: NextRequest,
): Promise<
  NextResponse<PartyResponseDto[] | InputValidationErrorResponseDto | InternalServerErrorResponseDto>
> {
  try {
    const q = req.nextUrl.searchParams.get("q");
    if (!q) {
      return inputValidationError("Query parameter 'q' is required");
    }

    const parties = await searchParties(q);
    return ok(parties satisfies PartyResponseDto[]);
  } catch (err) {
    return serverError(err);
  }
}



export async function handleGet(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
): Promise<
  NextResponse<
    | PartyResponseDto
    | EntityNotFoundErrorResponseDto
    | InternalServerErrorResponseDto
  >
> {
  try {
    const { code } = await params;
    const party = await getParty(code);
    if (!party) {
      return notFoundError(`Party code ${code} was not found`);
    }
    return ok(party satisfies PartyResponseDto);
  } catch (err) {
    return serverError(err);
  }
}


export async function handleCreate(
  req: NextRequest,
): Promise<NextResponse<PartyResponseDto | InputValidationErrorResponseDto | BusinessRuleErrorResponseDto | ConflictErrorResponseDto | InternalServerErrorResponseDto>> {
  try {
    const body = await parseBody<PartyCreateRequestDto>(req);
    const party = await createParty(body);
    return created(party satisfies PartyResponseDto);
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof BusinessRuleError) return businessRuleError(err.message);
    if (err instanceof ConflictError) return conflictError(err.message);
    return serverError(err);
  }
}


export async function handleUpdate(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
): Promise<
  NextResponse<
    | PartyResponseDto
    | InputValidationErrorResponseDto
    | BusinessRuleErrorResponseDto
    | EntityNotFoundErrorResponseDto
    | InternalServerErrorResponseDto
  >
> {
  try {
    const { code } = await params;
    const body = await parseBody<PartyUpdateRequestDto>(req);
    const party = await updateParty(code, body);
    return ok(party satisfies PartyResponseDto);
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof BusinessRuleError) return businessRuleError(err.message);
    if (err instanceof NotFoundError) return notFoundError(err.message);
    return serverError(err);
  }
}


export async function handlePatch(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
): Promise<
  NextResponse<
    | PartyResponseDto
    | InputValidationErrorResponseDto
    | BusinessRuleErrorResponseDto
    | EntityNotFoundErrorResponseDto
    | InternalServerErrorResponseDto
  >
> {
  try {
    const { code } = await params;
    const body = await parseBody<PartyPatchRequestDto>(req);
    const party = await patchParty(code, body);
    return ok(party satisfies PartyResponseDto);
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof BusinessRuleError) return businessRuleError(err.message);
    if (err instanceof NotFoundError) return notFoundError(err.message);
    return serverError(err);
  }
}


export async function handleDelete(
  _req: NextRequest,
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
    await deleteParty(code);
    return noContent();
  } catch (err) {
    if (err instanceof BusinessRuleError) return businessRuleError(err.message);
    if (err instanceof NotFoundError) return notFoundError(err.message);
    return serverError(err);
  }
}

export async function handleBatchCreate(
  req: NextRequest,
): Promise<NextResponse<PartyResponseDto[] | InputValidationErrorResponseDto | ConflictErrorResponseDto | InternalServerErrorResponseDto>> {
  try {
    const body = await parseBody<PartyCreateRequestDto[]>(req);
    return created(await batchCreateParties(body));
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof ConflictError) return conflictError(err.message);
    return serverError(err);
  }
}

export async function handleBatchGet(
  req: NextRequest,
): Promise<NextResponse<PartyResponseDto[] | InputValidationErrorResponseDto | InternalServerErrorResponseDto>> {
  try {
    const { codes } = await parseBody<CodesRequestDto>(req);
    return ok(await batchGetParties(codes));
  } catch (err) {
    return serverError(err);
  }
}

export async function handleBatchUpdate(
  req: NextRequest,
): Promise<NextResponse<PartyResponseDto[] | InputValidationErrorResponseDto | EntityNotFoundErrorResponseDto | InternalServerErrorResponseDto>> {
  try {
    const body = await parseBody<PartyBatchUpdateRequestDto[]>(req);
    return ok(await batchUpdateParties(body));
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof NotFoundError) return notFoundError(err.message);
    return serverError(err);
  }
}

export async function handleBatchPatch(
  req: NextRequest,
): Promise<NextResponse<PartyResponseDto[] | InputValidationErrorResponseDto | EntityNotFoundErrorResponseDto | InternalServerErrorResponseDto>> {
  try {
    const body = await parseBody<PartyBatchPatchRequestDto[]>(req);
    return ok(await batchPatchParties(body));
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof NotFoundError) return notFoundError(err.message);
    return serverError(err);
  }
}

export async function handleBatchDelete(
  req: NextRequest,
): Promise<NextResponse<null | BusinessRuleErrorResponseDto | InputValidationErrorResponseDto | EntityNotFoundErrorResponseDto | InternalServerErrorResponseDto>> {
  try {
    const { codes } = await parseBody<CodesRequestDto>(req);
    await batchDeleteParties(codes);
    return noContent();
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof BusinessRuleError) return businessRuleError(err.message);
    if (err instanceof NotFoundError) return notFoundError(err.message);
    return serverError(err);
  }
}

export async function handleActivate(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
): Promise<NextResponse<PartyResponseDto | InputValidationErrorResponseDto | EntityNotFoundErrorResponseDto | InternalServerErrorResponseDto>> {
  try {
    const { code } = await params;
    const party = await activateParty(code);
    return ok(party satisfies PartyResponseDto);
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof NotFoundError) return notFoundError(err.message);
    return serverError(err);
  }
}

export async function handleDeactivate(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
): Promise<NextResponse<PartyResponseDto | InputValidationErrorResponseDto | BusinessRuleErrorResponseDto | EntityNotFoundErrorResponseDto | InternalServerErrorResponseDto>> {
  try {
    const { code } = await params;
    const party = await deactivateParty(code);
    return ok(party satisfies PartyResponseDto);
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof BusinessRuleError) return businessRuleError(err.message);
    if (err instanceof NotFoundError) return notFoundError(err.message);
    return serverError(err);
  }
}

export async function handleBatchActivate(
  req: NextRequest,
): Promise<NextResponse<PartyResponseDto[] | InputValidationErrorResponseDto | EntityNotFoundErrorResponseDto | InternalServerErrorResponseDto>> {
  try {
    const { codes } = await parseBody<CodesRequestDto>(req);
    const parties = await activateParties(codes);
    return ok(parties satisfies PartyResponseDto[]);
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof NotFoundError) return notFoundError(err.message);
    return serverError(err);
  }
}

export async function handleBatchDeactivate(
  req: NextRequest,
): Promise<NextResponse<PartyResponseDto[] | InputValidationErrorResponseDto | BusinessRuleErrorResponseDto | EntityNotFoundErrorResponseDto | InternalServerErrorResponseDto>> {
  try {
    const { codes } = await parseBody<CodesRequestDto>(req);
    const parties = await deactivateParties(codes);
    return ok(parties satisfies PartyResponseDto[]);
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof BusinessRuleError) return businessRuleError(err.message);
    if (err instanceof NotFoundError) return notFoundError(err.message);
    return serverError(err);
  }
}
