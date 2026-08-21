import "server-only";

import { notFound } from "next/navigation";

import { CurrencyDetail } from "../../client";
import { getCurrency } from "../lib/currency.service";

interface CurrencyDetailPageProps {
  code?: string;
}

export async function CurrencyDetailPage({ code }: CurrencyDetailPageProps) {
  if (!code) notFound();

  const currency = await getCurrency(decodeURIComponent(code));
  if (!currency) notFound();

  return <CurrencyDetail currency={currency} />;
}
