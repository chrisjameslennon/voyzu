"use client";

import { SplitButton } from "@voyzu/ui-components";

export function SplitButtonPrimaryPreview() {
  return (
    <SplitButton
      variant="primary"
      label="New Journal"
      icon="add"
      onClick={() => {}}
      items={[
        { label: "Standard Journal", icon: "edit", onClick: () => {} },
        { label: "FX Journal", icon: "currency_exchange", onClick: () => {} },
      ]}
    />
  );
}

export function SplitButtonSecondaryPreview() {
  return (
    <SplitButton
      variant="secondary"
      label="Export"
      icon="file_download"
      onClick={() => {}}
      items={[
        { label: "Current page", icon: "visibility", onClick: () => {} },
        { label: "Full dataset", icon: "database", onClick: () => {} },
      ]}
    />
  );
}

export function SplitButtonDisabledPreview() {
  return (
    <SplitButton
      variant="primary"
      label="New Journal"
      icon="add"
      onClick={() => {}}
      disabled
      items={[
        { label: "Standard Journal", icon: "edit", onClick: () => {} },
        { label: "FX Journal", icon: "currency_exchange", onClick: () => {} },
      ]}
    />
  );
}
