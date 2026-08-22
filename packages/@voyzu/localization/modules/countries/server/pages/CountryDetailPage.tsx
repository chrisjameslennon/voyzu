import "server-only";

import { notFound } from "next/navigation";

import { CountryDetail } from "../../client";
import { getCountry } from "../lib/country.service";

interface CountryDetailPageProps {
  code?: string;
}

export async function CountryDetailPage({ code }: CountryDetailPageProps) {
  if (!code) notFound();

  const country = await getCountry(decodeURIComponent(code));
  if (!country) notFound();

  return <CountryDetail country={country} />;
}
