export const packageManagementSettingsLeftNav = [
  {
    label: "Settings",
    items: [
      {
        label: "Installed Packages",
        icon: "deployed_code",
        routeId: "voyzu.package-management.page.list",
      },
    ],
  },
] as const;

export default packageManagementSettingsLeftNav;
