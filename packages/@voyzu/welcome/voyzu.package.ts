import type { VoyzuPackageDefinition } from "@voyzu/types/framework";
import { welcomeModule } from "./modules/welcome/module";

export const welcomePackage = {
  modules: [welcomeModule],
} as const satisfies VoyzuPackageDefinition;

export default welcomePackage;
