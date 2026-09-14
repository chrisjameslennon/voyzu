import { pageStringParameters, type PageProps } from "@voyzu/types/page-routing";
import "server-only";

import { notFound } from "next/navigation";
import { getAuditEvent } from "@voyzu/audit/server";

import { AuditEventDetail } from "../../client";

export async function AuditEventDetailPage({ context }: PageProps) {
  const { id } = pageStringParameters(context.pathParams);
  if (!id) notFound();

  const event = await getAuditEvent(Number(id));
  if (!event) notFound();

  return (
    <AuditEventDetail
      event={event}
      routeBasePath="/settings/audit"
    />
  );
}
