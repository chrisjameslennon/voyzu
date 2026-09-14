import type { NextRequest } from "next/server";
import { internalApi } from "@voyzu/capability/internal-api";
import { BusinessRuleError, InputValidationError, NotFoundError } from "@voyzu/capability/errors";
import { businessRuleError, forbiddenError, inputValidationError, notFoundError, ok, parseBody, serverError } from "@voyzu/capability/http";
import type { UserOrganizationAccessResponseDto, UserOrganizationAccessUpdateRequestDto } from "../../../../types/user-organization-access.dto";
import { currentUserCanManageUsers } from "../lib/current-user.service";
import { getUser } from "../lib/user.service";
import { listUserOrganizationOptions } from "../db/user-organization-options.repo";

type Context = { params: Promise<{ code: string }> };

function handleError(error: unknown) {
  if (error instanceof NotFoundError) return notFoundError(error.message);
  if (error instanceof InputValidationError) return inputValidationError(error.message);
  if (error instanceof BusinessRuleError) return businessRuleError(error.message);
  return serverError(error);
}

export async function handleGet(_request: NextRequest, { params }: Context) {
  if (!(await currentUserCanManageUsers())) return forbiddenError("You do not have access");
  try {
    const { code } = await params;
    const user = await getUser(decodeURIComponent(code));
    if (!user) return notFoundError(`User ${code} not found`);
    const [access, organizations] = await Promise.all([
      internalApi.call("@core/organization-access", "get", { userId: user.id }),
      listUserOrganizationOptions(),
    ]);
    return ok({ access, organizations } satisfies UserOrganizationAccessResponseDto);
  } catch (error) {
    return handleError(error);
  }
}

export async function handleReplace(request: NextRequest, { params }: Context) {
  if (!(await currentUserCanManageUsers())) return forbiddenError("You do not have access");
  try {
    const { code } = await params;
    const body = await parseBody<UserOrganizationAccessUpdateRequestDto>(request);
    return ok(await internalApi.call("@core/organization-access", "replace", {
      userCode: decodeURIComponent(code),
      organization_ids: body.organization_ids,
    }));
  } catch (error) {
    return handleError(error);
  }
}
