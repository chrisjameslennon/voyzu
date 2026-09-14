import type { VoyzuPackageDefinition } from "../../../lib/types/src/framework";
import { PartyDefinition } from "./contracts/party.definition";

export const businessObjectsPackage = {
  contracts: {
    internalApi: {
      defines: {
        "@core/party": PartyDefinition,
      },
    },
  },
} as const satisfies VoyzuPackageDefinition;

export default businessObjectsPackage;
