"use client";

import { useState } from "react";

import { Alert, type AlertColor, type AlertVariant } from "@voyzu/ui-components";
import { Button } from "@voyzu/ui-components";

const COLORS: AlertColor[] = ["brand", "info", "success", "warning", "danger", "neutral", "plain"];
const VARIANTS: AlertVariant[] = ["soft", "solid", "outline"];

export function AlertColorPreview() {
  return (
    <div style={{ display: "grid", gap: "0.75rem", width: "100%", maxWidth: "44rem" }}>
      {COLORS.map((color) => (
        <Alert
          key={color}
          variant="soft"
          color={color}
          title={`${color[0]?.toUpperCase()}${color.slice(1)} alert`}
          text={
            <>
              This alert uses the {color} semantic feedback tokens.{" "}
              <a href="/css-variables/colors">View color tokens</a>.
            </>
          }
        />
      ))}
    </div>
  );
}

export function AlertVariantPreview() {
  return (
    <div style={{ display: "grid", gap: "0.75rem", width: "100%", maxWidth: "44rem" }}>
      {VARIANTS.map((variant) => (
        <Alert
          key={variant}
          variant={variant}
          color="info"
          title={`${variant[0]?.toUpperCase()}${variant.slice(1)} variant`}
          text="Use the variant to control visual emphasis without changing the semantic meaning."
        />
      ))}
    </div>
  );
}

export function AlertDismissablePreview() {
  const [key, setKey] = useState(0);

  return (
    <div style={{ display: "grid", gap: "0.75rem", width: "100%", maxWidth: "44rem" }}>
      <div>
        <Button variant="secondary" onClick={() => setKey((value) => value + 1)}>
          Reset alert
        </Button>
      </div>
      <Alert
        key={key}
        variant="soft"
        color="brand"
        title="Brand notice"
        text={
          <>
            This dismissable alert supports inline links, such as{" "}
            <a href="/components/badge">Badge reference</a>.
          </>
        }
        dismissable
      />
    </div>
  );
}
