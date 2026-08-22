import { type NextRequest, NextResponse } from "next/server";

import {
  businessRuleError,
  conflictError,
  created,
  inputValidationError,
  noContent,
  notFoundError,
  ok,
  parseBody,
  serverError,
} from "@voyzu/capability/http";
import { BusinessRuleError, ConflictError, InputValidationError, NotFoundError } from "@voyzu/capability/errors";
import type {
  BusinessRuleErrorResponseDto,
  ConflictErrorResponseDto,
  EntityNotFoundErrorResponseDto,
  InternalServerErrorResponseDto,
  InputValidationErrorResponseDto,
} from "@voyzu/types/errors";
import type { FilterRequestDto } from "@voyzu/types/params";
import type {
  CountryCreateRequestDto,
  CountryBatchPatchRequestDto,
  CountryBatchUpdateRequestDto,
  CountryCodesRequestDto,
  CountryPatchRequestDto,
  CountryResponseDto,
  CountryUpdateRequestDto,
} from "@voyzu/localization/types/modules/countries";

import {
  activateCountries,
  activateCountry,
  batchCreateCountries,
  batchDeleteCountries,
  batchGetCountries,
  batchPatchCountries,
  batchUpdateCountries,
  createCountry,
  deactivateCountries,
  deactivateCountry,
  deleteCountry,
  filterCountries,
  getCountry,
  listCountries,
  patchCountry,
  searchCountries,
  updateCountry,
} from "../lib/country.service";

export async function handleList(
  _request: NextRequest,
): Promise<NextResponse<CountryResponseDto[] | InternalServerErrorResponseDto>> {
  try {
    return ok(await listCountries());
  } catch (error) {
    return serverError(error);
  }
}

export async function handleFilter(
  request: NextRequest,
): Promise<NextResponse<CountryResponseDto[] | InternalServerErrorResponseDto>> {
  try {
    const { filters, options } = await parseBody<FilterRequestDto>(request);
    return ok(await filterCountries(filters ?? [], options));
  } catch (error) {
    return serverError(error);
  }
}

export async function handleSearch(
  request: NextRequest,
): Promise<NextResponse<CountryResponseDto[] | InputValidationErrorResponseDto | InternalServerErrorResponseDto>> {
  try {
    const query = request.nextUrl.searchParams.get("q");
    if (!query) return inputValidationError("Query parameter 'q' is required");
    return ok(await searchCountries(query));
  } catch (error) {
    return serverError(error);
  }
}

export async function handleGet(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
): Promise<NextResponse<CountryResponseDto | EntityNotFoundErrorResponseDto | InternalServerErrorResponseDto>> {
  try {
    const { code } = await params;
    const country = await getCountry(code);
    if (!country) return notFoundError(`Country code ${code} was not found`);
    return ok(country);
  } catch (error) {
    return serverError(error);
  }
}

export async function handleCreate(
  request: NextRequest,
): Promise<NextResponse<CountryResponseDto | InputValidationErrorResponseDto | BusinessRuleErrorResponseDto | ConflictErrorResponseDto | InternalServerErrorResponseDto>> {
  try {
    return created(await createCountry(await parseBody<CountryCreateRequestDto>(request)));
  } catch (error) {
    if (error instanceof InputValidationError) return inputValidationError(error.message);
    if (error instanceof BusinessRuleError) return businessRuleError(error.message);
    if (error instanceof ConflictError) return conflictError(error.message);
    return serverError(error);
  }
}

export async function handleUpdate(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
): Promise<NextResponse<CountryResponseDto | InputValidationErrorResponseDto | BusinessRuleErrorResponseDto | EntityNotFoundErrorResponseDto | InternalServerErrorResponseDto>> {
  try {
    const { code } = await params;
    return ok(await updateCountry(code, await parseBody<CountryUpdateRequestDto>(request)));
  } catch (error) {
    if (error instanceof InputValidationError) return inputValidationError(error.message);
    if (error instanceof BusinessRuleError) return businessRuleError(error.message);
    if (error instanceof NotFoundError) return notFoundError(error.message);
    return serverError(error);
  }
}

export async function handlePatch(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
): Promise<NextResponse<CountryResponseDto | InputValidationErrorResponseDto | BusinessRuleErrorResponseDto | EntityNotFoundErrorResponseDto | InternalServerErrorResponseDto>> {
  try {
    const { code } = await params;
    return ok(await patchCountry(code, await parseBody<CountryPatchRequestDto>(request)));
  } catch (error) {
    if (error instanceof InputValidationError) return inputValidationError(error.message);
    if (error instanceof BusinessRuleError) return businessRuleError(error.message);
    if (error instanceof NotFoundError) return notFoundError(error.message);
    return serverError(error);
  }
}

export async function handleDelete(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
): Promise<NextResponse<null | BusinessRuleErrorResponseDto | EntityNotFoundErrorResponseDto | InternalServerErrorResponseDto>> {
  try {
    const { code } = await params;
    await deleteCountry(code);
    return noContent();
  } catch (error) {
    if (error instanceof BusinessRuleError) return businessRuleError(error.message);
    if (error instanceof NotFoundError) return notFoundError(error.message);
    return serverError(error);
  }
}
export async function handleBatchCreate(
  request: NextRequest,
): Promise<NextResponse<CountryResponseDto[] | InputValidationErrorResponseDto | ConflictErrorResponseDto | InternalServerErrorResponseDto>> {
  try {
    return created(await batchCreateCountries(await parseBody<CountryCreateRequestDto[]>(request)));
  } catch (error) {
    if (error instanceof InputValidationError) return inputValidationError(error.message);
    if (error instanceof ConflictError) return conflictError(error.message);
    return serverError(error);
  }
}

export async function handleBatchGet(
  request: NextRequest,
): Promise<NextResponse<CountryResponseDto[] | InputValidationErrorResponseDto | InternalServerErrorResponseDto>> {
  try {
    const { codes } = await parseBody<CountryCodesRequestDto>(request);
    return ok(await batchGetCountries(codes));
  } catch (error) {
    return serverError(error);
  }
}

export async function handleBatchUpdate(
  request: NextRequest,
): Promise<NextResponse<CountryResponseDto[] | InputValidationErrorResponseDto | EntityNotFoundErrorResponseDto | InternalServerErrorResponseDto>> {
  try {
    return ok(await batchUpdateCountries(await parseBody<CountryBatchUpdateRequestDto[]>(request)));
  } catch (error) {
    if (error instanceof InputValidationError) return inputValidationError(error.message);
    if (error instanceof NotFoundError) return notFoundError(error.message);
    return serverError(error);
  }
}

export async function handleBatchPatch(
  request: NextRequest,
): Promise<NextResponse<CountryResponseDto[] | InputValidationErrorResponseDto | EntityNotFoundErrorResponseDto | InternalServerErrorResponseDto>> {
  try {
    return ok(await batchPatchCountries(await parseBody<CountryBatchPatchRequestDto[]>(request)));
  } catch (error) {
    if (error instanceof InputValidationError) return inputValidationError(error.message);
    if (error instanceof NotFoundError) return notFoundError(error.message);
    return serverError(error);
  }
}

export async function handleBatchDelete(
  request: NextRequest,
): Promise<NextResponse<null | BusinessRuleErrorResponseDto | InputValidationErrorResponseDto | EntityNotFoundErrorResponseDto | InternalServerErrorResponseDto>> {
  try {
    const { codes } = await parseBody<CountryCodesRequestDto>(request);
    await batchDeleteCountries(codes);
    return noContent();
  } catch (error) {
    if (error instanceof InputValidationError) return inputValidationError(error.message);
    if (error instanceof BusinessRuleError) return businessRuleError(error.message);
    if (error instanceof NotFoundError) return notFoundError(error.message);
    return serverError(error);
  }
}

export async function handleActivate(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
): Promise<NextResponse<CountryResponseDto | InputValidationErrorResponseDto | EntityNotFoundErrorResponseDto | InternalServerErrorResponseDto>> {
  try {
    const { code } = await params;
    return ok(await activateCountry(code));
  } catch (error) {
    if (error instanceof InputValidationError) return inputValidationError(error.message);
    if (error instanceof NotFoundError) return notFoundError(error.message);
    return serverError(error);
  }
}

export async function handleDeactivate(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
): Promise<NextResponse<CountryResponseDto | InputValidationErrorResponseDto | EntityNotFoundErrorResponseDto | InternalServerErrorResponseDto>> {
  try {
    const { code } = await params;
    return ok(await deactivateCountry(code));
  } catch (error) {
    if (error instanceof InputValidationError) return inputValidationError(error.message);
    if (error instanceof NotFoundError) return notFoundError(error.message);
    return serverError(error);
  }
}

export async function handleBatchActivate(
  request: NextRequest,
): Promise<NextResponse<CountryResponseDto[] | InputValidationErrorResponseDto | EntityNotFoundErrorResponseDto | InternalServerErrorResponseDto>> {
  try {
    const { codes } = await parseBody<CountryCodesRequestDto>(request);
    return ok(await activateCountries(codes));
  } catch (error) {
    if (error instanceof InputValidationError) return inputValidationError(error.message);
    if (error instanceof NotFoundError) return notFoundError(error.message);
    return serverError(error);
  }
}

export async function handleBatchDeactivate(
  request: NextRequest,
): Promise<NextResponse<CountryResponseDto[] | InputValidationErrorResponseDto | EntityNotFoundErrorResponseDto | InternalServerErrorResponseDto>> {
  try {
    const { codes } = await parseBody<CountryCodesRequestDto>(request);
    return ok(await deactivateCountries(codes));
  } catch (error) {
    if (error instanceof InputValidationError) return inputValidationError(error.message);
    if (error instanceof NotFoundError) return notFoundError(error.message);
    return serverError(error);
  }
}

