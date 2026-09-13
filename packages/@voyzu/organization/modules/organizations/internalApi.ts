export const implementations = {
  "@core/organization": () => import("./server/lib/organization.implementation").then(m => ({
    methods: m.organizationMethods,
    transactionalMethods: ["create", "update", "activate", "deactivate", "delete"],
  })),
};
