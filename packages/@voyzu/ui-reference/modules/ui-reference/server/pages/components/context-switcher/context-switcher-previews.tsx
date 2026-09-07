"use client";

import { useState } from "react";
import { ContextSwitcher } from "@voyzu/ui-components";
import detailStyles from "@voyzu/ui-style/css-modules/detail.module.css";

const projects = [
  { id: "website", name: "Website", subtitle: "Customer experience" },
  { id: "warehouse", name: "Warehouse rollout", subtitle: "Operations" },
  { id: "archive", name: "Previous launch", subtitle: "Archived", inactive: true, disabled: true },
];

export function ContextSwitcherPreview() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  return <div className={detailStyles.stack}>
    <ContextSwitcher label="Project" options={projects} selectedId={selectedId} onSelect={setSelectedId} />
    <p>Selected project: {selectedId ?? "None"}</p>
    <ContextSwitcher label="Project" collapsed options={projects} selectedId={selectedId} onSelect={setSelectedId} />
    <ContextSwitcher label="Workspace" options={[]} emptyMessage="No workspaces available" onSelect={() => {}} />
    <ContextSwitcher label="Warehouse" disabled options={[]} onSelect={() => {}} />
  </div>;
}
