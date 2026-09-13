export const implementations = {
  "@core/organization-context": () => import("./server/organization-context.implementation").then(m => ({ methods: m.organizationContextMethods })),
};
