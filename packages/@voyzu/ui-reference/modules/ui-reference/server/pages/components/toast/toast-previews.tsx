"use client";
import { useState } from "react";
import { Toast } from "@voyzu/ui-components";
import { Button } from "@voyzu/ui-components";

const MESSAGES = [
  "Invoice INV-2025-001 created successfully.",
  "Contact details updated.",
  "File export complete — 847 records exported.",
  "Payment of $4,200.00 recorded.",
];

export function ToastBasicPreview() {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "flex-start" }}>
      <Button
        variant="primary"
        onClick={() => setIsVisible(true)}
        disabled={isVisible}
      >
        Show toast
      </Button>
      <p style={{ fontSize: "0.75rem", color: "var(--voyzu-color-text-tertiary)", margin: 0 }}>
        The toast auto-dismisses after 5 seconds.
      </p>
      <Toast
        isVisible={isVisible}
        onClose={() => setIsVisible(false)}
        message="Invoice INV-2025-001 created successfully."
      />
    </div>
  );
}

export function ToastMessageCyclePreview() {
  const [isVisible, setIsVisible] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);

  const showNext = () => {
    setMsgIndex((i) => (i + 1) % MESSAGES.length);
    setIsVisible(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "flex-start" }}>
      <Button variant="secondary" onClick={showNext}>
        Show next message
      </Button>
      <p style={{ fontSize: "0.75rem", color: "var(--voyzu-color-text-tertiary)", margin: 0 }}>
        Cycles through {MESSAGES.length} sample messages.
      </p>
      <Toast
        isVisible={isVisible}
        onClose={() => setIsVisible(false)}
        message={MESSAGES[msgIndex]!}
      />
    </div>
  );
}
