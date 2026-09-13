import { OrganizationAccessSchema, OrganizationAccessGetRequestDto, OrganizationAccessReplaceRequestDto } from "../types/organization-access.internal-api.dto";
export { OrganizationAccessSchema } from "../types/organization-access.internal-api.dto";
import type { Static } from "typebox";
import type { InternalApiDefinition } from "../../../../lib/types/src/internal-api";

/** @core/organization-access. Definition registered by the owning package. */

export interface OrganizationAccess extends Static<typeof OrganizationAccessSchema> {}

export const OrganizationAccessDefinition = {
  dataDefinition: OrganizationAccessSchema,
  methods: {
    get: { input: OrganizationAccessGetRequestDto, output: OrganizationAccessSchema },
    replace: { input: OrganizationAccessReplaceRequestDto, output: OrganizationAccessSchema },
  },
} as const satisfies InternalApiDefinition;

export type OrganizationAccessContract = typeof OrganizationAccessDefinition;
export interface OrganizationAccessMethods {
  get(parameters: Static<typeof OrganizationAccessDefinition.methods.get.input>): Promise<Static<typeof OrganizationAccessDefinition.methods.get.output>>;
  replace(parameters: Static<typeof OrganizationAccessDefinition.methods.replace.input>): Promise<Static<typeof OrganizationAccessDefinition.methods.replace.output>>;
}
