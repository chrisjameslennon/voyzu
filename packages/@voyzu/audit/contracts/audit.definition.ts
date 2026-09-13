import { AuditFiltersSchema, AuditSchema, AuditGetRequestDto, AuditGetResponseDto, AuditListResponseDto, AuditExportRequestDto, AuditExportResponseDto, AuditCountRequestDto } from "../types/audit.internal-api.dto";
export { AuditFiltersSchema, AuditSchema } from "../types/audit.internal-api.dto";
import type { Static } from "typebox";
import type { InternalApiDefinition } from "../../../../lib/types/src/internal-api";

import { AuditEventCountResponseDto } from "../types/audit-event-count.response.dto";

export { AuditChangeResponseDto } from "../types/audit-event.response.dto";

/** @core/audit. Definition registered by the owning package. Read-only history. Record capture and audit stamps remain separate; count is the total, not a filtered count. */

export interface Audit extends Static<typeof AuditSchema> {}

export const AuditDefinition = {
  dataDefinition: AuditSchema,
  methods: {
    get: {
      input: AuditGetRequestDto,
      output: AuditGetResponseDto,
    },
    list: {
      input: AuditFiltersSchema,
      output: AuditListResponseDto,
    },
    export: {
      input: AuditExportRequestDto,
      output: AuditExportResponseDto,
    },
    count: {
      input: AuditCountRequestDto,
      output: AuditEventCountResponseDto,
    },
  },
} as const satisfies InternalApiDefinition;

export type AuditContract = typeof AuditDefinition;
export interface AuditMethods {
  get(parameters: Static<typeof AuditDefinition.methods.get.input>): Promise<Static<typeof AuditDefinition.methods.get.output>>;
  list(parameters: Static<typeof AuditDefinition.methods.list.input>): Promise<Static<typeof AuditDefinition.methods.list.output>>;
  export(parameters: Static<typeof AuditDefinition.methods.export.input>): Promise<Static<typeof AuditDefinition.methods.export.output>>;
  count(parameters: Static<typeof AuditDefinition.methods.count.input>): Promise<Static<typeof AuditDefinition.methods.count.output>>;
}
