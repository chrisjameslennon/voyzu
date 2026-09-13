import Type from "typebox";

export const DocumentReference = Type.Object({ documentType: Type.String({ minLength: 1 }), documentId: Type.Integer({ minimum: 1 }), documentCode: Type.String() }, { additionalProperties: false });

export const LinkFields = Type.Object({ organization_id: Type.Integer({ minimum: 1 }), upstream: DocumentReference, downstream: DocumentReference }, { additionalProperties: false });

export const DocumentLinkSchema = Type.Object({ id: Type.Integer({ minimum: 1 }), ...LinkFields.properties }, { additionalProperties: false });

export const DocumentLinksListForDocumentRequestDto = Type.Object({ organization_id: Type.Integer({ minimum: 1 }), documentType: Type.String(), documentId: Type.Integer({ minimum: 1 }) }, { additionalProperties: false });

export const DocumentLinksListForDocumentResponseDto = Type.Array(DocumentLinkSchema);

export const DocumentLinksDeleteRequestDto = Type.Object({ organization_id: Type.Integer({ minimum: 1 }), id: Type.Integer({ minimum: 1 }) }, { additionalProperties: false });

export const DocumentLinksDeleteResponseDto = Type.Undefined();
