import { UserDetailPage } from "./server/pages/UserDetailPage";
import { UserProfilePage } from "./server/pages/UserProfilePage";
import { UsersListPage } from "./server/pages/UsersListPage";

export const pageRoutes = {
  list: {
    id: "voyzu.users.page.list",
    path: "/settings/users",
    Page: UsersListPage,
    pageTitle: "Users",
    helpPath: "help-platform/settings/users",
    breadcrumbBase: [{ label: "Settings", href: "/settings/users" }],
    auth: { required: true, minRole: "ADMIN" },
  },
  profile: {
    id: "voyzu.users.page.profile",
    path: "/settings/users/profile",
    Page: UserProfilePage,
    pageTitle: "User Profile",
    helpPath: "help-platform/settings/user-profile",
    breadcrumbBase: [{ label: "Settings" }, { label: "Users" }],
    auth: { required: true, minRole: "STANDARD" },
  },
  detail: {
    id: "voyzu.users.page.detail",
    path: "/settings/users/[code]",
    Page: UserDetailPage,
    pageTitle: "Users",
    helpPath: "help-platform/settings/users",
    breadcrumbBase: [
      { label: "Settings", href: "/settings/users" },
      { label: "Users", href: "/settings/users" },
    ],
    auth: { required: true, minRole: "ADMIN" },
  },
} as const;
