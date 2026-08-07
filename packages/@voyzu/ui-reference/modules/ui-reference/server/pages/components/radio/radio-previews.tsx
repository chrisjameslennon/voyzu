"use client";
import { useState } from "react";
import { Radio } from "@voyzu/ui-components";
import { RadioGroup } from "@voyzu/ui-components";

export function RadioGroupPreview() {
  const [value, setValue] = useState("bank_transfer");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <RadioGroup
        name="payment-method"
        value={value}
        onChange={setValue}
        options={[
          { value: "credit_card", label: "Credit card" },
          { value: "bank_transfer", label: "Bank transfer" },
          { value: "direct_debit", label: "Direct debit" },
          { value: "cash", label: "Cash" },
        ]}
      />
      <p style={{ fontSize: "0.75rem", color: "var(--voyzu-color-text-tertiary)", margin: 0 }}>
        Selected: <strong>{value}</strong>
      </p>
    </div>
  );
}

export function RadioIndividualPreview() {
  const [value, setValue] = useState<"monthly" | "annually">("monthly");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <fieldset style={{ border: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <legend style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--voyzu-color-text-label)", marginBottom: "0.5rem" }}>
          Billing cycle
        </legend>
        {(["monthly", "annually"] as const).map((opt) => (
          <label
            key={opt}
            style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", cursor: "pointer", fontSize: "0.875rem" }}
          >
            <Radio
              name="billing"
              value={opt}
              checked={value === opt}
              onChange={() => setValue(opt)}
              style={{ marginTop: "0.1rem" }}
            />
            <span>
              <strong style={{ display: "block", fontSize: "0.875rem" }}>
                {opt === "monthly" ? "Monthly" : "Annually"}
              </strong>
              <span style={{ fontSize: "0.75rem", color: "var(--voyzu-color-text-secondary)" }}>
                {opt === "monthly" ? "Billed each month. Cancel any time." : "Save 20% — billed once per year."}
              </span>
            </span>
          </label>
        ))}
      </fieldset>
    </div>
  );
}

export function RadioDisabledPreview() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <label style={{ display: "flex", alignItems: "center", gap: "0.625rem", fontSize: "0.875rem", opacity: 0.55, cursor: "not-allowed" }}>
        <Radio name="disabled-demo" value="a" checked={false} onChange={() => {}} disabled />
        Option A — disabled unchecked
      </label>
      <label style={{ display: "flex", alignItems: "center", gap: "0.625rem", fontSize: "0.875rem", opacity: 0.55, cursor: "not-allowed" }}>
        <Radio name="disabled-demo" value="b" checked={true} onChange={() => {}} disabled />
        Option B — disabled checked
      </label>
    </div>
  );
}
