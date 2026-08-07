import { welcomeModule } from "../modules/welcome/module";

const topNav = {
  label: "Welcome",
  routeId: welcomeModule.pageRoutes.home.id,
} as const;

export default topNav;
