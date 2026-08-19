import { type NextRequest, NextResponse } from "next/server";
import { listAuditEvents, exportAuditEvents, getAuditEvent } from "../lib/audit-event.service";
import type { AuditEventCountResponseDto } from "@voyzu/audit/types";
import { notFoundError, serverError } from "@voyzu/capability/http";

function filtersFromRequest(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  return {
    packageCode: searchParams.get("packageCode") ?? undefined,
    companyId: searchParams.get("companyId") ?? undefined,
    entityType: searchParams.get("entityType") ?? undefined,
    entityCode: searchParams.get("entityCode") ?? undefined,
    entityId: searchParams.get("entityId") ?? undefined,
    mutationId: searchParams.get("mutationId") ?? undefined,
    actorId: searchParams.get("actorId") ?? undefined,
    dateFrom: searchParams.get("dateFrom") ?? undefined,
    dateTo: searchParams.get("dateTo") ?? undefined,
    search: searchParams.get("search") ?? undefined,
  };
}

export async function handleCount(req: NextRequest): Promise<NextResponse> {
  try {
    const list = await listAuditEvents(filtersFromRequest(req));
    const response: AuditEventCountResponseDto = { count: list.totalMatching };
    return NextResponse.json(response);
  } catch (err) {
    console.error("[audit] handleCount error:", err);
    return serverError(err);
  }
}

export async function handleList(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = req.nextUrl;
    const list = await listAuditEvents({
      ...filtersFromRequest(req),
      cursor: searchParams.get("cursor") ?? undefined,
    });
    return NextResponse.json(list);
  } catch (err) {
    console.error("[audit] handleList error:", err);
    return serverError(err);
  }
}

export async function handleExportAll(req: NextRequest): Promise<NextResponse> {
  try {
    const rows = await exportAuditEvents(filtersFromRequest(req));
    return NextResponse.json(rows);
  } catch (err) {
    console.error("[audit] handleExportAll error:", err);
    return serverError(err);
  }
}

export async function handleGetById(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const event = await getAuditEvent(Number(id));
    if (!event) return notFoundError("Audit event not found");
    return NextResponse.json(event);
  } catch (err) {
    console.error("[audit] handleGetById error:", err);
    return serverError(err);
  }
}

