import type { VoyzuPackageModuleDefinition } from "@voyzu/types/framework";
import { WelcomePage } from "./server/pages/WelcomePage";

export const welcomeModule = {
  pageRoutes: {
    home: {
      id: "voyzu.welcome.page.home",
      path: "/welcome",
      Page: WelcomePage,
      pageTitle: "Welcome",
      helpPath: "installation-and-operation/installation-and-setup",
      auth: {
        required: true,
        minRole: "COMPANY_USER",
      },
    },
  },
  apiDefinitions: {},
} as const satisfies VoyzuPackageModuleDefinition;

export default welcomeModule;
