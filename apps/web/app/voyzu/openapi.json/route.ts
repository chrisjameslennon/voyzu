import openApiDocument from "../../../.generated/http-api-reference/openapi.json";

export function GET() {
  return Response.json(openApiDocument);
}
