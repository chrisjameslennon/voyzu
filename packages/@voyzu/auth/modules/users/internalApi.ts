export const implementations = {
  "@core/auth": () => import("./server/lib/identity-provider").then(m => ({ methods: { get: m.current } })),
  "@core/user": async () => {
    const users = await import("./server/lib/user.service");
    return { methods: {
      get: ({ code }: { code: string }) => users.getUser(code),
    } };
  },
};
