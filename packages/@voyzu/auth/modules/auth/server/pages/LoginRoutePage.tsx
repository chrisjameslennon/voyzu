import "server-only";

import { Suspense } from "react";

import { LoginPage } from "../../client";

export function LoginRoutePage() {
  return (
    <Suspense>
      <LoginPage />
    </Suspense>
  );
}
