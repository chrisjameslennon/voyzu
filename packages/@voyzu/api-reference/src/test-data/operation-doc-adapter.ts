import type {
  ApiMethod,
  ApiOperationData,
  ApiResponsePanelData,
  OperationDoc,
  OperationDocResponse,
  RequestExampleData,
  ResponseExampleData,
} from "../types/index";
import { omitAuditFromExample, omitAuditFromSchema } from "../common";

const SUCCESS_RESPONSE_STATUS_ORDER = ["200", "201", "204"] as const;

function titleToAnchor(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function toApiMethod(method: OperationDoc["method"]): ApiMethod {
  return method.toUpperCase() as ApiMethod;
}

function formatJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function buildCurlExample(doc: OperationDoc): RequestExampleData {
  const method = toApiMethod(doc.method);
  const lines = [`curl --request ${method} \\`, `  --url ${doc.path} \\`, "  --header 'Authorization: Basic ...'"];

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

function getSuccessResponse(doc: OperationDoc): [string, OperationDocResponse] {
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

function buildResponseExample(doc: OperationDoc): ResponseExampleData {
  const [status, response] = getSuccessResponse(doc);

  return {
    status: status as ResponseExampleData["status"],
    code: formatJson(omitAuditFromExample(response.example ?? {})),
  };
}

function buildResponsePanels(doc: OperationDoc): ApiResponsePanelData[] {
  return Object.entries(doc.responses).map(([status, response]) => ({
    status: status as ApiResponsePanelData["status"],
    heading: response.description,
    schema: omitAuditFromSchema(response.schema),
    message: response.schema ? undefined : response.modelReference ?? "See Error Response Model",
  }));
}

export function operationDocToApiOperationData(doc: OperationDoc): ApiOperationData {
  return {
    id: titleToAnchor(doc.summary),
    title: doc.summary,
    method: toApiMethod(doc.method),
    path: doc.path,
    description: doc.description,
    request: {
      panel: doc.requestBody
        ? { heading: "BODY", schema: omitAuditFromSchema(doc.requestBody.schema) }
        : { heading: "BODY", message: "This endpoint does not require a request body." },
      example: buildCurlExample(doc),
    },
    responses: {
      panels: buildResponsePanels(doc),
      example: buildResponseExample(doc),
    },
  };
}
