import { PropertiesPanel, TabGroup, type JsonSchema } from "@voyzu/ui-components";
import type { ReactNode } from "react";

import type {
  ApiMethod,
  DtoDoc,
  OperationDoc as OperationDocData,
  OperationDocRequestCookie,
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

function toApiMethod(method: OperationDocData["method"]): ApiMethod {
  return method.toUpperCase() as ApiMethod;
}

function formatJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function MethodTag({ method }: { method: ApiMethod }) {
  return <span className={`${styles.methodTag} ${styles[`method${method}`]}`}>{method}</span>;
}

function EndpointPath({ method, path }: { method: ApiMethod; path: string }) {
  return (
    <div className={styles.endpointPath}>
      <MethodTag method={method} />
      <code>{path}</code>
    </div>
  );
}

function responseStatusClass(status: string): string {
  return status === "200" || status === "201" || status === "204" ? styles.statusOk : styles.statusError;
}

function isSuccessResponse(status: string): boolean {
  return status.startsWith("2");
}

function responseMessage(status: string, response: OperationDocResponse): string | undefined {
  if (response.schema) return undefined;
  if (response.modelReference) return response.modelReference;
  return isSuccessResponse(status) ? undefined : "See Error Response Model";
}

function ResponseHeading({ status, response }: { status: string; response: OperationDocResponse }) {
  return (
    <>
      <span className={responseStatusClass(status)}>{status}</span> {response.description}
    </>
  );
}

function ResponseCookies({ response }: { response: OperationDocResponse }) {
  const cookies = Object.entries(response.cookies ?? {});
  if (cookies.length === 0) return null;

  return (
    <div className={styles.responseCookies}>
      <h4 className={styles.responseCookiesHeading}>Response Cookies</h4>
      <div className={styles.responseCookiesList}>
        {cookies.map(([name, cookie]) => (
          <div key={name} className={styles.responseCookie}>
            <div className={styles.responseCookieName}>
              <code>{name}</code>
              {cookie.action ? <span className={styles.responseCookieAction}>{cookie.action}</span> : null}
            </div>
            {cookie.description ? <p className={styles.responseCookieDescription}>{cookie.description}</p> : null}
            <div className={styles.responseCookieMeta}>
              {cookie.httpOnly ? <span>HttpOnly</span> : null}
              {cookie.secure ? <span>Secure</span> : null}
              {cookie.sameSite ? <span>SameSite={cookie.sameSite}</span> : null}
              {cookie.path ? <span>Path={cookie.path}</span> : null}
              {cookie.maxAgeSeconds !== undefined ? <span>Max-Age={cookie.maxAgeSeconds}</span> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CookieMetadata({
  cookies,
  heading,
}: {
  cookies: Record<string, OperationDocRequestCookie>;
  heading: string;
}) {
  const entries = Object.entries(cookies);
  if (entries.length === 0) return null;

  return (
    <div className={styles.cookiePanel}>
      <h4 className={styles.cookiePanelHeading}>{heading}</h4>
      <div className={styles.cookiePanelList}>
        {entries.map(([name, cookie]) => (
          <div key={name} className={styles.cookiePanelItem}>
            <div className={styles.cookiePanelName}>
              <code>{name}</code>
              {cookie.required ? <span className={styles.cookiePanelAction}>required</span> : null}
            </div>
            {cookie.description ? <p className={styles.cookiePanelDescription}>{cookie.description}</p> : null}
            <div className={styles.cookiePanelMeta}>
              {cookie.httpOnly ? <span>HttpOnly</span> : null}
              {cookie.secure ? <span>Secure</span> : null}
              {cookie.sameSite ? <span>SameSite={cookie.sameSite}</span> : null}
              {cookie.path ? <span>Path={cookie.path}</span> : null}
              {cookie.maxAgeSeconds !== undefined ? <span>Max-Age={cookie.maxAgeSeconds}</span> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
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
  const method = toApiMethod(doc.method);
  const lines = [`curl --request ${method} \\`, `  --url ${buildRequestPath(doc)} \\`, "  --header 'Authorization: Basic ...'"];
  const requestCookies = Object.entries(doc.requestCookies ?? {});

  if (requestCookies.length > 0) {
    lines[lines.length - 1] = `${lines[lines.length - 1]} \\`;
    lines.push(
      `  --cookie '${requestCookies
        .map(([name, cookie]) => `${name}=${String(cookie.example ?? "...")}`)
        .join("; ")}'`,
    );
  }

  if (doc.requestBody?.example !== undefined) {
    lines[lines.length - 1] = `${lines[lines.length - 1]} \\`;
    lines.push("  --header 'Content-Type: application/json' \\");
    lines.push(`  --data '${formatJson(omitAuditFromExample(doc.requestBody.example))}'`);
  }

  return {
    method,
    path: doc.path,
    code: lines.join("\n"),
  };
}

function buildResponseExample(doc: OperationDocData): ResponseExampleData {
  const [status, response] = getSuccessResponse(doc);

  return {
    status: status as ResponseExampleData["status"],
    code: status === "204" ? "" : formatJson(omitAuditFromExample(response.example ?? {})),
    contentType: status === "204" ? "No content" : undefined,
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
  const panels: Array<{ key: string; heading: string; schema?: JsonSchema; message?: string }> = [];

  if (doc.requestPathParams && Object.keys(doc.requestPathParams).length > 0) {
    panels.push({ key: "path", heading: "PATH PARAMETERS", schema: paramsToSchema(doc.requestPathParams) });
  }

  if (doc.requestQuerystringParams && Object.keys(doc.requestQuerystringParams).length > 0) {
    panels.push({ key: "query", heading: "QUERY STRING", schema: paramsToSchema(doc.requestQuerystringParams) });
  }

  panels.push(
    doc.requestBody
      ? { key: "body", heading: "BODY", schema: omitAuditFromSchema(doc.requestBody.schema) }
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
  const method = toApiMethod(doc.method);
  const requestExample = buildRequestExample(doc);
  const responseExample = buildResponseExample(doc);

  return (
    <section id={titleToAnchor(doc.summary)} className={styles.endpoint}>
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
        <ResponseExample example={responseExample} />
      </div>
    </section>
  );
}
