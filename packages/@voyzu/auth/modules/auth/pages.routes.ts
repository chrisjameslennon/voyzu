export const pageRoutes = {
  login: {
    id: "voyzu.auth.page.login",
    path: "/login",
    loadPage: () =>
      import("./server/pages/LoginRoutePage")
        .then((module) => module.LoginRoutePage),
    pageTitle: "Sign in",
    unframed: true,
    auth: { required: false },
  },
} as const;
