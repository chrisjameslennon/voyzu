export const pageRoutes = {
  "voyzu.package-management.page.list": {
    httpApiDocumentationGroupId: "package-management.operations",
    path: "/settings/packages",
    loadPage: () =>
      import("./server/pages/InstalledPackagesListPage")
        .then((module) => module.InstalledPackagesListPage),
    pageTitle: "Installed Packages",
    helpPath: "help-platform/settings/installed-packages",
    breadcrumbBase: [{ label: "Settings", href: "/settings/users" }],
    auth: { required: true, minRole: "ADMIN" },
  },
  "voyzu.package-management.page.detail": {
    pathParams: { id: { type: "string" } },
    httpApiDocumentationGroupId: "package-management.operations",
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
