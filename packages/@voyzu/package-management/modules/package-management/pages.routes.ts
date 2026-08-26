export const pageRoutes = {
  list: {
    id: "voyzu.package-management.page.list",
    path: "/settings/packages",
    loadPage: () =>
      import("./server/pages/InstalledPackagesListPage")
        .then((module) => module.InstalledPackagesListPage),
    pageTitle: "Installed Packages",
    helpPath: "help-platform/settings/installed-packages",
    breadcrumbBase: [{ label: "Settings", href: "/settings/users" }],
    auth: { required: true, minRole: "ADMIN" },
  },
  detail: {
    id: "voyzu.package-management.page.detail",
    path: "/settings/packages/[id]",
    loadPage: () =>
      import("./server/pages/InstalledPackageDetailPage")
        .then((module) => module.InstalledPackageDetailPage),
    pageTitle: "Installed Packages",
    helpPath: "help-platform/settings/installed-packages",
    breadcrumbBase: [
      { label: "Settings", href: "/settings/users" },
      { label: "Installed Packages", href: "/settings/packages" },
    ],
    auth: { required: true, minRole: "ADMIN" },
  },
} as const;
