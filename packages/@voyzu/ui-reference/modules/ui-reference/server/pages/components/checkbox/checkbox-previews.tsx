"use client";
import { useState } from "react";
import { Checkbox } from "@voyzu/ui-components";

export function CheckboxBasicPreview() {
  const [checked, setChecked] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <label style={{ display: "flex", alignItems: "center", gap: "0.625rem", cursor: "pointer", fontSize: "0.875rem" }}>
        <Checkbox checked={checked} onChange={setChecked} />
        Subscribe to email notifications
      </label>
      <p style={{ fontSize: "0.75rem", color: "var(--voyzu-color-text-tertiary)", margin: 0 }}>
        State: <strong>{checked ? "checked" : "unchecked"}</strong>
      </p>
    </div>
  );
}

export function CheckboxGroupPreview() {
  const [selected, setSelected] = useState<Set<string>>(new Set(["email"]));

  const toggle = (value: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const options = [
    { value: "email", label: "Email notifications" },
    { value: "sms", label: "SMS alerts" },
    { value: "push", label: "Push notifications" },
    { value: "weekly", label: "Weekly digest" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {options.map((opt) => (
        <label
          key={opt.value}
          style={{ display: "flex", alignItems: "center", gap: "0.625rem", cursor: "pointer", fontSize: "0.875rem" }}
        >
          <Checkbox checked={selected.has(opt.value)} onChange={() => toggle(opt.value)} />
          {opt.label}
        </label>
      ))}
    </div>
  );
}

export function CheckboxDisabledPreview() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <label style={{ display: "flex", alignItems: "center", gap: "0.625rem", fontSize: "0.875rem", cursor: "not-allowed", opacity: 0.55 }}>
        <Checkbox checked={false} onChange={() => {}} disabled />
        Disabled unchecked
      </label>
      <label style={{ display: "flex", alignItems: "center", gap: "0.625rem", fontSize: "0.875rem", cursor: "not-allowed", opacity: 0.55 }}>
        <Checkbox checked={true} onChange={() => {}} disabled />
        Disabled checked
      </label>
    </div>
  );
}

export function CheckboxInvalidPreview() {
  const [checked, setChecked] = useState(false);

  return (
    <label style={{ display: "flex", alignItems: "center", gap: "0.625rem", cursor: "pointer", fontSize: "0.875rem" }}>
      <Checkbox checked={checked} invalid={!checked} required onChange={setChecked} />
      Accept terms and conditions (required)
    </label>
  );
}
