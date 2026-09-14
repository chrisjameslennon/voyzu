import { SettingsDefinition } from "./contracts/settings.definition";

export const defines = { "@core/settings": SettingsDefinition };
export const implementations = {
  "@core/settings": () => import("./server/settings.implementation").then(module => ({
    methods: module.settingsMethods, transactionalMethods: ["set"],
  })),
};
