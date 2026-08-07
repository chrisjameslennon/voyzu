import { ResponseExample, TypeScriptExample } from "@voyzu/api-reference/client/components";
import { PropertiesPanel, TabGroup, type JsonSchema } from "@voyzu/ui-components";

import styles from "./companies.module.css";

const auditResponseSchema: JsonSchema = {
  type: "object",
  required: ["audit"],
  properties: {
    audit: {
      type: "object",
      description: "Audit metadata returned on read response DTOs.",
      required: ["created", "updated"],
      properties: {
        created: {
          type: "object",
          description: "Details of the operation that created the record.",
          required: ["date", "via"],
          properties: {
            date: {
              type: "string",
              description: "Date and time when the record was created.",
            },
            via: {
              type: "string",
              enum: ["APP", "API", "SYSTEM"],
              description: "Channel that created the record.",
            },
            user: {
              type: "object",
              nullable: true,
              description: "User associated with the create operation, when available.",
              properties: {
                id: {
                  type: "number",
                  description: "Unique numeric identifier for the user.",
                },
                code: {
                  type: "string",
                  description: "Stable user code.",
                },
                displayName: {
                  type: "string",
                  description: "User display name.",
                },
              },
            },
            mutationId: {
              type: "string",
              nullable: true,
              description: "Mutation identifier linking audit events created by the same operation.",
            },
          },
        },
        updated: {
          type: "object",
          description: "Details of the operation that last updated the record.",
          required: ["date", "via"],
          properties: {
            date: {
              type: "string",
              description: "Date and time when the record was last updated.",
            },
            via: {
              type: "string",
              enum: ["APP", "API", "SYSTEM"],
              description: "Channel that last updated the record.",
            },
            user: {
              type: "object",
              nullable: true,
              description: "User associated with the update operation, when available.",
              properties: {
                id: {
                  type: "number",
                  description: "Unique numeric identifier for the user.",
                },
                code: {
                  type: "string",
                  description: "Stable user code.",
                },
                displayName: {
                  type: "string",
                  description: "User display name.",
                },
              },
            },
            mutationId: {
              type: "string",
              nullable: true,
              description: "Mutation identifier linking audit events created by the same operation.",
            },
          },
        },
      },
    },
  },
};

const auditResponseExample = {
  audit: {
    created: {
      date: "2026-07-05T22:26:42.000Z",
      via: "SYSTEM",
      user: null,
      mutationId: "e73d7a47-0817-4350-a51b-1ddf2541547b",
    },
    updated: {
      date: "2026-07-09T20:58:12.000Z",
      via: "API",
      user: {
        id: 10000,
        code: "CHRIS",
        displayName: "Chris Lennon",
      },
      mutationId: "c01d933e-b40c-424c-be7c-e8204af83989",
    },
  },
};

const auditResponseTypescript = {
  name: "AuditMetadataDto",
  sourceFile: "lib/types/src/modules/core/audit.ts",
  typescript: `import type { ActorType } from "./audit";

export interface AuditUserDto {
  /** Unique numeric identifier for the user. */
  id: number;
  /** Stable user code. */
  code: string;
  /** User display name. */
  displayName: string;
}

export interface AuditStampDto {
  /** Date and time for the audited operation. */
  date: string;
  /** Channel that performed the operation. */
  via: ActorType;
  /** User associated with the operation, when available. */
  user?: AuditUserDto | null;
  /** Mutation identifier linking audit events created by the same operation. */
  mutationId?: string | null;
}

export interface AuditMetadataDto {
  /** Details of the operation that created the record. */
  created: AuditStampDto;
  /** Details of the operation that last updated the record. */
  updated: AuditStampDto;
}`,
};

export async function AuditResponsePage() {
  const fieldsPanel = (
    <PropertiesPanel
      mode="card"
      heading={
        <>
          <span className={styles.statusOk}>200</span> Audit metadata returned on read response DTOs.
        </>
      }
      schema={auditResponseSchema}
    />
  );

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Getting Started</p>
        <h1>Audit Response</h1>
        <p>
          Read response Data Type Objects (DTOs) include an <code>audit</code> node describing how the record was created
          and last updated.
        </p>
      </header>

      <article className={styles.content}>
        <section className={styles.endpoint}>
          <div className={styles.endpointSection}>
            <div className={styles.endpointSectionHeader}>
              <h2 className={styles.endpointSectionHeading}>Response</h2>
            </div>
            <div className={styles.endpointMain}>
              <TabGroup
                variant="compact"
                tabs={[
                  { key: "fields", label: "Fields", content: fieldsPanel },
                  {
                    key: "typescript",
                    label: "TypeScript",
                    content: <TypeScriptExample dto={auditResponseTypescript} />,
                  },
                ]}
              />
            </div>
            <ResponseExample
              example={{
                status: "200",
                code: JSON.stringify(auditResponseExample, null, 2),
              }}
            />
          </div>
        </section>
      </article>
    </main>
  );
}
