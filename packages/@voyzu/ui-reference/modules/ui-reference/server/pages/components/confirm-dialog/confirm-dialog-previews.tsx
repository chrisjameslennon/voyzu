"use client";
import { useState } from "react";
import { ConfirmDialog } from "@voyzu/ui-components";
import { Button } from "@voyzu/ui-components";

export function ConfirmDialogDangerPreview() {
  const [isOpen, setIsOpen] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleConfirm = () => {
    setIsOpen(false);
    setResult("Invoice deleted.");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "flex-start" }}>
      <Button variant="secondary-destructive" onClick={() => { setIsOpen(true); setResult(null); }}>
        Delete invoice
      </Button>
      {result && (
        <p style={{ fontSize: "0.8125rem", color: "var(--voyzu-color-text-secondary)", margin: 0 }}>{result}</p>
      )}
      <ConfirmDialog
        isOpen={isOpen}
        title="Delete invoice?"
        message="This action cannot be undone. Invoice INV-2025-003 and all associated line items will be permanently removed."
        confirmLabel="Delete invoice"
        confirmVariant="danger"
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
      />
    </div>
  );
}

export function ConfirmDialogPrimaryPreview() {
  const [isOpen, setIsOpen] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleConfirm = () => {
    setIsOpen(false);
    setResult("Submitted for approval.");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "flex-start" }}>
      <Button variant="primary" onClick={() => { setIsOpen(true); setResult(null); }}>
        Submit for approval
      </Button>
      {result && (
        <p style={{ fontSize: "0.8125rem", color: "var(--voyzu-color-text-secondary)", margin: 0 }}>{result}</p>
      )}
      <ConfirmDialog
        isOpen={isOpen}
        title="Submit for approval?"
        message="This invoice will be sent to the finance team for review. You will not be able to edit it while it is pending approval."
        confirmLabel="Submit"
        confirmVariant="primary"
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
