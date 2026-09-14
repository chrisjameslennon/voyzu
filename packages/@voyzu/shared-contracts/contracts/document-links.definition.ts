import { LinkFields, DocumentLinkSchema, DocumentLinkGetRequestDto, DocumentLinkGetResponseDto, DocumentLinksDeleteRequestDto, DocumentLinksDeleteResponseDto } from "../types/document-links.internal-api.dto";
export { DocumentLinkSchema } from "../types/document-links.internal-api.dto";
import type { Static } from "typebox";
import type { InternalApiDefinition } from "../../../../lib/types/src/internal-api";

/** @core/document-links. Definition registered by the owning package. */

export interface DocumentLink extends Static<typeof DocumentLinkSchema> {}

export const DocumentLinkDefinition = {
  dataDefinition: DocumentLinkSchema,
  methods: {
    get: { input: DocumentLinkGetRequestDto, output: DocumentLinkGetResponseDto },
    create: { input: LinkFields, output: DocumentLinkSchema },
    delete: { input: DocumentLinksDeleteRequestDto, output: DocumentLinksDeleteResponseDto },
  },
} as const satisfies InternalApiDefinition;

export type DocumentLinkContract = typeof DocumentLinkDefinition;
export interface DocumentLinkMethods {
  get(parameters: Static<typeof DocumentLinkDefinition.methods.get.input>): Promise<Static<typeof DocumentLinkDefinition.methods.get.output>>;
  create(parameters: Static<typeof DocumentLinkDefinition.methods.create.input>): Promise<Static<typeof DocumentLinkDefinition.methods.create.output>>;
  delete(parameters: Static<typeof DocumentLinkDefinition.methods.delete.input>): Promise<Static<typeof DocumentLinkDefinition.methods.delete.output>>;
}
