"use client";

import { useEffect, useState, type ReactNode } from "react";

const VERSION_KEY = "voyzu.browserStateVersion";
const PAGE_PREFIX = "voyzu.currentPage.";

export function BrowserStateReset({ version, children }: { version: string | null; children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (version) {
      try {
        if (sessionStorage.getItem(VERSION_KEY) !== version) {
          for (const key of Object.keys(sessionStorage)) {
            if (key.startsWith(PAGE_PREFIX)) sessionStorage.removeItem(key);
          }
          sessionStorage.setItem(VERSION_KEY, version);
          // Discard old record URLs, toast parameters, and login's next target.
          if (window.location.pathname !== "/" || window.location.search || window.location.hash) {
            window.location.replace("/");
            return;
          }
        }
      } catch {
        // Browsing still works when session storage is unavailable.
      }
    }
    setReady(true);
  }, [version]);

  return ready ? children : null;
}
