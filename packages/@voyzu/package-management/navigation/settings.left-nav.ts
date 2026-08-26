import { pageRoutes as packageManagementPageRoutes } from "../modules/package-management/pages.routes";

export const packageManagementSettingsLeftNav = [
  {
    label: "Settings",
    items: [
      {
        label: "Installed Packages",
        icon: "deployed_code",
        routeId: packageManagementPageRoutes.list.id,
      },
    ],
  },
] as const;

export default packageManagementSettingsLeftNav;
