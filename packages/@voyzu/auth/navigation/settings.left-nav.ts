import { usersModule } from "../modules/users/module";

export const settingsLeftNav = [
  {
    label: "Settings",
    items: [
      {
        label: "Users",
        icon: "person",
        routeId: usersModule.pageRoutes.list.id,
      },
    ],
  },
] as const;

export default settingsLeftNav;
