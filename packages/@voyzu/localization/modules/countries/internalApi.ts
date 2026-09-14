export const implementations = {
  "@core/country": () => import("./server/lib/country.service").then(m => ({ methods: {
    get: ({ code }: { code: string }) => m.getCountry(code),
  } })),
};
