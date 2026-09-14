import { pageStringParameters, type PageProps } from "@voyzu/types/page-routing";
import "server-only";

import { notFound } from "next/navigation";

import { PartyDetail } from "../../client";
import { getParty } from "../lib/party.service";

export async function PartyDetailPage({ context }: PageProps) {
  const { code } = pageStringParameters(context.pathParams);
  if (!code) notFound();

  const party = await getParty((code));
  if (!party) notFound();

  return <PartyDetail party={party} />;
}
