import "server-only";

import { notFound } from "next/navigation";
import { resolveExternalUrl } from "@voyzu/ui-surface";

import { CountryDetail } from "../../client";
import { getCountry } from "../lib/country.service";

interface CountryDetailPageProps {
  code?: string;
  surface?: { helpBaseUrl?: string };
}

export async function CountryDetailPage({ code, surface }: CountryDetailPageProps) {
  if (!code) notFound();

  const country = await getCountry(decodeURIComponent(code));
  if (!country) notFound();

  const taxHelpUrl = surface?.helpBaseUrl
    ? resolveExternalUrl(surface.helpBaseUrl, "concepts/tax")
    : undefined;

  return <CountryDetail country={country} taxHelpUrl={taxHelpUrl} />;
}
