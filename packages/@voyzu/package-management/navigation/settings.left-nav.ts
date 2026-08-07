import { packageManagementModule } from "../modules/package-management/module";

export const packageManagementSettingsLeftNav = [
  {
    label: "Settings",
    items: [
      {
        label: "Packages",
        icon: "deployed_code",
        routeId: packageManagementModule.pageRoutes.list.id,
      },
    ],
  },
] as const;

export default packageManagementSettingsLeftNav;
