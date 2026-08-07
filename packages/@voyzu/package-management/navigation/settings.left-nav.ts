import { packageManagementModule } from "../modules/package-management/module";

export const packageManagementSettingsLeftNav = [
  {
    label: "Settings",
    items: [
      {
        label: "Installed Packages",
        icon: "deployed_code",
        routeId: packageManagementModule.pageRoutes.list.id,
      },
    ],
  },
] as const;

export default packageManagementSettingsLeftNav;
