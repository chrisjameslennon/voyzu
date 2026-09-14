export const implementations = {
  "@core/document-links": () => import("./server/db/document-link.repo").then(({ DocumentLinkRepo }) => ({ methods: {
    get: (input: Parameters<DocumentLinkMethods["get"]>[0]) => new DocumentLinkRepo().get(input),
    create: (input: Parameters<DocumentLinkMethods["create"]>[0]) => new DocumentLinkRepo().create(input),
    delete: (input: Parameters<DocumentLinkMethods["delete"]>[0]) => new DocumentLinkRepo().delete(input),
  }, transactionalMethods: ["create", "delete"] })),
};
import type { DocumentLinkMethods } from "@voyzu/types/business-objects/document-links";
