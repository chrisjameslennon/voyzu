import { pageRoutes as httpApiReferencePageRoutes } from "../modules/http-api-reference/pages.routes";

const topNav = {
  label: "HTTP API Reference",
  routeId: httpApiReferencePageRoutes.gettingStarted.id,
} as const;

export default topNav;
