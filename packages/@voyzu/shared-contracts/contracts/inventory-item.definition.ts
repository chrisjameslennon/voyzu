import { InventoryItemSchema, InventoryItemGetRequestDto, InventoryItemGetResponseDto, InventoryItemByOrganizationRequestDto, InventoryItemByOrganizationResponseDto } from "../types/inventory-item.internal-api.dto";
export { InventoryItemSchema } from "../types/inventory-item.internal-api.dto";
import type { Static } from "typebox";
import type { InternalApiDefinition } from "../../../../lib/types/src/internal-api";

/** @erp/inventory-item. Definition registered by the owning package. */

export interface InventoryItem extends Static<typeof InventoryItemSchema> {}

export const InventoryItemDefinition = {
  dataDefinition: InventoryItemSchema,
  methods: {
    get: { input: InventoryItemGetRequestDto, output: InventoryItemGetResponseDto },
    byOrganization: { input: InventoryItemByOrganizationRequestDto, output: InventoryItemByOrganizationResponseDto },
  },
} as const satisfies InternalApiDefinition;

export type InventoryItemContract = typeof InventoryItemDefinition;
export interface InventoryItemMethods {
  get(parameters: Static<typeof InventoryItemDefinition.methods.get.input>): Promise<Static<typeof InventoryItemDefinition.methods.get.output>>;
  byOrganization(parameters: Static<typeof InventoryItemDefinition.methods.byOrganization.input>): Promise<Static<typeof InventoryItemDefinition.methods.byOrganization.output>>;
}
