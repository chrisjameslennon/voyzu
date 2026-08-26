import { pageRoutes as apiReferencePageRoutes } from "../modules/api-reference/pages.routes";

const topNav = {
  label: "API Reference",
  routeId: apiReferencePageRoutes.gettingStarted.id,
} as const;

export default topNav;
