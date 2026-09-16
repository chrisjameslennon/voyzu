"use client";
import { useState } from "react";
import { Button, DropdownMenu, SplitButton } from "@voyzu/ui-components";
export function DropdownButtonPreview() {
  const [message, setMessage] = useState("Choose an action.");
  return <div><div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>{(["primary", "secondary"] as const).map((variant) => <DropdownMenu key={variant} trigger={<Button variant={variant}>Actions <span className="material-symbols-outlined" aria-hidden="true">expand_more</span></Button>} items={[
    { value: "activate", label: "Activate", icon: "check_circle", onSelect: () => setMessage("Activate selected") },
    { value: "deactivate", label: "Deactivate", icon: "block", onSelect: () => setMessage("Deactivate selected") },
    { value: "category", label: "Change Category", icon: "sync_alt", onSelect: () => setMessage("Change Category selected") },
  ]} />)}</div><p role="status">{message}</p></div>;
}
export function SplitButtonPreview() {
  const [message, setMessage] = useState("The main button runs immediately; the arrow opens alternatives.");
  return <div><div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>{(["primary", "secondary"] as const).map((variant) => <SplitButton key={variant} variant={variant} label="Add Product" icon="add" onClick={() => setMessage("Normal product creation opened")} items={[{ label: "Add from Inventory", icon: "inventory_2", onClick: () => setMessage("Inventory product creation opened") }]} />)}</div><p role="status">{message}</p></div>;
}
