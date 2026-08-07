"use client";

import { useRouter } from "next/navigation";
import { Button } from "@voyzu/ui-components";
import {
  detailBackHrefFromSearchParams,
  type DetailBackSource,
} from "../detail-back-target";

export interface DetailBackButtonProps {
  fallbackHref: string;
  from?: DetailBackSource;
  fromCode?: string;
  preserveSearchParams?: boolean;
}

export function DetailBackButton({
  fallbackHref,
  from,
  fromCode,
  preserveSearchParams = false,
}: DetailBackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    const backHref = detailBackHrefFromSearchParams({
      searchParams: new URLSearchParams(window.location.search),
      fallbackHref,
      preserveSearchParams,
      from,
      fromCode,
    });
    router.push(backHref);
  };

  return (
    <Button variant="cancel" icon="arrow_back" onClick={handleBack}>
      Back
    </Button>
  );
}
