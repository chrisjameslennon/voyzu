export const implementations = {
  "@core/currency": () => import("./server/lib/currency.service").then(m => ({ methods: {
    get: ({ code }: { code: string }) => m.getCurrency(code),
  } })),
};
