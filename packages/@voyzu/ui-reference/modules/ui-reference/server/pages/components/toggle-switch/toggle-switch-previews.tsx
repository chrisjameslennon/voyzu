"use client";
import { useState } from "react";
import { ToggleSwitch } from "@voyzu/ui-components";

export function ToggleSwitchBasicPreview() {
  const [checked, setChecked] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <ToggleSwitch checked={checked} onChange={setChecked} />
        <span style={{ fontSize: "0.875rem" }}>{checked ? "Enabled" : "Disabled"}</span>
      </div>
    </div>
  );
}

export function ToggleSwitchGroupPreview() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    twoFactor: false,
    autoApprove: true,
    darkMode: false,
  });

  const toggle = (key: keyof typeof settings) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  const rows: { key: keyof typeof settings; label: string; description: string }[] = [
    { key: "emailNotifications", label: "Email notifications", description: "Receive alerts for new invoices and payments" },
    { key: "twoFactor", label: "Two-factor authentication", description: "Require a code from your authenticator app on login" },
    { key: "autoApprove", label: "Auto-approve small payments", description: "Automatically approve payments under $100" },
    { key: "darkMode", label: "Dark mode", description: "Switch to the dark colour scheme" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0", width: "100%", maxWidth: "32rem" }}>
      {rows.map((row, i) => (
        <div
          key={row.key}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            padding: "0.875rem 0",
            borderBottom: i < rows.length - 1 ? "1px solid var(--voyzu-color-border)" : "none",
          }}
        >
          <div>
            <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 500 }}>{row.label}</p>
            <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--voyzu-color-text-secondary)", marginTop: "0.125rem" }}>
              {row.description}
            </p>
          </div>
          <ToggleSwitch checked={settings[row.key]} onChange={() => toggle(row.key)} />
        </div>
      ))}
    </div>
  );
}

export function ToggleSwitchDisabledPreview() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <ToggleSwitch checked={false} onChange={() => {}} disabled />
        <span style={{ fontSize: "0.875rem", color: "var(--voyzu-color-text-tertiary)" }}>Disabled — off</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <ToggleSwitch checked={true} onChange={() => {}} disabled />
        <span style={{ fontSize: "0.875rem", color: "var(--voyzu-color-text-tertiary)" }}>Disabled — on</span>
      </div>
    </div>
  );
}
