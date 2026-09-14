import { Fields, OrganizationSchema, OrganizationGetRequestDto, OrganizationGetResponseDto, OrganizationUpdateRequestDto, OrganizationActivateRequestDto, OrganizationDeactivateRequestDto, OrganizationDeleteRequestDto, OrganizationDeleteResponseDto } from "../types/organization.internal-api.dto";
export { OrganizationSchema } from "../types/organization.internal-api.dto";
import type { Static } from "typebox";
import type { InternalApiDefinition } from "../../../../lib/types/src/internal-api";
import { OrganizationResponseDto } from "../types/organization.response.dto";
export { OrganizationResponseDto } from "../types/organization.response.dto";

// Organization is an independent identity, never a Party.

/** @core/organization. Definition registered by the owning package. */

export interface Organization extends Static<typeof OrganizationSchema> {}

export const OrganizationDefinition = {
  dataDefinition: OrganizationSchema,
  methods: {
    get: { input: OrganizationGetRequestDto, output: OrganizationGetResponseDto },
    create: { input: Fields, output: OrganizationSchema },
    update: { input: OrganizationUpdateRequestDto, output: OrganizationSchema },
    activate: { input: OrganizationActivateRequestDto, output: OrganizationSchema },
    deactivate: { input: OrganizationDeactivateRequestDto, output: OrganizationSchema },
    delete: { input: OrganizationDeleteRequestDto, output: OrganizationDeleteResponseDto },
  },
} as const satisfies InternalApiDefinition;

export type OrganizationContract = typeof OrganizationDefinition;
export interface OrganizationMethods {
  get(parameters: Static<typeof OrganizationDefinition.methods.get.input>): Promise<Static<typeof OrganizationDefinition.methods.get.output>>;
  create(parameters: Static<typeof OrganizationDefinition.methods.create.input>): Promise<Static<typeof OrganizationDefinition.methods.create.output>>;
  update(parameters: Static<typeof OrganizationDefinition.methods.update.input>): Promise<Static<typeof OrganizationDefinition.methods.update.output>>;
  activate(parameters: Static<typeof OrganizationDefinition.methods.activate.input>): Promise<Static<typeof OrganizationDefinition.methods.activate.output>>;
  deactivate(parameters: Static<typeof OrganizationDefinition.methods.deactivate.input>): Promise<Static<typeof OrganizationDefinition.methods.deactivate.output>>;
  delete(parameters: Static<typeof OrganizationDefinition.methods.delete.input>): Promise<Static<typeof OrganizationDefinition.methods.delete.output>>;
}
