import { StockActivitySchema, StockActivityGetRequestDto, StockActivityGetResponseDto, StockActivityByCodeRequestDto, StockActivityByCodeResponseDto } from "../types/stock-activity.internal-api.dto";
export { StockActivitySchema } from "../types/stock-activity.internal-api.dto";
import type { Static } from "typebox";
import type { InternalApiDefinition } from "../../../../lib/types/src/internal-api";

/** @erp/stock-activity. Definition registered by the owning package. */

export interface StockActivity extends Static<typeof StockActivitySchema> {}

export const StockActivityDefinition = {
  dataDefinition: StockActivitySchema,
  methods: {
    get: { input: StockActivityGetRequestDto, output: StockActivityGetResponseDto },
    byCode: { input: StockActivityByCodeRequestDto, output: StockActivityByCodeResponseDto },
  },
} as const satisfies InternalApiDefinition;

export type StockActivityContract = typeof StockActivityDefinition;
export interface StockActivityMethods {
  get(parameters: Static<typeof StockActivityDefinition.methods.get.input>): Promise<Static<typeof StockActivityDefinition.methods.get.output>>;
  byCode(parameters: Static<typeof StockActivityDefinition.methods.byCode.input>): Promise<Static<typeof StockActivityDefinition.methods.byCode.output>>;
}
