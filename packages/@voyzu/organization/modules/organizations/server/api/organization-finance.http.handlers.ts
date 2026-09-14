import type { NextRequest } from "next/server";
import type { OrganizationFinanceChanges } from "@voyzu/types/business-objects/organization-finance";
import { internalApi } from "@voyzu/capability/internal-api";
import { BusinessRuleError, InputValidationError, NotFoundError } from "@voyzu/capability/errors";
import { businessRuleError, inputValidationError, notFoundError, ok, parseBody, serverError, unauthorizedError } from "@voyzu/capability/http";
import { getOrganization } from "../lib/organization.service";

export async function handleUpdateFinance(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { user } = await internalApi.call("@core/auth", "get", {});
    if (!user || user.status !== "ACTIVE") return unauthorizedError("An active user is required");
    const { code } = await params;
    const organization = await getOrganization(code);
    if (!organization) return notFoundError(`Organization ${code} not found`);
    if (!internalApi.has("@erp/organization-finance")) return notFoundError("Finance is not installed");
    const changes = await parseBody<OrganizationFinanceChanges>(request);
    return ok(await internalApi.call("@erp/organization-finance", "update", { organization_id: organization.id, changes }));
  } catch (error) {
    if (error instanceof NotFoundError) return notFoundError(error.message);
    if (error instanceof BusinessRuleError) return businessRuleError(error.message);
    if (error instanceof InputValidationError || error instanceof SyntaxError) return inputValidationError(error.message);
    return serverError(error);
  }
}
