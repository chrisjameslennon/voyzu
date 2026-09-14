import { pageStringParameters, type PageProps } from "@voyzu/types/page-routing";
import "server-only";

import { previousDaysRange } from "@voyzu/audit/server";
import { detailBackHref, normalizeDetailBackSource } from "@voyzu/ui-surface";

import { AuditEventList } from "../../client";
import { listAuditOrganizations } from "../lib/organization-directory";

function normalizeAuditLinkParams(searchParams: Record<string, string | undefined>) {
  const rawEntityId = searchParams.entityId ?? "";
  const entityIdLooksLikeDatabaseId = rawEntityId === "" || /^\d+$/.test(rawEntityId);

  return {
    entityType: searchParams.entityType ?? "",
    entityCode: searchParams.entityCode ?? (entityIdLooksLikeDatabaseId ? "" : rawEntityId),
    entityId: entityIdLooksLikeDatabaseId ? rawEntityId : "",
    mutationId: searchParams.mutationId ?? "",
  };
}

export async function AuditEventsPage({ context }: PageProps) {
  const organizations = await listAuditOrganizations();
  const { fromDate, toDate } = previousDaysRange(90);
  const searchParams = pageStringParameters(context.queryParams);
  const initialFilters = normalizeAuditLinkParams(searchParams);
  const hasLinkedEntityFilter = Boolean(initialFilters.entityType || initialFilters.entityCode || initialFilters.entityId || initialFilters.mutationId);
  const backFrom = normalizeDetailBackSource(searchParams.from);
  const backFromCode = searchParams.fromCode;
  const hasBackTarget = Boolean(backFrom)
    && detailBackHref({ from: backFrom, fromCode: backFromCode, fallbackHref: "" }) !== "";

  return (
    <AuditEventList
      organizations={organizations}
      initialFinancialYears={[]}
      initialSelectedYearCode=""
      initialDateFrom={hasLinkedEntityFilter ? "" : fromDate}
      initialDateTo={hasLinkedEntityFilter ? "" : toDate}
      suppressInitialDateFilter={hasLinkedEntityFilter}
      initialEntityType={initialFilters.entityType}
      initialEntityCode={initialFilters.entityCode}
      initialEntityId={initialFilters.entityId}
      initialMutationId={initialFilters.mutationId}
      backFrom={hasBackTarget ? backFrom : undefined}
      backFromCode={hasBackTarget ? backFromCode : undefined}
    />
  );
}
