import { type NextRequest, NextResponse } from "next/server";

import type { CodesRequestDto, FilterRequestDto } from "@voyzu/types/params";
import type {
  BusinessRuleErrorResponseDto,
  ConflictErrorResponseDto,
  EntityNotFoundErrorResponseDto,
  InternalServerErrorResponseDto,
  InputValidationErrorResponseDto,
} from "@voyzu/types/errors";
import type { CompanyResponseDto } from "@voyzu/organization/types/modules/companies";
import type { CompanyCreateRequestDto } from "@voyzu/organization/types/modules/companies";
import type { CompanyUpdateRequestDto } from "@voyzu/organization/types/modules/companies";
import type { CompanyPatchRequestDto } from "@voyzu/organization/types/modules/companies";
import type { CompanyBatchUpdateRequestDto } from "@voyzu/organization/types/modules/companies";
import type { CompanyBatchPatchRequestDto } from "@voyzu/organization/types/modules/companies";

import { businessRuleError, conflictError, notFoundError, serverError, inputValidationError } from "@voyzu/capability/http";
import { BusinessRuleError, ConflictError, NotFoundError, InputValidationError } from "@voyzu/capability/errors";
import { created, noContent, ok } from "@voyzu/capability/http";
import { parseBody } from "@voyzu/capability/http";

import {
  listCompanies,
  filterCompanies,
  searchCompanies,
  getCompany,
  createCompany,
  updateCompany,
  patchCompany,
  deleteCompany,
  batchCreateCompanies,
  batchGetCompanies,
  batchUpdateCompanies,
  batchPatchCompanies,
  batchDeleteCompanies,
  activateCompanies,
  activateCompany,
  deactivateCompanies,
  deactivateCompany,
} from "../lib/company.service";




export async function handleList(
  _req: NextRequest,
): Promise<NextResponse<CompanyResponseDto[] | InternalServerErrorResponseDto>> {
  try {
    const companies = await listCompanies();
    return ok(companies satisfies CompanyResponseDto[]);
  } catch (err) {
    return serverError(err);
  }
}


export async function handleFilter(
  req: NextRequest,
): Promise<NextResponse<CompanyResponseDto[] | InternalServerErrorResponseDto>> {
  try {
    const { filters, options } = await parseBody<FilterRequestDto>(req);
    const companies = await filterCompanies(filters ?? [], options);
    return ok(companies satisfies CompanyResponseDto[]);
  } catch (err) {
    return serverError(err);
  }
}



export async function handleSearch(
  req: NextRequest,
): Promise<
  NextResponse<CompanyResponseDto[] | InputValidationErrorResponseDto | InternalServerErrorResponseDto>
> {
  try {
    const q = req.nextUrl.searchParams.get("q");
    if (!q) {
      return inputValidationError("Query parameter 'q' is required");
    }

    const companies = await searchCompanies(q);
    return ok(companies satisfies CompanyResponseDto[]);
  } catch (err) {
    return serverError(err);
  }
}



export async function handleGet(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
): Promise<
  NextResponse<
    | CompanyResponseDto
    | EntityNotFoundErrorResponseDto
    | InternalServerErrorResponseDto
  >
> {
  try {
    const { code } = await params;
    const company = await getCompany(code);
    if (!company) {
      return notFoundError(`Company code ${code} was not found`);
    }
    return ok(company satisfies CompanyResponseDto);
  } catch (err) {
    return serverError(err);
  }
}


export async function handleCreate(
  req: NextRequest,
): Promise<NextResponse<CompanyResponseDto | InputValidationErrorResponseDto | ConflictErrorResponseDto | InternalServerErrorResponseDto>> {
  try {
    const body = await parseBody<CompanyCreateRequestDto>(req);
    const company = await createCompany(body);
    return created(company satisfies CompanyResponseDto);
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
    | CompanyResponseDto
    | InputValidationErrorResponseDto
    | EntityNotFoundErrorResponseDto
    | ConflictErrorResponseDto
    | InternalServerErrorResponseDto
  >
> {
  try {
    const { code } = await params;
    const body = await parseBody<CompanyUpdateRequestDto>(req);
    const company = await updateCompany(code, body);
    return ok(company satisfies CompanyResponseDto);
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
    | CompanyResponseDto
    | InputValidationErrorResponseDto
    | EntityNotFoundErrorResponseDto
    | ConflictErrorResponseDto
    | InternalServerErrorResponseDto
  >
> {
  try {
    const { code } = await params;
    const body = await parseBody<CompanyPatchRequestDto>(req);
    const company = await patchCompany(code, body);
    return ok(company satisfies CompanyResponseDto);
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof BusinessRuleError) return businessRuleError(err.message) as never;
    if (err instanceof NotFoundError) return notFoundError(err.message);
    if (err instanceof ConflictError) return conflictError(err.message);
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
    await deleteCompany(code);
    return noContent();
  } catch (err) {
    if (err instanceof BusinessRuleError) return businessRuleError(err.message) as never;
    if (err instanceof NotFoundError) return notFoundError(err.message);
    return serverError(err);
  }
}






export async function handleBatchCreate(
  req: NextRequest,
): Promise<
  NextResponse<CompanyResponseDto[] | InputValidationErrorResponseDto | ConflictErrorResponseDto | InternalServerErrorResponseDto>
> {
  try {
    const body = await parseBody<CompanyCreateRequestDto[]>(req);
    const companies = await batchCreateCompanies(body);
    return created(companies satisfies CompanyResponseDto[]);
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
  NextResponse<CompanyResponseDto[] | InputValidationErrorResponseDto | InternalServerErrorResponseDto>
> {
  try {
    const { codes } = await parseBody<CodesRequestDto>(req);
    const companies = await batchGetCompanies(codes);
    return ok(companies satisfies CompanyResponseDto[]);
  } catch (err) {
    return serverError(err);
  }
}


export async function handleBatchUpdate(
  req: NextRequest,
): Promise<
  NextResponse<CompanyResponseDto[] | InputValidationErrorResponseDto | EntityNotFoundErrorResponseDto | ConflictErrorResponseDto | InternalServerErrorResponseDto>
> {
  try {
    const body = await parseBody<CompanyBatchUpdateRequestDto[]>(req);
    const companies = await batchUpdateCompanies(body);
    return ok(companies satisfies CompanyResponseDto[]);
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
  NextResponse<CompanyResponseDto[] | InputValidationErrorResponseDto | EntityNotFoundErrorResponseDto | ConflictErrorResponseDto | InternalServerErrorResponseDto>
> {
  try {
    const body = await parseBody<CompanyBatchPatchRequestDto[]>(req);
    for (const item of body) {
      if (!item.code) {
        return inputValidationError("Each item must include a 'code' field");
      }
    }

    const companies = await batchPatchCompanies(body);
    return ok(companies satisfies CompanyResponseDto[]);
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
    await batchDeleteCompanies(codes);
    return noContent();
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof BusinessRuleError) return businessRuleError(err.message) as never;
    if (err instanceof NotFoundError) return notFoundError(err.message);
    return serverError(err);
  }
}

export async function handleBatchActivate(
  req: NextRequest,
): Promise<NextResponse<CompanyResponseDto[] | InputValidationErrorResponseDto | EntityNotFoundErrorResponseDto | InternalServerErrorResponseDto>> {
  try {
    const { codes } = await parseBody<CodesRequestDto>(req);
    const companies = await activateCompanies(codes);
    return ok(companies satisfies CompanyResponseDto[]);
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof NotFoundError) return notFoundError(err.message);
    return serverError(err);
  }
}

export async function handleBatchDeactivate(
  req: NextRequest,
): Promise<NextResponse<CompanyResponseDto[] | InputValidationErrorResponseDto | EntityNotFoundErrorResponseDto | InternalServerErrorResponseDto>> {
  try {
    const { codes } = await parseBody<CodesRequestDto>(req);
    const companies = await deactivateCompanies(codes);
    return ok(companies satisfies CompanyResponseDto[]);
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof NotFoundError) return notFoundError(err.message);
    return serverError(err);
  }
}

export async function handleActivate(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
): Promise<NextResponse<CompanyResponseDto | InputValidationErrorResponseDto | EntityNotFoundErrorResponseDto | InternalServerErrorResponseDto>> {
  try {
    const { code } = await params;
    const company = await activateCompany(code);
    return ok(company satisfies CompanyResponseDto);
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof NotFoundError) return notFoundError(err.message);
    return serverError(err);
  }
}

export async function handleDeactivate(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
): Promise<NextResponse<CompanyResponseDto | InputValidationErrorResponseDto | BusinessRuleErrorResponseDto | EntityNotFoundErrorResponseDto | InternalServerErrorResponseDto>> {
  try {
    const { code } = await params;
    const company = await deactivateCompany(code);
    return ok(company satisfies CompanyResponseDto);
  } catch (err) {
    if (err instanceof InputValidationError) return inputValidationError(err.message);
    if (err instanceof BusinessRuleError) return businessRuleError(err.message) as never;
    if (err instanceof NotFoundError) return notFoundError(err.message);
    return serverError(err);
  }
}
