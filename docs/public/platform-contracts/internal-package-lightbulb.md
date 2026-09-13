I think the unease goes away if you stop trying to make the API, semantic contracts, and UI line up 1:1. They are **three different interfaces onto the same package domain**.

```text
                    Finance / Auth / Inventory domain
                              │
                     services / operations
                              │
             ┌────────────────┼────────────────┐
             │                │                │
             ▼                ▼                ▼
            UI          Semantic Contracts    REST API
       human workflow    package boundary    external boundary
```

So your screenshot is completely legitimate. `Batch Activate Users` can exist as a REST operation even if there is no corresponding button in the UI and no Semantic Capability Contract.

The REST API answers:

> **What can an external client ask this package/application to do?**

The UI answers:

> **What workflows are useful for a human user?**

Semantic contracts answer:

> **What stable business data and behaviour do other Voyzu packages need to interoperate with?**

Those sets overlap, but they do not need to be identical.

For example, internally Auth might simply have:

```ts
activateUsers(codes)
```

The UI might never expose bulk activation.

The REST layer can expose:

```text
PUT /api/user-batches/activation
```

because bulk administration through automation is useful.

But you do **not** create:

```text
platform.user-batch-activation
```

as a semantic capability unless another Voyzu package genuinely needs that business capability.

That gives you a useful filter:

| Thing                                  | Make it REST? | Make it semantic? |
| -------------------------------------- | ------------- | ----------------- |
| Useful to external integrations        | Yes           | Maybe             |
| Needed across Voyzu package boundaries | Maybe         | Yes               |
| Only useful inside package/UI          | No need       | No                |
| API convenience/batch operation        | Often         | Usually not       |

And importantly, **REST DTOs remain REST DTOs**. Your Batch Activate request:

```ts
{
  codes: string[]
}
```

doesn't need to be forced into the semantic data model.

Likewise a REST response can be a convenient projection tailored to API consumers. Semantic Data Contracts remain your canonical **business-data map**, not a universal DTO library.

I think the underlying architecture therefore becomes:

```text
PACKAGE DOMAIN
  ordinary TS services/functions
       │
       ├── UI uses them
       ├── REST routes use them
       └── semantic contract implementations use them
```

That also means API functionality being broader than the UI is not merely acceptable — **it's useful**. APIs often need bulk operations, automation-oriented actions, richer querying, and machine workflows that would clutter a human UI.

The principle I'd keep is:

> **REST is the external programmable surface. Semantic contracts are the internal package-interoperability surface. Neither defines the package's domain; both adapt onto it.**

That lets you keep the very capable API application you've built without letting REST dictate the shape of Voyzu's business architecture.
