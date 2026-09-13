import Type from "typebox";

export const InventoryItemOperationalSchema = Type.Object({ id: Type.Integer({ minimum: 1 }), sku: Type.String(), name: Type.String(), description: Type.String(), quantityTracked: Type.Boolean(), status: Type.Union([Type.Literal("ACTIVE"), Type.Literal("INACTIVE")]) }, { additionalProperties: false });

export const InventoryItemOperationalGetRequestDto = Type.Object({ id: Type.Integer({ minimum: 1 }) }, { additionalProperties: false });

export const InventoryItemOperationalGetResponseDto = Type.Union([InventoryItemOperationalSchema, Type.Null()]);

export const InventoryItemOperationalBySkusRequestDto = Type.Object({ organization_id: Type.Integer({ minimum: 1 }), skus: Type.Array(Type.String()) }, { additionalProperties: false });

export const InventoryItemOperationalBySkusResponseDto = Type.Array(InventoryItemOperationalSchema);
