# Voyzu Semantic Data Contract Implementation

This proposes Voyzu's implementation of [Master Semantic Data Contract](semantic-data-contract-master.md),
not its current API. Services share a runtime, enabling direct asynchronous calls,
shared execution context and generated TypeScript types. Disconnected services
may require different mechanisms.

## A Voyzu contract

Definitions use TypeBox schemas, registered through `voyzu.package.ts`.
Examples assume `import Type from "typebox"`. Data is representative, not exhaustive.

### Service A — planet

```ts
const contracts = {
  semanticDataDefinition: {
    defines: {
      "planet": {
        identifier: "PlanetId",
        identifierDataDefinition: Type.String(),
        dataDefinition: Type.Object({ name: Type.String() }),
      },
    },
  },
};

// get("planet", "Sol III")
// Returns: { PlanetId: "Sol III", name: "Earth" }
```

Only the root declares the identifier's name and schema. Extensions inherit both.
Returned records contain that identifier and their defined data; the identifier
does not prescribe a database column.

### Service B — mountains

```ts
const contracts = {
  semanticDataDefinition: {
    defines: {
      "planet.mountains": {
        extends: "planet",
        dataDefinition: Type.Object({ mountains: Type.Array(Type.String()) }),
        queries: {
          getHighMountains: {
            inputDataDefinition: Type.Object({
              minimumHeightMeters: Type.Number(),
            }),
          },
        },
      },
    },
  },
};

// get("planet.mountains", "Sol III")
// Returns: { PlanetId: "Sol III", mountains: ["Mount Everest"] }
```

Query outputs are implicit: arrays of full contract records, including the
inherited identifier, with no extra fields. This query selects planets with a
mountain meeting the threshold, measured above the planet's reference surface;
it does not filter the returned mountain lists.

### Service C — atmosphere

```ts
const contracts = {
  semanticDataDefinition: {
    defines: {
      "planet.atmosphere": {
        extends: "planet",
        dataDefinition: Type.Object({ atmosphere: Type.Array(Type.String()) }),
      },
    },
  },
};

// get("planet.atmosphere", "Sol III")
// Returns: { PlanetId: "Sol III", atmosphere: ["Nitrogen", "Oxygen"] }
```

### Service D — geography

```ts
const contracts = {
  semanticDataDefinition: {
    defines: {
      "planet.geography": {
        extends: "planet",
        extensions: ["planet.mountains", "planet.atmosphere"],
      },
    },
  },
};

// get("planet.geography", "Sol III")
// Returns: {
//   PlanetId: "Sol III",
//   name: "Earth",
//   mountains: ["Mount Everest"],
//   atmosphere: ["Nitrogen", "Oxygen"]
// }
```

Names identify semantic definitions, not their owning services. Each contract must
define data, compose extensions, or both. A bare `extends` is insufficient.

## Implementation and retrieval

Implementors supply `get(identifier)` and every query declared by the Contract.
They return identified records, not schemas. Unknown identifiers return `null`;
queries with no matches return `[]`.

### Service E — implements planet.mountains

```ts
const records = [
  { PlanetId: "Sol III", mountains: ["Mount Everest"] },
  { PlanetId: "Sol IV", mountains: ["Olympus Mons"] },
];

// Private query data; not returned. Illustrative heights only.
const maximumHeightMeters: Record<string, number> = {
  "Sol III": 8849,
  "Sol IV": 22000,
};

const contracts = {
  semanticDataDefinition: {
    implements: {
      "planet.mountains": {
        get: async (PlanetId: string) =>
          records.find((record) => record.PlanetId === PlanetId) ?? null,
        queries: {
          getHighMountains: async (
            { minimumHeightMeters }: { minimumHeightMeters: number },
          ) => records.filter((record) =>
            maximumHeightMeters[record.PlanetId] >= minimumHeightMeters),
        },
      },
    },
  },
};

// get receives: "Sol III"
// Returns: { PlanetId: "Sol III", mountains: ["Mount Everest"] }

// getHighMountains receives: { minimumHeightMeters: 8000 }
// Returns: [
//   { PlanetId: "Sol III", mountains: ["Mount Everest"] },
//   { PlanetId: "Sol IV", mountains: ["Olympus Mons"] }
// ]
```

Service B defines the mountains contract; Service E implements it. E returns only
the identifier and mountains, without retrieving planet names or atmosphere data.

### Service F — implements planet.geography

Voyzu could provide a composition helper to resolve and merge the declared
contributions, avoiding duplicated definitions in the implementor:

```ts
const contracts = {
  semanticDataDefinition: {
    implements: {
      "planet.geography": {
        get: async (PlanetId: string) =>
          semanticData.compose("planet.geography", PlanetId),
      },
    },
  },
};

// get receives: "Sol III"
// Returns: {
//   PlanetId: "Sol III",
//   name: "Earth",
//   mountains: ["Mount Everest"],
//   atmosphere: ["Nitrogen", "Oxygen"]
// }
```

The helper resolves the definition's contributors, not F's own `get` again.
Composition merges the shared identifier once and rejects mismatched identifiers
or duplicate data fields. If cascading extensions are supported, it also resolves
ancestor contributions.

### Consumer example

```ts
const geography = await semanticData.get("planet.geography", "Sol III");
// Returns the unwrapped record shown under Service F.

const matches = await semanticData.query(
  "planet.mountains", "getHighMountains", { minimumHeightMeters: 8000 },
);
// Returns: [
//   { PlanetId: "Sol III", mountains: ["Mount Everest"] },
//   { PlanetId: "Sol IV", mountains: ["Olympus Mons"] }
// ]
```

`includeContractNames` defaults to `false`. Set it to `true` to wrap contributions
in their contract names; each retains the identifier:

```ts
const geography = await semanticData.get("planet.geography", "Sol III", {
  includeContractNames: true,
});

// Returns: {
//   "planet": { PlanetId: "Sol III", name: "Earth" },
//   "planet.mountains": { PlanetId: "Sol III", mountains: ["Mount Everest"] },
//   "planet.atmosphere": { PlanetId: "Sol III", atmosphere: ["Nitrogen", "Oxygen"] }
// }
```

Providers return unwrapped records; Voyzu applies the optional presentation wrapper.

## Service Discovery

Voyzu generates a shared registry and consumer types during composition, then
validates identifiers, query inputs and returned records when called. Only one
implementor per Contract is permitted. The registry separates definitions from
implementations:

```ts
const registry = {
  definitions: {
    "planet": serviceA.contracts.semanticDataDefinition.defines["planet"],
    "planet.mountains": serviceB.contracts.semanticDataDefinition.defines["planet.mountains"],
    "planet.atmosphere": serviceC.contracts.semanticDataDefinition.defines["planet.atmosphere"],
    "planet.geography": serviceD.contracts.semanticDataDefinition.defines["planet.geography"],
  },
  implementations: {
    "planet": planetProvider, // Service A; implementation omitted.
    "planet.mountains": serviceE.contracts.semanticDataDefinition.implements["planet.mountains"],
    "planet.atmosphere": atmosphereProvider, // Service C; implementation omitted.
    "planet.geography": serviceF.contracts.semanticDataDefinition.implements["planet.geography"],
  },
};
```

These examples omit registration plumbing and error handling.
