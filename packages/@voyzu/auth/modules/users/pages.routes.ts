export const pageRoutes = {
  list: {
    id: "voyzu.users.page.list",
    path: "/settings/users",
    loadPage: () =>
      import("./server/pages/UsersListPage")
        .then((module) => module.UsersListPage),
    pageTitle: "Users",
    helpPath: "help-platform/settings/users",
    breadcrumbBase: [{ label: "Settings", href: "/settings/users" }],
    auth: { required: true, minRole: "ADMIN" },
  },
  profile: {
    id: "voyzu.users.page.profile",
    path: "/settings/users/profile",
    loadPage: () =>
      import("./server/pages/UserProfilePage")
        .then((module) => module.UserProfilePage),
    pageTitle: "User Profile",
    helpPath: "help-platform/settings/user-profile",
    breadcrumbBase: [{ label: "Settings" }, { label: "Users" }],
    auth: { required: true, minRole: "STANDARD" },
  },
  detail: {
    id: "voyzu.users.page.detail",
    path: "/settings/users/[code]",
    loadPage: () =>
      import("./server/pages/UserDetailPage")
        .then((module) => module.UserDetailPage),
    pageTitle: "Users",
    helpPath: "help-platform/settings/users",
    breadcrumbBase: [
      { label: "Settings", href: "/settings/users" },
      { label: "Users", href: "/settings/users" },
    ],
    auth: { required: true, minRole: "ADMIN" },
  },
} as const;
