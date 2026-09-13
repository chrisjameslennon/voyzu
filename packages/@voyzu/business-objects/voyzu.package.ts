import type { VoyzuPackageDefinition } from "../../../lib/types/src/framework";
import { PartyDefinition } from "./contracts/party.definition";

export const businessObjectsPackage = {
  contracts: {
    internalApi: {
      defines: {
        "@core/party": PartyDefinition,
      },
      implements: {
        "@core/party": () => import("./modules/parties/server/lib/party.implementation").then(module => ({ methods: module.partyMethods })),
      },
    },
  },
  modules: [],
} as const satisfies VoyzuPackageDefinition;

export default businessObjectsPackage;
