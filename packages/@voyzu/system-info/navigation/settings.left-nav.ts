import { systemInfoModule } from "../modules/system-info/module";

export const systemInfoSettingsLeftNav = [
  {
    label: "Settings",
    items: [
      {
        label: "System Information",
        icon: "info",
        routeId: systemInfoModule.pageRoutes.home.id,
      },
    ],
  },
] as const;

export default systemInfoSettingsLeftNav;
