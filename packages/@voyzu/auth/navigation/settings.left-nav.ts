import { pageRoutes as usersPageRoutes } from "../modules/users/pages.routes";

export const settingsLeftNav = [
  {
    label: "Settings",
    items: [
      {
        label: "Users",
        icon: "person",
        routeId: usersPageRoutes.list.id,
      },
    ],
  },
] as const;

export default settingsLeftNav;
