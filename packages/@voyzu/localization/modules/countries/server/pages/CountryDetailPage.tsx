import { pageStringParameters, type PageProps } from "@voyzu/types/page-routing";
import "server-only";

import { notFound } from "next/navigation";

import { CountryDetail } from "../../client";
import { getCountry } from "../lib/country.service";

export async function CountryDetailPage({ context }: PageProps) {
  const { code } = pageStringParameters(context.pathParams);
  if (!code) notFound();

  const country = await getCountry((code));
  if (!country) notFound();

  return <CountryDetail country={country} />;
}
