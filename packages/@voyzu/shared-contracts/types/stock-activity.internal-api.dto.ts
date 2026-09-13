import Type from "typebox";
import { StrictObject } from "../../../../lib/types/src/api";
import { AuditMetadataDto } from "../../../../lib/types/src/modules/core";

export const Id = Type.Integer({ minimum: 1 });

export const Text = Type.String();

export const NullableText = Type.Union([Text, Type.Null()]);

export const Status = Type.Union([Type.Literal("ACTIVE"), Type.Literal("INACTIVE")]);

export const StockActivityDetail = StrictObject({
  id: Id, code: Text, date: Text, type: Text, reference: NullableText, notes: Text,
  linkedDocuments: Type.Array(StrictObject({
    documentType: Text, documentId: Id, documentCode: Text, creationDate: Text, href: NullableText,
  })),
  lines: Type.Array(StrictObject({
    id: Id, itemId: Id, sku: Text, itemName: Text, warehouseId: Id, warehouse: Text,
    quantityChange: Type.Number(), reasonCode: NullableText,
  })),
  audit: AuditMetadataDto,
});

export const StockActivitySchema = StockActivityDetail;

export const StockActivityGetRequestDto = Type.Object({ id: Type.Integer({ minimum: 1 }) }, { additionalProperties: false });

export const StockActivityGetResponseDto = Type.Union([StockActivitySchema, Type.Null()]);

export const StockActivityByCodeRequestDto = Type.Object({ organization_id: Type.Integer({ minimum: 1 }), code: Type.String() }, { additionalProperties: false });

export const StockActivityByCodeResponseDto = Type.Array(StockActivitySchema);
