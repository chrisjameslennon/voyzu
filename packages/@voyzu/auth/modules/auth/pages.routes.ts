export const pageRoutes = {
  "voyzu.auth.page.login": {
    queryParams: {
      next: { type: "string" },
    },
    httpApiDocumentationGroupId: "auth.operations",
    path: "/login",
    loadPage: () =>
      import("./server/pages/LoginRoutePage")
        .then((module) => module.LoginRoutePage),
    pageTitle: "Sign in",
    unframed: true,
    auth: { required: false },
  },
} as const;
