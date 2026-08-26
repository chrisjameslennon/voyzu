import { pageRoutes as systemInfoPageRoutes } from "../modules/system-info/pages.routes";

export const systemInfoSettingsLeftNav = [
  {
    label: "Settings",
    items: [
      {
        label: "System Information",
        icon: "info",
        routeId: systemInfoPageRoutes.home.id,
      },
    ],
  },
] as const;

export default systemInfoSettingsLeftNav;
