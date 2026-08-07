"use client";

import { useState } from "react";
import { Button, Checkbox, Input, ValidationAlert, maxLength, pattern, required, useFormValidation } from "@voyzu/ui-components";
import typography from "@voyzu/ui-style/css-modules/typography.module.css";

const INITIAL = { title: "", amount: "", reference: "", acceptTerms: false };

export function ValidationDemo() {
  const [form, setForm] = useState(INITIAL);
  const [submitted, setSubmitted] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const validation = useFormValidation(() => ({
    title: { label: "title", value: form.title, rules: [required()] },
    amount: {
      label: "amount",
      value: form.amount,
      rules: [
        required(),
        {
          kind: "format" as const,
          test: (v) => /^\d+(\.\d{1,2})?$/.test(v) && parseFloat(v) > 0,
          message: "Amount must be a positive number (e.g. 249.00)",
        },
      ],
    },
    reference: {
      label: "reference",
      value: form.reference,
      rules: [
        maxLength(12, "Reference must be 12 characters or less"),
        pattern(/^[A-Z0-9-]*$/, "Reference must contain only uppercase letters, numbers, and dashes"),
      ],
    },
    acceptTerms: {
      label: "confirmation that you accept the terms and conditions",
      value: form.acceptTerms ? "accepted" : "",
      rules: [required()],
    },
  }));

  if (submitted) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem 1.25rem", background: "var(--voyzu-color-success-bg, #f0fdf4)", border: "1px solid var(--voyzu-color-success-text)", borderRadius: 8 }}>
        <span className="material-symbols-outlined" style={{ color: "var(--voyzu-color-success-text)", fontSize: "1.25rem" }}>check_circle</span>
        <span style={{ flex: 1, fontSize: "0.875rem", fontWeight: 500 }}>Form submitted successfully.</span>
        <button
          onClick={() => { setSubmitted(false); validation.reset(); setForm(INITIAL); }}
          style={{ fontSize: "0.8125rem", color: "var(--voyzu-color-link)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}
        >
          Reset
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxWidth: "28rem" }}>
      <ValidationAlert errors={validation.errors} visible={validation.showErrors} onDismiss={validation.dismiss} />

      <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
        <label className={typography.fieldLabel} htmlFor="vd-title">Title</label>
        <Input
          id="vd-title"
          invalid={validation.hasError("title")}
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="e.g. Office Supplies — April"
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
        <label className={typography.fieldLabel} htmlFor="vd-amount">Amount</label>
        <Input
          id="vd-amount"
          type="number"
          invalid={validation.hasError("amount")}
          value={form.amount}
          onChange={(e) => set("amount", e.target.value)}
          placeholder="e.g. 249.00"
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
        <label className={typography.fieldLabel} htmlFor="vd-reference">
          Reference{" "}
          <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, fontSize: "0.75rem", color: "var(--voyzu-color-text-secondary)" }}>(optional)</span>
        </label>
        <Input
          id="vd-reference"
          invalid={validation.hasError("reference")}
          value={form.reference}
          onChange={(e) => set("reference", e.target.value.toUpperCase())}
          placeholder="e.g. EXP-001"
          maxLength={12}
        />
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.875rem", color: "var(--voyzu-color-text)", userSelect: "none" }}>
        <Checkbox
          checked={form.acceptTerms}
          required
          invalid={validation.hasError("acceptTerms")}
          onChange={(checked) => set("acceptTerms", checked)}
        />
        Accept terms and conditions
      </label>

      <div>
        <Button
          variant="primary"
          onClick={() => { if (validation.attempt()) setSubmitted(true); }}
        >
          Submit Expense
        </Button>
      </div>
    </div>
  );
}
