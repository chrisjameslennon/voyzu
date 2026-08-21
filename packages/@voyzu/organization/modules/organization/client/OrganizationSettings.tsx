"use client";

import { OrganizationAuditPanel as AuditPanel } from "@voyzu/organization/common/client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { getHasPostingsColor, getStatusSemanticColor } from "@voyzu/organization/common/client";
import { ChangeCode, ChangeCodeAvailability } from "@voyzu/organization/organization/domain/operation-policy";
import type {
  OrganizationResponseDto,
  OrganizationUpdateRequestDto,
} from "@voyzu/organization/types/modules/organization";
import { Badge } from "@voyzu/ui-components";
import { Breadcrumbs } from "@voyzu/ui-components";
import { Button } from "@voyzu/ui-components";
import { Input } from "@voyzu/ui-components";
import { Toast } from "@voyzu/ui-components";
import { ValidationAlert } from "@voyzu/ui-components";
import {
  maxLength,
  pattern,
  required,
  useFormValidation,
} from "@voyzu/ui-components";
import layoutStyles from "@voyzu/ui-layout/css-modules/detail.layout.module.css";
import detailStyles from "@voyzu/ui-style/css-modules/detail.module.css";
import typography from "@voyzu/ui-style/css-modules/typography.module.css";

interface OrganizationSettingsProps {
  organization: OrganizationResponseDto;
  pageTitle: string;
}

const CODE_PATTERN = /^[A-Z0-9_-]*$/;

export function OrganizationSettings({
  organization: initialOrganization,
  pageTitle,
}: OrganizationSettingsProps) {
  const router = useRouter();
  const [organization, setOrganization] = useState(initialOrganization);
  const [code, setCode] = useState(initialOrganization.code);
  const [organizationName, setOrganizationName] = useState(initialOrganization.organizationName);
  const [serverError, setServerError] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const codeBlockers = ChangeCode(organization, code);
  const codeChangeAvailabilityBlockers = ChangeCodeAvailability(organization);

  const validation = useFormValidation(() => ({
    code: {
      label: "code",
      value: code,
      rules: [
        required(),
        pattern(CODE_PATTERN, "Code can only contain capital letters, numbers, dashes and underscores"),
        maxLength(40, "Code must be 40 characters or less"),
      ],
    },
    organizationName: {
      label: "organization name",
      value: organizationName,
      rules: [
        required(),
        maxLength(50, "Organization name must be 50 characters or less"),
      ],
    },
  }));

  const currentErrors = [...validation.errors, ...(serverError ? [serverError] : [])];

  const save = async () => {
    setServerError("");
    if (!validation.attempt()) return;
    if (codeBlockers.length) {
      setServerError(codeBlockers.map((blocker) => blocker.message).join("; "));
      return;
    }

    const payload: OrganizationUpdateRequestDto = {
      code,
      organizationName,
    };

    setIsSaving(true);
    try {
      const response = await fetch("/api/organization", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { message?: string; error?: string }
          | null;
        setServerError(body?.message ?? "An unexpected error occurred");
        return;
      }

      const updated = (await response.json()) as OrganizationResponseDto;
      setOrganization(updated);
      setCode(updated.code);
      setOrganizationName(updated.organizationName);
      validation.reset();
      setToastMessage("Updated organization");
      setToastVisible(true);
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`${layoutStyles.detailView} ${layoutStyles.detailViewWithStatusRail}`}>
      <header className={layoutStyles.detailHeader}>
        <div className={layoutStyles.slotBreadcrumb}>
          <Breadcrumbs />
        </div>
        <div className={layoutStyles.slotTitle}>
          <div className={detailStyles.title}>
            <div className={detailStyles.titleIcon}>
              <span className={`material-symbols-outlined ${detailStyles.titleIconSymbol}`}>
                hub
              </span>
            </div>
            <div>
              <h1 className={`${typography.pageTitle} ${layoutStyles.pageTitleResponsive}`}>
                {pageTitle}
              </h1>
              <p className={typography.headingByline}>
                Your organization is the highest level of grouping in Voyzu. A Voyzu instance
                has only one organization and all companies belong to that organization.
                Organizations cannot be created or deleted.
              </p>
            </div>
          </div>
        </div>
        <div className={layoutStyles.slotActions}>
          <div className={detailStyles.headerActions}>
            <Button
              variant="primary"
              icon="save"
              onClick={save}
              disabled={isSaving}
            >
              Save
            </Button>
          </div>
        </div>
      </header>

      <div className={layoutStyles.slotAlert}>
        <ValidationAlert
          errors={currentErrors}
          visible={validation.showErrors || !!serverError}
          onDismiss={() => {
            validation.dismiss();
            setServerError("");
          }}
        />
      </div>

      <main className={layoutStyles.mainSection}>
        <section className={detailStyles.card}>
          <h2 className={typography.sectionHeading}>Organization Details</h2>
          <div className={detailStyles.formGrid}>
            <label className={detailStyles.fieldGroup}>
              <span className={typography.fieldLabel}>Code</span>
              <Input
                invalid={validation.hasError("code")}
                value={code}
                maxLength={40}
                disabled={codeChangeAvailabilityBlockers.length > 0}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
              />
            </label>
            <label className={detailStyles.fieldGroup}>
              <span className={typography.fieldLabel}>Organization Name</span>
              <Input
                invalid={validation.hasError("organizationName")}
                value={organizationName}
                onChange={(event) => setOrganizationName(event.target.value)}
                maxLength={50}
              />
            </label>
          </div>
        </section>
      </main>

      <aside className={layoutStyles.statusSection}>
        <div className={detailStyles.card}>
          <div className={detailStyles.fieldGroup}>
            <label className={typography.fieldLabel}>Status</label>
            <Badge variant="soft" size="x-large" color={getStatusSemanticColor(organization.status)}>
              {organization.status}
            </Badge>
          </div>
          {organization.hasPostings ? (
            <div className={detailStyles.fieldGroup}>
              <Badge variant="soft" size="medium" customColors={getHasPostingsColor(organization.hasPostings)}>
                HAS POSTINGS
              </Badge>
            </div>
          ) : null}
        </div>
        <AuditPanel
          id={organization.id}
          creationDate={organization.audit.created.date}
          updatedDate={organization.audit.updated.date}
          creationActorType={organization.audit.created.actorType}
          creationUser={organization.audit.created.user}
          updatedActorType={organization.audit.updated.actorType}
          updatedUser={organization.audit.updated.user}
          auditHref="/settings/audit"
          mutationId={organization.audit.updated.mutationId ?? organization.audit.created.mutationId}
        />
      </aside>

      <Toast
        message={toastMessage}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
    </div>
  );
}

