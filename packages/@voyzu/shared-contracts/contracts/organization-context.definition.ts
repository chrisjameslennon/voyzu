import { OrganizationContextSchema, OrganizationContextGetSavedOrganizationIdRequestDto, OrganizationContextGetSavedOrganizationIdResponseDto, OrganizationContextGetAvailableOrganizationsRequestDto, OrganizationContextGetAvailableOrganizationsResponseDto, OrganizationContextGetActiveOrganizationRequestDto, OrganizationContextSetActiveOrganizationRequestDto, OrganizationContextSetActiveOrganizationResponseDto } from "../types/organization-context.internal-api.dto";
export { OrganizationContextSchema } from "../types/organization-context.internal-api.dto";
import type { Static } from "typebox";
import type { InternalApiDefinition } from "../../../../lib/types/src/internal-api";

/** @core/organization-context. Definition registered by the owning package. */

export interface OrganizationContext extends Static<typeof OrganizationContextSchema> {}

export const OrganizationContextDefinition = {
  dataDefinition: OrganizationContextSchema,
  methods: {
    getSavedOrganizationId: { input: OrganizationContextGetSavedOrganizationIdRequestDto, output: OrganizationContextGetSavedOrganizationIdResponseDto },
    getAvailableOrganizations: { input: OrganizationContextGetAvailableOrganizationsRequestDto, output: OrganizationContextGetAvailableOrganizationsResponseDto },
    getActiveOrganization: { input: OrganizationContextGetActiveOrganizationRequestDto, output: OrganizationContextSchema },
    setActiveOrganization: { input: OrganizationContextSetActiveOrganizationRequestDto, output: OrganizationContextSetActiveOrganizationResponseDto },
  },
} as const satisfies InternalApiDefinition;

export type OrganizationContextContract = typeof OrganizationContextDefinition;
export interface OrganizationContextMethods {
  getSavedOrganizationId(parameters: Static<typeof OrganizationContextDefinition.methods.getSavedOrganizationId.input>): Promise<Static<typeof OrganizationContextDefinition.methods.getSavedOrganizationId.output>>;
  getAvailableOrganizations(parameters: Static<typeof OrganizationContextDefinition.methods.getAvailableOrganizations.input>): Promise<Static<typeof OrganizationContextDefinition.methods.getAvailableOrganizations.output>>;
  getActiveOrganization(parameters: Static<typeof OrganizationContextDefinition.methods.getActiveOrganization.input>): Promise<Static<typeof OrganizationContextDefinition.methods.getActiveOrganization.output>>;
  setActiveOrganization(parameters: Static<typeof OrganizationContextDefinition.methods.setActiveOrganization.input>): Promise<Static<typeof OrganizationContextDefinition.methods.setActiveOrganization.output>>;
}
