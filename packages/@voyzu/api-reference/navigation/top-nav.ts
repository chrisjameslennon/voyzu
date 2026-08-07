import { apiReferenceModule } from "../modules/api-reference/module";

const topNav = {
  label: "API Reference",
  routeId: apiReferenceModule.pageRoutes.gettingStarted.id,
} as const;

export default topNav;
