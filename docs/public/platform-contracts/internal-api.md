# Internal API

Server-side, same-runtime calls to package-owned and shared resources (`@core`, `@erp`). This API exists alongside semantic contracts.

## Usage

Use the internal API when one installed package needs to interact with a another package. Calls withing a package can use a standard typescript import and should not use the internal API.

The internal API can be thought of as the internal, runtime equivalent of the composed HTTP REST API.

## Defining an internal API contract

An internal API contract is a TypeScript definition with two top level nodes:

- `dataDefinition`. Describing the data object attributes
- `methods`. Describing each method's input and output schemas, not its executable code.

The convention is that each definition lives in its own file, which has a `definition.ts` extension

**Example**

```typescript

// planet.definition.ts
import Type, { type Static } from "typebox";
import type { InternalApiDefinition } from "@voyzu/types/internal-api";

export const PlanetSchema = Type.Object({
  PlanetId: Type.String(),
  name: Type.String(),
}, { additionalProperties: false });

export interface Planet extends Static<typeof PlanetSchema> {}

export const PlanetDefinition = {
  dataDefinition: PlanetSchema,
  methods: {
    get: {
      input: Type.Object({ PlanetId: Type.String() }, { additionalProperties: false }),
      output: Type.Union([PlanetSchema, Type.Null()]),
    },
    rename: {
      input: Type.Object({
        PlanetId: Type.String(),
        name: Type.String(),
      }, { additionalProperties: false }),
      output: PlanetSchema,
    },
  },
} as const satisfies InternalApiDefinition;

export type PlanetContract = typeof PlanetDefinition;

// get receives: { PlanetId: "Sol III" }
// Returns: { PlanetId: "Sol III", name: "Earth" }, or null if not found.
// rename receives: { PlanetId: "Sol III", name: "Terra" }
// Returns: { PlanetId: "Sol III", name: "Terra" }

```

`PlanetContract` describes the entire definition, including both nodes. It can be used with `satisfies` without extracting a separate methods type:

```ts
const definition = {
  dataDefinition: PlanetSchema,
  methods: {
    get: {
      input: Type.Object({ PlanetId: Type.String() }, { additionalProperties: false }),
      output: Type.Union([PlanetSchema, Type.Null()]),
    },
    rename: PlanetDefinition.methods.rename,
  },
} satisfies PlanetContract;
```

Schemas describe the data a method accepts and returns. `satisfies PlanetContract` checks the complete schema definition: missing required methods, incompatible schema types, or a string or function in place of a method schema cause compile errors. Actual functions are supplied separately by the implementation.

`Planet` describes a data record; `PlanetContract` describes the complete contract definition.

### Inheriting and composing internal API contracts

Contracts can reuse existing data schemas and method definitions. Inheritance adds fields to an existing shape; composition combines shapes, optionally beneath named properties. Neither operation automatically combines implementations.

For example, a geographical planet retains the planet identity and name, adds mountains, and includes an atmosphere object:

```ts
const AtmosphereSchema = Type.Object({
  gases: Type.Array(Type.String()),
}, { additionalProperties: false });

const GeographicPlanetSchema = Type.Object({
  ...PlanetSchema.properties,
  mountains: Type.Array(Type.String()),
  atmosphere: AtmosphereSchema,
}, { additionalProperties: false });

export const GeographicPlanetDefinition = {
  dataDefinition: GeographicPlanetSchema,
  methods: {
    get: {
      ...PlanetDefinition.methods.get,
      output: Type.Union([GeographicPlanetSchema, Type.Null()]),
    },
  },
} as const satisfies InternalApiDefinition;

export type GeographicPlanetContract = typeof GeographicPlanetDefinition;

// get returns, for example:
// {
//   PlanetId: "Sol III", name: "Earth",
//   mountains: ["Mount Everest"],
//   atmosphere: { gases: ["Nitrogen", "Oxygen"] }
// }
```

This definition reuses `get`'s input but declares its larger output. It does not expose `rename`; methods are included explicitly. If those contributions come from separate packages, the implementation retrieves them through the internal API using the shared `PlanetId` and assembles the result. The internal API has no automatic `extends` or `extensions` mechanism.

## Shared Contract Definitions

The Voyzu Platform defines shared Internal API contracts for package use. Definition and implementation are separate: Platform implements `@core/party`, Commercial implements `@erp/CustomerAccount`, and Platform composes `@erp/customer` from their contributions.

Platform implemented Internal API Contracts have the `@core` namespace. Where a definition does not have a `@core` namespace, for example `@erp/customer`, this signifies that the contract is not implemented by platform

Implementation supplies a contract's data and behaviour; composition combines separately implemented contributions. Platform may compose non-`@core` contracts without implementing their business data—for example, combining Platform's `@core/party` with Commercial's `@erp/CustomerAccount` to return a complete Customer.

Party-linked methods use `party_id`, never an ambiguous `id`. Customer Account's private row ID is not the shared identity; its `party_id` links it to Party. Price-list contracts retain their own IDs.

## Implementing Internal API Contacts

An implementation supplies the actual functions declared by the contract. It may live in a different package from the definition. Functions receive the declared input and return data matching the output schema.

```ts
// planet.implementation.ts
import type { Planet } from "./planet.definition";

const planets: Planet[] = [
  { PlanetId: "Sol III", name: "Earth" },
];

export async function get({ PlanetId }: { PlanetId: string }): Promise<Planet | null> {
  const planet = planets.find(planet => planet.PlanetId === PlanetId);
  return planet ? { ...planet } : null;
}

export async function rename({ PlanetId, name }: {
  PlanetId: string;
  name: string;
}): Promise<Planet> {
  const planet = planets.find(planet => planet.PlanetId === PlanetId);
  if (!planet) throw new Error("Planet not found");
  planet.name = name;
  return { ...planet };
}

export const planetMethods = { get, rename };
```

The implementing package registers a lazy loader returning `planetMethods` under the contract's fully qualified resource name. All declared methods must be supplied; the dispatcher validates inputs and outputs. `planetMethods` is not checked with `satisfies PlanetContract`, because that type describes schemas, not functions.

The convention is that implementations live in their relevant module, and have a `implementation.ts` extension.

## Using Internal API contracts in calls

Calls follow the syntax `internalApi.call` and then:

- fully qualified resource name, such as `@voyzu/commercial/customer-price-lists` or `@erp/customer`
- method
- optional parameter object

**Example:**

```ts
import { internalApi } from "@voyzu/capability/internal-api";

const item = await internalApi.call(
  "@voyzu/commercial/customer-price-list-items",
  "get",
  { id: 1 },
);

// Inferred from the output schema; no import from Commercial is needed.
const price = item?.price;
```

Input and output are validated at runtime. Unknown resources and methods throw errors. A missing record is represented by the method's output contract; the mock `get` method permits `null`.

### Optional calls and availability

`internalApi.has(resource, method?)` checks whether an implementation or composition provider is registered, optionally checking that the definition includes a method. It does not load the provider, check its dependencies, check permissions or look for a data record.

`internalApi.callOptional(resource, method, parameters)` returns `null` when the resource or its implementation is absent. Otherwise it behaves like `call`: unknown methods, validation failures and provider errors still throw. A missing dependency inside an implemented resource also throws; optionality applies only to the requested resource.

```ts
const available = internalApi.has("@erp/CustomerAccount");
const canAdjust = internalApi.has("@erp/CustomerAccount", "adjustCreditLimit");

const account = await internalApi.callOptional(
  "@erp/CustomerAccount", "get", { party_id: 1 },
);
// null if no provider is registered, or if get returns no record.
```

All three methods require an initialized registry. Availability does not mean the provider has been loaded or verified.

## Transactions and Authorization

A method may set `transactional: true`. It then uses the platform transaction context, joining an existing transaction or starting one. Output validation runs before commit. Authorization remains the handler's responsibility; registration does not grant permission to perform an operation.

For a database-backed implementation, mark the method in its definition:

```ts
import Type from "typebox";
import { CustomerPriceListItemSchema } from "./customer-price-list-item.definition";

export const PriceListItemDefinition = {
  dataDefinition: CustomerPriceListItemSchema,
  methods: {
    update: {
      input: Type.Object({ id: Type.Number(), price: Type.Number() }, { additionalProperties: false }),
      output: CustomerPriceListItemSchema,
      transactional: true,
    },
  },
};
```

Once registered, the caller uses the normal syntax:

```ts
await internalApi.call(
  "@voyzu/commercial/customer-price-list-items", "update", { id: 1, price: 29.95 },
);
```

Database work using the platform transaction context commits on success and rolls back on failure, including invalid output. `callOptional` uses the same transaction behaviour when a provider exists. Transactions do not roll back in-memory mock data or external side effects.



## Exporting contracts at module and package level

A module exports `defines` and `implements`, assembled in its peer `internalApi.ts`; `module.ts` only composes these exports. Definitions contain a TypeBox `dataDefinition` and named `methods`, each with `input` and `output` schemas. Data interfaces contain properties only; separate method interfaces describe the operations. Files use `.definition.ts` and `.implementation.ts` respectively.

`voyzu.package.ts` aggregates these under `contracts.internalApi`. Commercial's module exports remain unchanged:

```ts
// voyzu.package.ts
contracts: {
  internalApi: {
    defines: { ...customersModule.defines },
    implements: { ...customersModule.implements },
  },
}
```

Each implementation is a lazy loader returning the object's methods. Commercial defines and implements its price lists. Platform defines `@erp/CustomerAccount`; Commercial implements it without redefining it. Platform alone defines the shared `@core` and `@erp` namespaces. Every `@core` contract requires a Platform implementation; Platform cannot implement non-core contracts. Each resource has at most one provider.

Platform registers its `@erp/customer` combiner under `contracts.internalApi.composes`, separate from `implements`. Composition and implementation registrations cannot overlap for the same resource. Both are loaded lazily.

The three registration nodes have distinct roles:

- `defines`: schemas describing the resource and its methods.
- `implements`: lazy loaders supplying the resource's data and behaviour.
- `composes`: Platform-only lazy loaders combining contributions into a non-`@core` resource.

For example, Platform's package registration is:

```ts
// Platform voyzu.package.ts (definition imports omitted)
contracts: {
  internalApi: {
    defines: {
      "@core/party": PartyDefinition,
      "@erp/customer": CustomerDefinition,
      "@erp/CustomerAccount": CustomerAccountDefinition,
    },
    implements: {
      "@core/party": () => import("./modules/parties/server/lib/party.implementation")
        .then(module => module.partyMethods),
    },
    composes: {
      "@erp/customer": (api: InternalApiInvoker) =>
        import("./modules/customers/server/lib/customer.implementation")
          .then(module => module.createCustomerMethods({
            get: input => api.call("@erp/CustomerAccount", "get", input) as Promise<CustomerAccount | null>,
          })),
    },
  },
}
```

`InternalApiInvoker` comes from `@voyzu/types/internal-api`; `CustomerAccount` is the shared data interface. Commercial registers its account loader under `implements["@erp/CustomerAccount"]`, not `composes`.

Loaders receive an internal API invoker for dependencies. Platform's Customer loader uses it to obtain Commercial's account data, without importing Commercial. A missing Party or account record returns `null` for the Customer; a missing account implementation throws an error.

## How it works: Platform composition engine

`voyzu:compose` validates registration and generates `.run/internal-api/index.ts` plus the web application's generated bridge. The index contains schema metadata, type-only imports for caller inference, and lazy provider loaders targeting either `implements` or `composes`. No provider is invoked during composition or registration. Providers are loaded on first use and cached for that registry. Invalid namespace ownership, undefined contracts, duplicate definitions and duplicate providers fail composition. Missing methods fail when the provider loads.

The web server loads the generated registry during initialization. Shared definitions are included even without installed extension providers; calling an unimplemented resource throws an error. Core implementations are required at composition time. Registration replaces the previous registry on reload.

The targeted composer is `lib/runtime-tools/compose/compose-internal-api.ts`. It accepts the runtime root, workspace root and package descriptors (JSON, or `@file`). The descriptors use `{ name, directory }` and should cover all packages in that workspace, since this rebuilds the complete internal API registry without composing other surfaces.
