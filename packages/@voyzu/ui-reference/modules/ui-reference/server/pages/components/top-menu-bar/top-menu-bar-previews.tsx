"use client";

import { useState } from "react";
import { TopMenuBar, type NavSection } from "@voyzu/ui-components";

const NAV_SECTIONS: NavSection[] = [
  { label: "Finance",      landingPath: "/finance",      items: [] },
  { label: "Organization", landingPath: "/organization", items: [] },
  { label: "Accounts",     landingPath: "/accounts",     items: [] },
  { label: "Security",     landingPath: "/security",     items: [] },
];

export function TopMenuBarBasicPreview() {
  const [activeItem, setActiveItem] = useState("Finance");
  return (
    <TopMenuBar
      sections={NAV_SECTIONS}
      activeItem={activeItem}
      onSelect={setActiveItem}
      helpUrl="https://voyzu.gitbook.io/docs/"
      logoSrc="/voyzu/voyzu_color_logo_transparent.png"
    />
  );
}
