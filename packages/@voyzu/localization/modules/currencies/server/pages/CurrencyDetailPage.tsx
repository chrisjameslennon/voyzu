import { pageStringParameters, type PageProps } from "@voyzu/types/page-routing";
import "server-only";

import { notFound } from "next/navigation";

import { CurrencyDetail } from "../../client";
import { getCurrency } from "../lib/currency.service";

export async function CurrencyDetailPage({ context }: PageProps) {
  const { code } = pageStringParameters(context.pathParams);
  if (!code) notFound();

  const currency = await getCurrency((code));
  if (!currency) notFound();

  return <CurrencyDetail currency={currency} />;
}
