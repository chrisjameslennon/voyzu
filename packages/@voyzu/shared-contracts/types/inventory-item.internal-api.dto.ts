import Type from "typebox";

export const InventoryItemSchema = Type.Object({ id: Type.Integer({ minimum: 1 }), sku: Type.String(), name: Type.String(), category: Type.Union([Type.String(), Type.Null()]), unit: Type.Union([Type.String(), Type.Null()]), quantityTracked: Type.Boolean(), status: Type.Union([Type.Literal("ACTIVE"), Type.Literal("INACTIVE")]) }, { additionalProperties: false });

export const InventoryItemGetRequestDto = Type.Object({ id: Type.Integer({ minimum: 1 }) }, { additionalProperties: false });

export const InventoryItemGetResponseDto = Type.Union([InventoryItemSchema, Type.Null()]);

export const InventoryItemByOrganizationRequestDto = Type.Object({ organization_id: Type.Integer({ minimum: 1 }) }, { additionalProperties: false });

export const InventoryItemByOrganizationResponseDto = Type.Array(InventoryItemSchema);

export const InventoryItemAvailabilityDto = Type.Object({
  itemId: Type.Integer({ minimum: 1 }), warehouseId: Type.Integer({ minimum: 1 }), warehouseName: Type.String(),
  onHand: Type.Number(), reserved: Type.Number(), available: Type.Number(),
}, { additionalProperties: false });
export const InventoryItemAvailabilityResponseDto = Type.Array(InventoryItemAvailabilityDto);
