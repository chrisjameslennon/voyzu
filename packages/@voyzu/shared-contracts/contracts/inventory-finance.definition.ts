import { ProcessInventoryMovementRequestDto, ProcessInventoryMovementResponseDto, InventoryFinanceSchema } from "../types/inventory-finance.internal-api.dto";
export { InventoryFinanceSchema } from "../types/inventory-finance.internal-api.dto";
import type { Static } from "typebox";
import type { InternalApiDefinition } from "../../../../lib/types/src/internal-api";

// Shared definition; Ledger supplies the inventory integration implementation.

/** @erp/inventory-finance. Definition registered by the owning package. */

export interface InventoryFinance extends Static<typeof InventoryFinanceSchema> {}

export const InventoryFinanceDefinition = {
  methods: {
    processInventoryMovement: { input: ProcessInventoryMovementRequestDto, output: ProcessInventoryMovementResponseDto },
  },
} as const satisfies InternalApiDefinition;

export type InventoryFinanceContract = typeof InventoryFinanceDefinition;
export interface InventoryFinanceMethods {
  processInventoryMovement(parameters: Static<typeof InventoryFinanceDefinition.methods.processInventoryMovement.input>): Promise<Static<typeof InventoryFinanceDefinition.methods.processInventoryMovement.output>>;
}
