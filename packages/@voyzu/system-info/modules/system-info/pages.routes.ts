export const pageRoutes = {
  home: {
    id: "voyzu.system-info.page.home",
    path: "/settings/system-information",
    loadPage: () =>
      import("./server/pages/SystemInfoPage")
        .then((module) => module.SystemInfoPage),
    pageTitle: "System Information",
    helpPath: "help-platform/settings/system-information",
    breadcrumbBase: [{ label: "Settings", href: "/settings/users" }],
    auth: { required: true, minRole: "ADMIN" },
  },
} as const;
