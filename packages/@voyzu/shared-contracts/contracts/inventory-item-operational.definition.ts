import { InventoryItemOperationalSchema, InventoryItemOperationalGetRequestDto, InventoryItemOperationalGetResponseDto, InventoryItemOperationalBySkusRequestDto, InventoryItemOperationalBySkusResponseDto } from "../types/inventory-item-operational.internal-api.dto";
export { InventoryItemOperationalSchema } from "../types/inventory-item-operational.internal-api.dto";
import type { Static } from "typebox";
import type { InternalApiDefinition } from "../../../../lib/types/src/internal-api";

/** @erp/inventory-item-operational. Definition registered by the owning package. */

export interface InventoryItemOperational extends Static<typeof InventoryItemOperationalSchema> {}

export const InventoryItemOperationalDefinition = {
  dataDefinition: InventoryItemOperationalSchema,
  methods: {
    get: { input: InventoryItemOperationalGetRequestDto, output: InventoryItemOperationalGetResponseDto },
    bySkus: { input: InventoryItemOperationalBySkusRequestDto, output: InventoryItemOperationalBySkusResponseDto },
  },
} as const satisfies InternalApiDefinition;

export type InventoryItemOperationalContract = typeof InventoryItemOperationalDefinition;
export interface InventoryItemOperationalMethods {
  get(parameters: Static<typeof InventoryItemOperationalDefinition.methods.get.input>): Promise<Static<typeof InventoryItemOperationalDefinition.methods.get.output>>;
  bySkus(parameters: Static<typeof InventoryItemOperationalDefinition.methods.bySkus.input>): Promise<Static<typeof InventoryItemOperationalDefinition.methods.bySkus.output>>;
}
