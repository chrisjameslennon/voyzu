import Type from "typebox";

export const PositiveId = Type.Integer({ minimum: 1 });

export const BusinessCode = Type.String({ pattern: "^[A-Z0-9][A-Z0-9_-]*$" });

export const NonBlankText = Type.String({ pattern: "\\S" });

export const ProcessInventoryMovementRequestDto = Type.Object({
      organization_id: PositiveId,
      movement: Type.Object({
        inventoryFinancialActivityId: PositiveId,
        inventoryTransactionLineId: PositiveId,
        inventoryDocumentCode: BusinessCode,
        inventoryDocumentType: Type.Union([
          Type.Literal("RECEIPT"), Type.Literal("ISSUE"), Type.Literal("ADJUSTMENT"),
        ]),
        itemId: PositiveId,
        itemCode: BusinessCode,
        itemName: NonBlankText,
        quantityChange: Type.Number(),
        reasonCode: NonBlankText,
        activityDate: Type.String({ format: "date-time" }),
      }, { additionalProperties: false }),
    }, { additionalProperties: false });
export const ProcessInventoryMovementResponseDto = Type.Object({
      financeInventoryActivityId: PositiveId,
      // RECEIVED includes movements waiting for a matched financial document.
      processingStatus: Type.Union([Type.Literal("RECEIVED"), Type.Literal("PROCESSED")]),
    }, { additionalProperties: false });

export const InventoryFinanceSchema = ProcessInventoryMovementRequestDto;
