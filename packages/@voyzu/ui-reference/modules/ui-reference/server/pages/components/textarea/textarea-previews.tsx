"use client";

import { useState } from "react";
import { Textarea } from "@voyzu/ui-components";
import detailStyles from "@voyzu/ui-style/css-modules/detail.module.css";

export function TextareaPreview() {
  const [value, setValue] = useState("");
  return <div className={detailStyles.stack}>
    <label className={detailStyles.fieldGroup}>Notes
      <Textarea value={value} onChange={(event) => setValue(event.target.value)} placeholder="Enter notes..." />
    </label>
    <label className={detailStyles.fieldGroup}>Invalid
      <Textarea invalid aria-describedby="textarea-error" defaultValue="" />
      <span id="textarea-error">Notes are required.</span>
    </label>
    <label className={detailStyles.fieldGroup}>Disabled — selectable and copyable
      <Textarea disabled value="Existing notes remain available to copy." rows={2} />
    </label>
    <label className={detailStyles.fieldGroup}>Read only
      <Textarea readOnly value="Read-only notes." rows={2} />
    </label>
    <label className={detailStyles.fieldGroup}>Longer entry
      <Textarea rows={6} placeholder="Use rows to choose the initial height." />
    </label>
  </div>;
}
