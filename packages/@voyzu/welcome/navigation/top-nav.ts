import { pageRoutes as welcomePageRoutes } from "../modules/welcome/pages.routes";

const topNav = {
  label: "Welcome",
  routeId: welcomePageRoutes.home.id,
} as const;

export default topNav;
