import settingsMenu from "./ui-surface/settings.left-nav";
import { httpApiRoutes as routes0 } from "./modules/countries/http-api.routes";
import { httpApiRoutes as routes1 } from "./modules/currencies/http-api.routes";
import { mergePageRoutes } from "@voyzu/types/page-routing";
import { pageRoutes as countriesPageRoutes } from "./modules/countries/pages.routes";
import { pageRoutes as currenciesPageRoutes } from "./modules/currencies/pages.routes";
import type { VoyzuPackageDefinition } from "@voyzu/types/framework";

import { install } from "./install/manifest";
import { countriesModule } from "./modules/countries/module";
import { currenciesModule } from "./modules/currencies/module";
import { CountryDefinition } from "./contracts/country.definition";
import { CurrencyDefinition } from "./contracts/currency.definition";

export const voyzuLocalizationPackage = {
  contracts: {
    uiSurface: {
      "leftnav.menu": {
        "/settings": { content: settingsMenu },
      },
    },
    pageRouting: {
      roots: {
        "/settings/localization": {
          routes: mergePageRoutes(
            countriesPageRoutes,
            currenciesPageRoutes,
          ),
        },
      },
    },
    httpApiRouting: {
      roots: ["/localization"],
      routes: { ...routes0, ...routes1 },
    },
    httpApiDocumentation: {
      "sections": {
        "localization.platform": {
          "title": "Platform",
          "navigationHeadingId": "voyzu.platform",
          "description": "Core Voyzu platform operations.",
          "groups": {
            "localization.operations": {
              "title": "@voyzu/localization",
              "description": "Platform operations provided by @voyzu/localization.",
              "routes": [
                "localization.countries.list",
                "localization.countries.create",
                "localization.countries.filter",
                "localization.countries.search",
                "localization.countries.batchCreate",
                "localization.countries.batchGet",
                "localization.countries.batchUpdate",
                "localization.countries.batchPatch",
                "localization.countries.batchDelete",
                "localization.countries.batchActivate",
                "localization.countries.batchDeactivate",
                "localization.countries.get",
                "localization.countries.update",
                "localization.countries.patch",
                "localization.countries.delete",
                "localization.countries.activate",
                "localization.countries.deactivate",
                "localization.currencies.list",
                "localization.currencies.create",
                "localization.currencies.filter",
                "localization.currencies.search",
                "localization.currencies.get",
                "localization.currencies.update",
                "localization.currencies.patch",
                "localization.currencies.delete",
                "localization.currencies.batchCreate",
                "localization.currencies.batchGet",
                "localization.currencies.batchUpdate",
                "localization.currencies.batchPatch",
                "localization.currencies.batchDelete",
                "localization.currencies.activate",
                "localization.currencies.deactivate",
                "localization.currencies.batchActivate",
                "localization.currencies.batchDeactivate"
              ]
            }
          }
        }
      }
    },
    internalApi: {
      implements: { ...countriesModule.implements, ...currenciesModule.implements },
      defines: {
        "@core/country": CountryDefinition,
        "@core/currency": CurrencyDefinition,
      },
    },

  },
  install,
} as const satisfies VoyzuPackageDefinition;

export default voyzuLocalizationPackage;
