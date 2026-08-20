import { LoginRoutePage } from "./server/pages/LoginRoutePage";

export const pageRoutes = {
  login: {
    id: "voyzu.auth.page.login",
    path: "/login",
    Page: LoginRoutePage,
    pageTitle: "Sign in",
    unframed: true,
    auth: { required: false },
  },
} as const;
