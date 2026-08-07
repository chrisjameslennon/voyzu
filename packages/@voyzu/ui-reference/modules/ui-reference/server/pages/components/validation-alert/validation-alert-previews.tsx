"use client";
import { useState } from "react";
import { ValidationAlert } from "@voyzu/ui-components";
import { Button } from "@voyzu/ui-components";

export function ValidationAlertSinglePreview() {
  const [visible, setVisible] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%", maxWidth: "28rem" }}>
      <div>
        <Button variant="secondary-destructive" onClick={() => setVisible(true)}>
          Trigger validation
        </Button>
      </div>
      <ValidationAlert
        errors={["Invoice date is required."]}
        visible={visible}
        onDismiss={() => setVisible(false)}
      />
    </div>
  );
}

export function ValidationAlertMultiplePreview() {
  const [visible, setVisible] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%", maxWidth: "28rem" }}>
      <div>
        <Button variant="secondary-destructive" onClick={() => setVisible(true)}>
          Submit with errors
        </Button>
      </div>
      <ValidationAlert
        errors={[
          "Invoice date is required.",
          "At least one line item is required.",
          "Customer must be selected.",
          "Total amount must be greater than zero.",
        ]}
        visible={visible}
        onDismiss={() => setVisible(false)}
      />
    </div>
  );
}
