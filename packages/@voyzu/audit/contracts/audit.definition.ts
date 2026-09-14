import { AuditSchema, AuditGetRequestDto, AuditGetResponseDto } from "../types/audit.internal-api.dto";
export { AuditSchema } from "../types/audit.internal-api.dto";
import type { Static } from "typebox";
import type { InternalApiDefinition } from "../../../../lib/types/src/internal-api";


export { AuditChangeResponseDto } from "../types/audit-event.response.dto";

/** @core/audit. Definition registered by the owning package. Read-only history. Includes the event header and its change lines. */

export interface Audit extends Static<typeof AuditSchema> {}

export const AuditDefinition = {
  dataDefinition: AuditSchema,
  methods: {
    get: {
      input: AuditGetRequestDto,
      output: AuditGetResponseDto,
    },
  },
} as const satisfies InternalApiDefinition;

export type AuditContract = typeof AuditDefinition;
export interface AuditMethods {
  get(parameters: Static<typeof AuditDefinition.methods.get.input>): Promise<Static<typeof AuditDefinition.methods.get.output>>;
}
