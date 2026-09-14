export const pageRoutes = {
  "voyzu.users.page.list": {

    httpApiDocumentationGroupId: "auth.operations",
    path: "/settings/users",
    loadPage: () =>
      import("./server/pages/UsersListPage")
        .then((module) => module.UsersListPage),
    pageTitle: "Users",
    helpPath: "help-platform/settings/users",
    breadcrumbBase: [{ label: "Settings", href: "/settings/users" }],
    auth: { required: true, minRole: "ADMIN" },
  },
  "voyzu.users.page.profile": {

    httpApiDocumentationGroupId: "auth.operations",
    path: "/settings/users/profile",
    loadPage: () =>
      import("./server/pages/UserProfilePage")
        .then((module) => module.UserProfilePage),
    pageTitle: "User Profile",
    helpPath: "help-platform/settings/user-profile",
    breadcrumbBase: [{ label: "Settings" }, { label: "Users" }],
    auth: { required: true, minRole: "STANDARD" },
  },
  "voyzu.users.page.detail": {
    pathParams: { code: { type: "string" } },
    httpApiDocumentationGroupId: "auth.operations",
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
