export const implementations = {
  "@core/auth": () => import("./server/lib/identity-provider").then(m => ({ methods: { getCurrentIdentity: m.current } })),
  "@core/user": async () => {
    const [users, identity] = await Promise.all([import("./server/lib/user.service"), import("./server/lib/identity-provider")]);
    return { methods: {
      get: ({ code }: { code: string }) => users.getUser(code),
      list: () => users.listUsers(),
      getSummaries: async (input: { ids: number[] }) => (await identity.lookup(input)).users,
    } };
  },
};
