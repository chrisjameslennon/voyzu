import { getDb } from "@voyzu/capability/db";
import type { DocumentLink, DocumentLinkMethods } from "@voyzu/types/business-objects/document-links";
function toDto(row: Record<string, unknown>): DocumentLink {
  return { id: Number(row.id), organization_id: Number(row.organization_id),
    upstream: { documentType: String(row.upstream_document_type), documentId: Number(row.upstream_document_id), documentCode: String(row.upstream_document_code) },
    downstream: { documentType: String(row.downstream_document_type), documentId: Number(row.downstream_document_id), documentCode: String(row.downstream_document_code) } };
}
export class DocumentLinkRepo {
  async get(input: Parameters<DocumentLinkMethods["get"]>[0]) {
    const { rows } = await getDb().query("SELECT * FROM document_link WHERE organization_id = $1 AND id = $2", [input.organization_id, input.id]);
    return rows[0] ? toDto(rows[0]) : null;
  }
  async create(input: Parameters<DocumentLinkMethods["create"]>[0]) {
    const { rows } = await getDb().query(`INSERT INTO document_link
      (organization_id, upstream_document_type, upstream_document_id, upstream_document_code, downstream_document_type, downstream_document_id, downstream_document_code)
      VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [input.organization_id, input.upstream.documentType, input.upstream.documentId, input.upstream.documentCode, input.downstream.documentType, input.downstream.documentId, input.downstream.documentCode]);
    return toDto(rows[0]);
  }
  async delete(input: Parameters<DocumentLinkMethods["delete"]>[0]) {
    await getDb().query('DELETE FROM document_link WHERE organization_id = $1 AND id = $2', [input.organization_id, input.id]);
  }
}
