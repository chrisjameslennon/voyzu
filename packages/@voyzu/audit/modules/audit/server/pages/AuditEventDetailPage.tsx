import "server-only";

import { notFound } from "next/navigation";
import { getAuditEvent } from "@voyzu/audit/server";

import { AuditEventDetail } from "../../client";

interface OrganizationAuditEventDetailPageProps {
  id?: string;
}

export async function AuditEventDetailPage({ id }: OrganizationAuditEventDetailPageProps) {
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
