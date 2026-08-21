import { type NextRequest, NextResponse } from "next/server";

import type { CodesRequestDto, FilterRequestDto } from "@voyzu/types/params";
import type {
  BusinessRuleErrorResponseDto,
  ConflictErrorResponseDto,
  EntityNotFoundErrorResponseDto,
  InternalServerErrorResponseDto,
  InputValidationErrorResponseDto,
} from "@voyzu/types/errors";
import type { CurrencyResponseDto } from "@voyzu/organization/types/modules/currencies";
import type { CurrencyCreateRequestDto } from "@voyzu/organization/types/modules/currencies";
import type { CurrencyUpdateRequestDto } from "@voyzu/organization/types/modules/currencies";
import type { CurrencyPatchRequestDto } from "@voyzu/organization/types/modules/currencies";
import type { CurrencyBatchUpdateRequestDto } from "@voyzu/organization/types/modules/currencies";
import type { CurrencyBatchPatchRequestDto } from "@voyzu/organization/types/modules/currencies";

import { businessRuleError, conflictError, notFoundError, serverError, inputValidationError } from "@voyzu/capability/http";
import { BusinessRuleError, ConflictError, NotFoundError, InputValidationError } from "@voyzu/capability/errors";
import { created, noContent, ok } from "@voyzu/capability/http";
import { parseBody } from "@voyzu/capability/http";

import {
  listCurrencies,
  batchCreateCurrencies,
  batchDeleteCurrencies,
  batchGetCurrencies,
  batchPatchCurrencies,
  batchUpdateCurrencies,
  filterCurrencies,
  searchCurrencies,
  getCurrency,
  activateCurrency,
  activateCurrencies,
  createCurrency,
  deactivateCurrency,
  deactivateCurrencies,
  updateCurrency,
  patchCurrency,
  deleteCurrency,
} from "../lib/currency.service";




export async function handleList(
  _req: NextRequest,
): Promise<NextResponse<CurrencyResponseDto[] | InternalServerErrorResponseDto>> {
  try {
    const currencies = await listCurrencies();
    return ok(currencies satisfies CurrencyResponseDto[]);
  } catch (err) {
    return serverError(err);
  }
}


export async function handleFilter(
  req: NextRequest,
): Promise<NextResponse<CurrencyResponseDto[] | InternalServerErrorResponseDto>> {
  try {
    const { filters, options } = await parseBody<FilterRequestDto>(req);
    const currencies = await filterCurrencies(filters ?? [], options);
    return ok(currencies satisfies CurrencyResponseDto[]);
  } catch (err) {
    return serverError(err);
  }
}


export async function handleSearch(
  req: NextRequest,
): Promise<
  NextResponse<CurrencyResponseDto[] | InputValidationErrorResponseDto | InternalServerErrorResponseDto>
> {
  try {
    const q = req.nextUrl.searchParams.get("q");
    if (!q) {
      return inputValidationError("Query parameter 'q' is required");
    }

    const currencies = await searchCurrencies(q);
    return ok(currencies satisfies CurrencyResponseDto[]);
  } catch (err) {
    return serverError(err);
  }
}



export async function handleGet(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
): Promise<
  NextResponse<
    | CurrencyResponseDto
    | EntityNotFoundErrorResponseDto
    | InternalServerErrorResponseDto
  >
> {
  try {
    const { code } = await params;
    const currency = await getCurrency(code);
    if (!currency) {
      return notFoundError(`Currency code ${code} was not found`);
    }
    return ok(currency satisfies CurrencyResponseDto);
  } catch (err) {
    return serverError(err);
  }
}


export async function handleCreate(
  req: NextRequest,
): Promise<NextResponse<CurrencyResponseDto | InputValidationErrorResponseDto | BusinessRuleErrorResponseDto | ConflictErrorResponseDto | InternalServerErrorResponseDto>> {
  try {
    const body = await parseBody<CurrencyCreateRequestDto>(req);
    const currency = await createCurrency(body);
    return created(currency satisfies CurrencyResponseDto);
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
    | CurrencyResponseDto
    | InputValidationErrorResponseDto
    | BusinessRuleErrorResponseDto
    | EntityNotFoundErrorResponseDto
    | InternalServerErrorResponseDto
  >
> {
  try {
    const { code } = await params;
    const body = await parseBody<CurrencyUpdateRequestDto>(req);
    const currency = await updateCurrency(code, body);
    return ok(currency satisfies CurrencyResponseDto);
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
    | CurrencyResponseDto
    | InputValidationErrorResponseDto
    | BusinessRuleErrorResponseDto
    | EntityNotFoundErrorResponseDto
    | InternalServerErrorResponseDto
  >
> {
  try {
    const { code } = await params;
    const body = await parseBody<CurrencyPatchRequestDto>(req);
    const currency = await patchCurrency(code, body);
    return ok(currency satisfies CurrencyResponseDto);
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
    await deleteCurrency(code);
    return noContent();
  } catch (err) {
    if (err instanceof BusinessRuleError) return businessRuleError(err.message);
    if (err instanceof NotFoundError) return notFoundError(err.message);
    return serverError(err);
  }
}

export async function handleBatchCreate(
  req: NextRequest,
): Promise<NextResponse<CurrencyResponseDto[] | InputValidationErrorResponseDto | ConflictErrorResponseDto | InternalServerErrorResponseDto>> {
  try {
    const body = await parseBody<CurrencyCreateRequestDto[]>(req);
    return created(await batchCreateCurrencies(body));
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof ConflictError) return conflictError(err.message);
    return serverError(err);
  }
}

export async function handleBatchGet(
  req: NextRequest,
): Promise<NextResponse<CurrencyResponseDto[] | InputValidationErrorResponseDto | InternalServerErrorResponseDto>> {
  try {
    const { codes } = await parseBody<CodesRequestDto>(req);
    return ok(await batchGetCurrencies(codes));
  } catch (err) {
    return serverError(err);
  }
}

export async function handleBatchUpdate(
  req: NextRequest,
): Promise<NextResponse<CurrencyResponseDto[] | InputValidationErrorResponseDto | EntityNotFoundErrorResponseDto | InternalServerErrorResponseDto>> {
  try {
    const body = await parseBody<CurrencyBatchUpdateRequestDto[]>(req);
    return ok(await batchUpdateCurrencies(body));
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof NotFoundError) return notFoundError(err.message);
    return serverError(err);
  }
}

export async function handleBatchPatch(
  req: NextRequest,
): Promise<NextResponse<CurrencyResponseDto[] | InputValidationErrorResponseDto | EntityNotFoundErrorResponseDto | InternalServerErrorResponseDto>> {
  try {
    const body = await parseBody<CurrencyBatchPatchRequestDto[]>(req);
    return ok(await batchPatchCurrencies(body));
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
    await batchDeleteCurrencies(codes);
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
): Promise<NextResponse<CurrencyResponseDto | InputValidationErrorResponseDto | EntityNotFoundErrorResponseDto | InternalServerErrorResponseDto>> {
  try {
    const { code } = await params;
    const currency = await activateCurrency(code);
    return ok(currency satisfies CurrencyResponseDto);
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof NotFoundError) return notFoundError(err.message);
    return serverError(err);
  }
}

export async function handleDeactivate(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
): Promise<NextResponse<CurrencyResponseDto | InputValidationErrorResponseDto | BusinessRuleErrorResponseDto | EntityNotFoundErrorResponseDto | InternalServerErrorResponseDto>> {
  try {
    const { code } = await params;
    const currency = await deactivateCurrency(code);
    return ok(currency satisfies CurrencyResponseDto);
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof BusinessRuleError) return businessRuleError(err.message);
    if (err instanceof NotFoundError) return notFoundError(err.message);
    return serverError(err);
  }
}

export async function handleBatchActivate(
  req: NextRequest,
): Promise<NextResponse<CurrencyResponseDto[] | InputValidationErrorResponseDto | EntityNotFoundErrorResponseDto | InternalServerErrorResponseDto>> {
  try {
    const { codes } = await parseBody<CodesRequestDto>(req);
    const currencies = await activateCurrencies(codes);
    return ok(currencies satisfies CurrencyResponseDto[]);
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof NotFoundError) return notFoundError(err.message);
    return serverError(err);
  }
}

export async function handleBatchDeactivate(
  req: NextRequest,
): Promise<NextResponse<CurrencyResponseDto[] | InputValidationErrorResponseDto | BusinessRuleErrorResponseDto | EntityNotFoundErrorResponseDto | InternalServerErrorResponseDto>> {
  try {
    const { codes } = await parseBody<CodesRequestDto>(req);
    const currencies = await deactivateCurrencies(codes);
    return ok(currencies satisfies CurrencyResponseDto[]);
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof BusinessRuleError) return businessRuleError(err.message);
    if (err instanceof NotFoundError) return notFoundError(err.message);
    return serverError(err);
  }
}
