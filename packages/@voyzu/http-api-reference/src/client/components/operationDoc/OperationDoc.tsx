import { PropertiesPanel, TabGroup, type JsonSchema } from "@voyzu/ui-components";
import type { ReactNode } from "react";

import type {
  HttpApiMethod,
  DtoDoc,
  OperationDoc as OperationDocData,
  OperationDocRequestParam,
  OperationDocResponse,
  RequestExampleData,
  ResponseExampleData,
  SchemaRefDoc,
} from "../../../types/index";
import { omitAuditFromExample, omitAuditFromSchema } from "../../../common";
import { RequestExample } from "../requestExample/RequestExample";
import { ResponseExample } from "../responseExample/ResponseExample";
import { TypeScriptExample } from "../typeScriptExample/TypeScriptExample";
import styles from "./operation-doc.module.css";

const SUCCESS_RESPONSE_STATUS_ORDER = ["200", "201", "204"] as const;

function titleToAnchor(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function toHttpApiMethod(method: OperationDocData["method"]): HttpApiMethod {
  return method.toUpperCase() as HttpApiMethod;
}

function formatJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function isJsonContentType(contentType: string): boolean {
  return contentType === "application/json" || contentType.endsWith("+json");
}

function MethodTag({ method }: { method: HttpApiMethod }) {
  return <span className={`${styles.methodTag} ${styles[`method${method}`]}`}>{method}</span>;
}

function EndpointPath({ method, path }: { method: HttpApiMethod; path: string }) {
  return (
    <div className={styles.endpointPath}>
      <MethodTag method={method} />
      <code>{path}</code>
    </div>
  );
}

function responseStatusClass(status: string): string {
  return status.startsWith("2") ? styles.statusOk : styles.statusError;
}

function isSuccessResponse(status: string): boolean {
  return status.startsWith("2");
}

function responseMessage(status: string, response: OperationDocResponse): string | undefined {
  if (response.schema || response.contentType) return undefined;
  return "This response does not include a response body.";
}

function ResponseHeading({ status, response }: { status: string; response: OperationDocResponse }) {
  const contentType = response.contentType ?? (response.schema ? "application/json" : undefined);
  return (
    <>
      <span className={responseStatusClass(status)}>{status}</span> {response.description}{" "}
      {contentType ? <code className={styles.bodyContentType}>{contentType}</code> : null}
    </>
  );
}

function BodyHeading({ contentType }: { contentType: string }) {
  return (
    <>
      BODY <code className={styles.bodyContentType}>{contentType}</code>
    </>
  );
}

function ResponseCookies({ response }: { response: OperationDocResponse }) {
  return <CookieMetadata cookies={response.cookies ?? []} heading="REQUIRED RESPONSE COOKIES (SET OR CLEAR)" />;
}

function CookieMetadata({ cookies, heading }: { cookies: readonly string[]; heading: string }) {
  if (!cookies.length) return null;
  return <div className={styles.cookiePanel}>
    <h4 className={styles.cookiePanelHeading}>{heading}</h4>
    <div className={styles.cookiePanelList}>{cookies.map(name => <div key={name} className={styles.cookiePanelItem}>
      <code>{name}</code> <span className={styles.cookiePanelAction}>required</span>
    </div>)}</div>
  </div>;
}

function paramsToSchema(params: Record<string, OperationDocRequestParam>): JsonSchema {
  return {
    type: "object",
    required: Object.keys(params),
    properties: Object.fromEntries(
      Object.entries(params).map(([name, param]) => [
        name,
        {
          ...param.schema,
          ...(param.description ? { description: param.description } : {}),
        },
      ]),
    ),
  };
}

function getSuccessResponse(doc: OperationDocData): [string, OperationDocResponse] {
  for (const status of SUCCESS_RESPONSE_STATUS_ORDER) {
    const response = doc.responses[status];
    if (response) return [status, response];
  }

  const firstResponse = Object.entries(doc.responses)[0];
  if (!firstResponse) {
    throw new Error(`Operation ${doc.operationId} must declare at least one response.`);
  }

  return firstResponse;
}

function buildRequestPath(doc: OperationDocData): string {
  let requestPath = doc.path;
  for (const [name, param] of Object.entries(doc.requestPathParams ?? {})) {
    requestPath = requestPath.replace(`{${name}}`, `{${encodeURIComponent(String(param.example ?? name))}}`);
  }

  const query = new URLSearchParams();
  for (const [name, param] of Object.entries(doc.requestQuerystringParams ?? {})) {
    query.set(name, String(param.example ?? name));
  }

  const queryString = query.toString();
  return queryString ? `${requestPath}?${queryString}` : requestPath;
}

function buildRequestExample(doc: OperationDocData): RequestExampleData {
  const method = toHttpApiMethod(doc.method);
  const lines = [`curl --request ${method} \\`, `  --url ${buildRequestPath(doc)} \\`, "  --header 'Authorization: Basic ...'"];
  const requestCookies = doc.requestCookies ?? [];

  if (requestCookies.length > 0) {
    lines[lines.length - 1] = `${lines[lines.length - 1]} \\`;
    lines.push(
      `  --cookie '${requestCookies
        .map(name => `${name}=<value>`)
        .join("; ")}'`,
    );
  }

  if (doc.requestBody?.example !== undefined) {
    const contentType = doc.requestBody.contentType ?? "application/json";
    lines[lines.length - 1] = `${lines[lines.length - 1]} \\`;
    lines.push(`  --header 'Content-Type: ${contentType}' \\`);
    const requestBody = isJsonContentType(contentType)
      ? formatJson(omitAuditFromExample(doc.requestBody.example))
      : String(doc.requestBody.example);
    lines.push(`  --data-binary '${requestBody}'`);
  }

  return {
    method,
    path: doc.path,
    code: lines.join("\n"),
  };
}

function buildResponseExample(doc: OperationDocData): ResponseExampleData {
  const [status, response] = getSuccessResponse(doc);
  const contentType = response.contentType ?? "application/json";
  const isJson = isJsonContentType(contentType);

  return {
    status: status as ResponseExampleData["status"],
    code: (!response.schema && !response.contentType)
      ? ""
      : isJson
        ? formatJson(omitAuditFromExample(response.example ?? {}))
        : String(response.example ?? ""),
    contentType: (!response.schema && !response.contentType) ? "No content" : contentType,
    format: isJson ? "json" : "text",
  };
}

function dtoNamesFromSchemaRef(schemaRef: SchemaRefDoc | undefined): string[] {
  if (!schemaRef) return [];
  if (typeof schemaRef === "string") return [schemaRef];
  return dtoNamesFromSchemaRef(schemaRef.items);
}

function dtoDocsFromSchemaRef(schemaRef: SchemaRefDoc | undefined, dtoDocs: Record<string, DtoDoc>): DtoDoc[] {
  return dtoNamesFromSchemaRef(schemaRef)
    .map((name) => dtoDocs[name])
    .filter((dto): dto is DtoDoc => Boolean(dto));
}

function TypeScriptPanels({ docs }: { docs: DtoDoc[] }) {
  if (docs.length === 0) return null;

  return (
    <div className={styles.typeScriptStack}>
      {docs.map((dto) => (
        <TypeScriptExample key={dto.name} dto={dto} />
      ))}
    </div>
  );
}

function DocumentationTabs({ fields, typeScriptDocs }: { fields: ReactNode; typeScriptDocs: DtoDoc[] }) {
  if (typeScriptDocs.length === 0) return <>{fields}</>;

  return (
    <div className={styles.documentationTabs}>
      <TabGroup
        variant="compact"
        tabs={[
          { key: "fields", label: "Fields", content: fields },
          { key: "typescript", label: "TypeScript", content: <TypeScriptPanels docs={typeScriptDocs} /> },
        ]}
      />
    </div>
  );
}

function RequestPanels({ doc, dtoDocs }: { doc: OperationDocData; dtoDocs: Record<string, DtoDoc> }) {
  const panels: Array<{ key: string; heading: ReactNode; schema?: JsonSchema; message?: string }> = [];

  if (doc.requestPathParams && Object.keys(doc.requestPathParams).length > 0) {
    panels.push({ key: "path", heading: "PATH PARAMETERS", schema: paramsToSchema(doc.requestPathParams) });
  }

  if (doc.requestQuerystringParams && Object.keys(doc.requestQuerystringParams).length > 0) {
    panels.push({ key: "query", heading: "QUERY STRING", schema: paramsToSchema(doc.requestQuerystringParams) });
  }

  panels.push(
    doc.requestBody
      ? {
        key: "body",
        heading: <BodyHeading contentType={doc.requestBody.contentType ?? "application/json"} />,
        schema: omitAuditFromSchema(doc.requestBody.schema),
      }
      : { key: "body", heading: "BODY", message: "This endpoint does not require a request body." },
  );

  const fields = (
    <div className={styles.propertiesPanelStack}>
      {panels.map((panel) => (
        <PropertiesPanel
          key={panel.key}
          mode="open"
          heading={panel.heading}
          schema={panel.schema}
          message={panel.message}
        />
      ))}
      {doc.requestCookies ? <CookieMetadata heading="COOKIES" cookies={doc.requestCookies} /> : null}
    </div>
  );

  return (
    <DocumentationTabs
      fields={fields}
      typeScriptDocs={dtoDocsFromSchemaRef(doc.requestBody?.schemaRef, dtoDocs)}
    />
  );
}

function ResponsePanel({
  status,
  response,
  dtoDocs,
}: {
  status: string;
  response: OperationDocResponse;
  dtoDocs: Record<string, DtoDoc>;
}) {
  return (
    <DocumentationTabs
      fields={
        <div className={styles.responseDetails}>
          <PropertiesPanel
            mode="card"
            heading={<ResponseHeading status={status} response={response} />}
            schema={omitAuditFromSchema(response.schema)}
            message={responseMessage(status, response)}
          />
          <ResponseCookies response={response} />
        </div>
      }
      typeScriptDocs={dtoDocsFromSchemaRef(response.schemaRef, dtoDocs)}
    />
  );
}

export async function OperationDoc({ doc, dtoDocs = {} }: { doc: OperationDocData; dtoDocs?: Record<string, DtoDoc> }) {
  const method = toHttpApiMethod(doc.method);
  const requestExample = buildRequestExample(doc);
  const responseExample = buildResponseExample(doc);

  return (
    <section id={encodeURIComponent(doc.operationId)} className={styles.endpoint}>
      <div className={styles.endpointIntro}>
        <h2 className={styles.endpointHeading}>{doc.summary}</h2>
        <EndpointPath method={method} path={doc.path} />
        <p className={styles.endpointDescription}>{doc.description}</p>
      </div>

      <div className={styles.endpointSection}>
        <div className={styles.endpointSectionHeader}>
          <h3 className={styles.endpointSectionHeading}>Request</h3>
        </div>
        <div className={styles.endpointMain}>
          <RequestPanels doc={doc} dtoDocs={dtoDocs} />
        </div>
        <RequestExample example={requestExample} />
      </div>

      <div className={styles.endpointSection}>
        <div className={styles.endpointSectionHeader}>
          <h3 className={styles.endpointSectionHeading}>Response</h3>
        </div>
        <div className={styles.endpointMain}>
          <div className={styles.propertiesPanelStack}>
            {Object.entries(doc.responses).map(([status, response]) => (
              <ResponsePanel key={status} status={status} response={response} dtoDocs={dtoDocs} />
            ))}
          </div>
        </div>
        {doc.responses[responseExample.status]?.schema || doc.responses[responseExample.status]?.contentType
          ? <ResponseExample example={responseExample} />
          : null}
      </div>
    </section>
  );
}
