"use client";
import { useState } from "react";
import { DatePicker } from "@voyzu/ui-components";

export function DatePickerBasicPreview() {
  const [value, setValue] = useState("2025-04-15");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%", maxWidth: "16rem" }}>
      <DatePicker value={value} onChange={setValue} placeholder="Select a date" />
      {value && (
        <p style={{ fontSize: "0.75rem", color: "var(--voyzu-color-text-tertiary)", margin: 0 }}>
          Selected: <strong>{value}</strong>
        </p>
      )}
    </div>
  );
}

export function DatePickerClearablePreview() {
  const [value, setValue] = useState("2025-06-30");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%", maxWidth: "16rem" }}>
      <DatePicker value={value} onChange={setValue} placeholder="Select a date" clearable />
      <p style={{ fontSize: "0.75rem", color: "var(--voyzu-color-text-tertiary)", margin: 0 }}>
        Value: <strong>{value || "(none)"}</strong>
      </p>
    </div>
  );
}

export function DatePickerErrorPreview() {
  const [value, setValue] = useState("");
  const hasError = !value;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%", maxWidth: "16rem" }}>
      <DatePicker value={value} onChange={setValue} placeholder="Select a date" hasError={hasError} />
      {hasError && (
        <p style={{ fontSize: "0.75rem", color: "var(--voyzu-color-danger)", margin: 0, fontWeight: 500 }}>
          Invoice date is required.
        </p>
      )}
    </div>
  );
}

export function DatePickerYearRangePreview() {
  const [value, setValue] = useState("");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%", maxWidth: "16rem" }}>
      <DatePicker
        value={value}
        onChange={setValue}
        placeholder="Select incorporation date"
        clearable
        preYearOffset={80}
        postYearOffset={0}
      />
      <p style={{ fontSize: "0.75rem", color: "var(--voyzu-color-text-tertiary)", margin: 0 }}>
        Year range: 80 years back, current year only (suitable for incorporation dates).
      </p>
    </div>
  );
}

export function DatePickerMinMaxPreview() {
  const [value, setValue] = useState("2026-04-15");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%", maxWidth: "16rem" }}>
      <DatePicker
        value={value}
        onChange={setValue}
        minDate="2026-04-01"
        maxDate="2026-06-30"
        clearable={false}
      />
      <p style={{ fontSize: "0.75rem", color: "var(--voyzu-color-text-tertiary)", margin: 0 }}>
        Value: <strong>{value}</strong>. Dates outside 1 Apr – 30 Jun 2026 are disabled.
      </p>
    </div>
  );
}
