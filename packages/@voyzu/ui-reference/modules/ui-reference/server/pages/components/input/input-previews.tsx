"use client";

import { useState } from "react";
import { Badge, Input } from "@voyzu/ui-components";

export function BasicInputPreview() {
  const [value, setValue] = useState("");

  return (
    <div style={{ width: 320 }}>
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Display name"
      />
    </div>
  );
}

export function SearchIconInputPreview() {
  const [value, setValue] = useState("");

  return (
    <div style={{ width: 320 }}>
      <Input
        search
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search companies..."
      />
    </div>
  );
}

export function RightSearchIconInputPreview() {
  const [value, setValue] = useState("");

  return (
    <div style={{ width: 320 }}>
      <Input
        search
        position="right"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search users..."
      />
    </div>
  );
}

export function PasswordInputPreview() {
  const [value, setValue] = useState("");

  return (
    <div style={{ width: 320 }}>
      <Input
        password
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Password"
      />
    </div>
  );
}

export function InvalidInputPreview() {
  const [value, setValue] = useState("");

  return (
    <div style={{ width: 320 }}>
      <Input
        invalid
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Company name"
      />
    </div>
  );
}

export function DisabledInputPreview() {
  return (
    <div style={{ width: 320 }}>
      <Input value="Acme New Zealand Ltd" disabled />
    </div>
  );
}

export function BadgeInputPreview() {
  return (
    <div style={{ width: 320 }}>
      <Input
        value="Accounts Receivable"
        badge={<Badge variant="soft" size="x-small" color="info">AR</Badge>}
        disabled
      />
    </div>
  );
}

export function DecimalInputPreview() {
  const [whole, setWhole] = useState("12");
  const [price, setPrice] = useState("39.9");
  const [rate, setRate] = useState("1.234");
  return <div style={{ display: "grid", gap: "1rem", maxWidth: 320 }}>
    <label>Whole numbers (0 decimals)<Input type="number" decimalPlaces={0} value={whole} onChange={(event) => setWhole(event.target.value)} /></label>
    <label>Price (2 decimals)<Input type="number" decimalPlaces={2} min={0} value={price} onChange={(event) => setPrice(event.target.value)} /></label>
    <label>Rate (4 decimals)<Input type="number" decimalPlaces={4} value={rate} onChange={(event) => setRate(event.target.value)} /></label>
  </div>;
}
