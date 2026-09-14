import type { VoyzuPackageDefinition } from "@voyzu/types/framework";
import settingsMenu from "./ui-surface/settings.left-nav";
import { pageRoutes } from "./modules/parties/pages.routes";
import { httpApiRoutes } from "./modules/parties/http-api.routes";
export default {
  contracts: {
    internalApi: { implements: { "@core/party": () => import("./modules/parties/server/party.implementation").then(module => ({ methods: module.partyMethods, transactionalMethods: ["create", "update"] })) } },
    uiSurface: { "leftnav.menu": { "/settings": { content: settingsMenu } } },
    pageRouting: { roots: { "/settings/parties": { routes: pageRoutes } } },
    httpApiRouting: { roots: ["/parties"], routes: httpApiRoutes },
    httpApiDocumentation: { sections: { "parties.platform": {
      title: "Platform", navigationHeadingId: "voyzu.platform",
      description: "Core Voyzu platform operations.",
      groups: { "parties.operations": { title: "@voyzu/party", description: "Party management.", routes: Object.keys(httpApiRoutes) } },
    } } },
  },
  install: { sql: ["./install/parties.sql"] },
} as const satisfies VoyzuPackageDefinition;
