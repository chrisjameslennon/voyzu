"use client";

import { useEffect, useRef, useState } from "react";

import { Button, Input, ValidationAlert } from "@voyzu/ui-components";
import modal from "@voyzu/ui-style/css-modules/modal.module.css";
import typography from "@voyzu/ui-style/css-modules/typography.module.css";

export function HomePageRouteModal({
  isOpen,
  initialRoute,
  onClose,
  onSaved,
}: {
  isOpen: boolean;
  initialRoute: string;
  onClose: () => void;
  onSaved: (route: string) => void;
}) {
  const [route, setRoute] = useState(initialRoute);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setRoute(initialRoute);
      setError("");
    }
  }, [initialRoute, isOpen]);

  if (!isOpen) return null;

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/package-settings/home-page", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ route }),
      });
      const body = await response.json().catch(() => null) as { route?: string; message?: string; error?: string } | null;
      if (!response.ok || !body?.route) {
        setError(body?.message ?? body?.error ?? "The home page route could not be saved");
        bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      onSaved(body.route);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={modal.backdrop}>
      <div className={modal.modal} onClick={(event) => event.stopPropagation()}>
        <div className={modal.header}>
          <h3 className={typography.contentTitle}>Set home page</h3>
          <Button variant="plain" icon="close" onClick={onClose} type="button" title="Close" />
        </div>
        <div className={modal.body} ref={bodyRef}>
          <ValidationAlert errors={error ? [error] : []} visible={Boolean(error)} onDismiss={() => setError("")} />
          <label className={modal.fieldGroup}>
            <span className={typography.fieldLabel}>Home page route</span>
            <Input value={route} onChange={(event) => setRoute(event.target.value)} placeholder="/welcome" />
            <span className={typography.fieldHelp}>Enter a registered relative Voyzu page route starting with a leading slash (/).</span>
          </label>
        </div>
        <div className={modal.footer}>
          <Button variant="cancel" onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={saving} onClick={() => { void save(); }}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
