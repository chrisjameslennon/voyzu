export const implementations = {
  "@core/organization-access": () => import("./server/lib/organization-access.implementation").then(m => ({
    methods: m.organizationAccessMethods, transactionalMethods: ["replace"],
  })),
};
