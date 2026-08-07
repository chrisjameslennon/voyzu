"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

import { Button } from "@voyzu/ui-components";
import { Input } from "@voyzu/ui-components";
import { ValidationAlert } from "@voyzu/ui-components";
import { required, useFormValidation } from "@voyzu/ui-components";
import detailStyles from "@voyzu/ui-style/css-modules/detail.module.css";
import typography from "@voyzu/ui-style/css-modules/typography.module.css";
import localStyles from "./login.module.css";

export function LoginPage() {
  const searchParams = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const validation = useFormValidation(() => ({
    identifier: {
      label: "email or user code",
      value: identifier,
      rules: [required()],
    },
    password: {
      label: "password",
      value: password,
      rules: [required()],
    },
  }));

  const submit = async (event: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    event.preventDefault();
    setError("");
    if (!validation.attempt()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null) as { message?: string; error?: string } | null;
        setError(body?.message ?? "Sign in failed");
        return;
      }

      validation.reset();
      window.location.href = searchParams.get("next") || "/";
    } finally {
      setIsSubmitting(false);
    }
  };

  const errors = [...validation.errors, ...(error ? [error] : [])];
  const showErrors = validation.showErrors || !!error;

  return (
    <main className={localStyles.page}>
      <form className={localStyles.panel} onSubmit={submit}>
        <img
          className={localStyles.logo}
          src="/voyzu/voyzu_color_logo_transparent.png"
          alt="Voyzu"
        />
        <div className={localStyles.header}>
          <div className={detailStyles.titleIcon}>
            <span className={`material-symbols-outlined ${detailStyles.titleIconSymbol}`}>person</span>
          </div>
          <h1 className={`${typography.pageTitle} ${localStyles.title}`}>Sign in</h1>
        </div>

        <label className={localStyles.field}>
          <span className={typography.fieldLabel}>Email or User Code</span>
          <Input
            invalid={validation.hasError("identifier")}
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            autoComplete="username"
            autoFocus
          />
        </label>

        <label className={localStyles.field}>
          <span className={typography.fieldLabel}>Password</span>
          <Input
            password
            invalid={validation.hasError("password")}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
          />
        </label>

        <ValidationAlert
          errors={errors}
          visible={showErrors}
          onDismiss={() => {
            validation.dismiss();
            setError("");
          }}
        />

        <Button variant="primary" type="submit" disabled={isSubmitting} textAlign="center">
          {isSubmitting ? "Signing in" : "Sign in"}
        </Button>
      </form>
    </main>
  );
}
