import type { ReactNode } from "react";
import type { Viewport } from "next";
import { getDb } from "@voyzu/capability/db";
import { BrowserStateReset } from "./BrowserStateReset";

import "@voyzu/ui-style/css/reset.css";
import "@voyzu/ui-layout/css/breakpoints.css";
import "@voyzu/ui-layout/css/layout-grid.css";
import "@voyzu/ui-style/css/design-tokens.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { rows } = await getDb().query(
    "SELECT value FROM voyzu_settings WHERE code = 'BROWSER_STATE_VERSION'",
  );
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Manrope:wght@700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          fontFamily: "var(--voyzu-font-family)",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        }}
      >
        <BrowserStateReset version={typeof rows[0]?.value === "string" ? rows[0].value : null}>{children}</BrowserStateReset>
      </body>
    </html>
  );
}
