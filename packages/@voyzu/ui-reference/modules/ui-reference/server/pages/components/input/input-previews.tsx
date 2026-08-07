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
