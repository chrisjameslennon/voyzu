import { OrganizationContextSchema, OrganizationContextGetRequestDto, OrganizationContextSetActiveOrganizationRequestDto, OrganizationContextSetActiveOrganizationResponseDto } from "../types/organization-context.internal-api.dto";
export { OrganizationContextSchema } from "../types/organization-context.internal-api.dto";
import type { Static } from "typebox";
import type { InternalApiDefinition } from "../../../../lib/types/src/internal-api";

/** @core/organization-context. Definition registered by the owning package. */

export interface OrganizationContext extends Static<typeof OrganizationContextSchema> {}

export const OrganizationContextDefinition = {
  dataDefinition: OrganizationContextSchema,
  methods: {
    get: { input: OrganizationContextGetRequestDto, output: OrganizationContextSchema },
    setActiveOrganization: { input: OrganizationContextSetActiveOrganizationRequestDto, output: OrganizationContextSetActiveOrganizationResponseDto },
  },
} as const satisfies InternalApiDefinition;

export type OrganizationContextContract = typeof OrganizationContextDefinition;
export interface OrganizationContextMethods {
  get(parameters: Static<typeof OrganizationContextDefinition.methods.get.input>): Promise<OrganizationContext>;
  setActiveOrganization(parameters: Static<typeof OrganizationContextDefinition.methods.setActiveOrganization.input>): Promise<Static<typeof OrganizationContextDefinition.methods.setActiveOrganization.output>>;
}
