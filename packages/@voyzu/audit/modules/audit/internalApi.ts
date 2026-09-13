export const implementations = {
  "@core/audit": () => import("./server/lib/audit.implementation").then(m => ({ methods: m.auditMethods })),
};
