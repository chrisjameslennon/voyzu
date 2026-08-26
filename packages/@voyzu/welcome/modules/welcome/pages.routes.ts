export const pageRoutes = {
  home: {
    id: "voyzu.welcome.page.home",
    path: "/welcome",
    loadPage: () =>
      import("./server/pages/WelcomePage")
        .then((module) => module.WelcomePage),
    pageTitle: "Welcome",
    helpPath: "installation-and-operation/installation-and-setup",
    auth: {
      required: true,
      minRole: "STANDARD",
    },
  },
} as const;
