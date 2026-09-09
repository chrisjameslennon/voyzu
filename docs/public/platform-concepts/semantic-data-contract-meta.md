# Voyzu Meta Semantic Data Contract

This proposes Voyzu's implementation of [semantic data contracts](semantic-data-contracts.md),
not its current API. Voyzu's data services operate within the same runtime, enabling
direct asynchronous calls, shared execution context and generated TypeScript types.
Disconnected services may require different mechanisms or may not be able to offer the same guarantees.

## A Voyzu contract

Definitions would use TypeBox schemas, registered through `voyzu.package.ts`.
The examples assume `import Type from "typebox"` in each service.

### Service A — planet

```ts
const contracts = {
  semanticDataDefinition: {
    defines: {
      "planet": {
        identifier: Type.String(),
        dataDefinition: Type.Object({ name: Type.String() }),
      },
    },
  },
};

// Example lookup: "planet", identifier: "Sol III"
// Result: { name: "Earth" }
```

### Service B — continents

```ts
const contracts = {
  semanticDataDefinition: {
    defines: {
      "planet.continents": {
        extends: "planet",
        identifier: Type.String(),
        dataDefinition: Type.Object({ continents: Type.Array(Type.String()) }),
      },
    },
  },
};

// Example lookup: "planet.continents", identifier: "Sol III"
// Result: { continents: ["Africa", "Antarctica", "Asia", "Australia",
//                        "Europe", "North America", "South America"] }
```

### Service C — seas

```ts
const contracts = {
  semanticDataDefinition: {
    defines: {
      "planet.seas": {
        extends: "planet",
        identifier: Type.String(),
        dataDefinition: Type.Object({ seas: Type.Array(Type.String()) }),
      },
    },
  },
};

// Example lookup: "planet.seas", identifier: "Sol III"
// Result: { seas: ["Mediterranean", "Caribbean", "Baltic"] }
```

### Service D — geography

```ts
const contracts = {
  semanticDataDefinition: {
    defines: {
      "planet.geography": {
        extends: "planet",
        identifier: Type.String(),
        extensions: ["planet.continents", "planet.seas"],
      },
    },
  },
};

// Example lookup: "planet.geography", identifier: "Sol III"
// Result: {
//   name: "Earth",
//   continents: ["Africa", "Antarctica", "Asia", "Australia",
//                "Europe", "North America", "South America"],
//   seas: ["Mediterranean", "Caribbean", "Baltic"]
// }
```

The contract name identifies a particular definition and resolves
its provider or composition. Contract
names are semantic identifiers, independent of their defining or implementing
service. The registry records those relationships separately.

`identifier` specifies the lookup argument's schema, not a database column. Here it accepts
`"Sol III"`; `Type.Integer()` would require a number. Extensions receive that same
identifier. `dataShape` validates the returned record.

## Implementation and retrieval

Providers would declare the shape they implement and supply `get(identifier)` and
`list()`. Definition and implementation need not belong to the same service.

### Service E — implements planet.seas

Service E implements the definition supplied by Service C.

```ts
const records: Record<string, { seas: string[] }> = {
  "Sol III": { seas: ["Mediterranean", "Caribbean", "Baltic"] },
};

const contracts = {
  semanticDataDefinition: {
    implements: {
      "planet.seas": {
        get: async (identifier: string) => records[identifier] ?? null,
        list: async () => Object.values(records),
      },
    },
  },
};

// get receives: "Sol III"
// Returns: { seas: ["Mediterranean", "Caribbean", "Baltic"] }
// An unknown identifier returns null.

// list receives: no arguments
// Returns: [{ seas: ["Mediterranean", "Caribbean", "Baltic"] }]
```

Service E supplies only the seas portion. Service D's composition requires no
provider of its own: Voyzu would retrieve each contribution using the same
identifier and assemble the result shown above under Service D.

### Service F — retrieves planet.geography

```ts
const geography = await semanticData.get("planet.geography", "Sol III");

// Returns:
// {
//   name: "Earth",
//   continents: ["Africa", "Antarctica", "Asia", "Australia",
//                "Europe", "North America", "South America"],
//   seas: ["Mediterranean", "Caribbean", "Baltic"]
// }
```

`includeContractNames` defaults to `false`: results contain unwrapped data, with
composed contributions merged into one object. Set it to `true` to wrap each
contribution in its full contract name:

```ts
const geography = await semanticData.get("planet.geography", "Sol III", {
  includeContractNames: true,
});

// Returns:
// {
//   "planet": { name: "Earth" },
//   "planet.continents": {
//     continents: ["Africa", "Antarctica", "Asia", "Australia",
//                  "Europe", "North America", "South America"]
//   },
//   "planet.seas": {
//     seas: ["Mediterranean", "Caribbean", "Baltic"]
//   }
// }
```

Voyzu would generate registrations and consumer types during composition, then
validate identifiers and returned data when called.

Providers always return only their own defined data, unwrapped. Voyzu handles
merging or wrapping; for an individual contract, the flag wraps its data in that
contract's name. Flat results must reject duplicate field names rather than
silently overwrite contributions.

### Service Discovery

In the above "Service F" example, a request is made for `planet.geography` - but how does the system know which data services to request the various data from? For example, seas data comes from Service C - but how is this knowledge stored?

The Voyzu implementation is to create a shared platform registry of all semantic data contracts, their definitions and fulfillment. Only one service implementation per Semantic Data Contract definition is permitted.

In this example, Service C defines seas; Service E implements retrieval. Simplified
registry representation (the planet and continent providers are not shown above):

```ts
const registry = {
  definitions: {
    "planet": serviceA.contracts.semanticDataDefinition.defines["planet"],
    "planet.continents": serviceB.contracts.semanticDataDefinition.defines["planet.continents"],
    "planet.seas": serviceC.contracts.semanticDataDefinition.defines["planet.seas"],
    "planet.geography": serviceD.contracts.semanticDataDefinition.defines["planet.geography"],
  },
  implementations: {
    "planet": planetProvider,
    "planet.continents": continentsProvider,
    "planet.seas": serviceE.contracts.semanticDataDefinition.implements["planet.seas"],
  },
};

// Resolve Service F's request for the composed shape.
const definition = registry.definitions["planet.geography"];
const shapes = [definition.extends, ...definition.extensions];

const includeContractNames = false; // Optional retrieval flag.
const contributions = await Promise.all(
  shapes.map(async (shape) => [
    shape,
    await registry.implementations[shape].get("Sol III"),
  ]),
);

const result = includeContractNames
  ? Object.fromEntries(contributions)
  : Object.assign({}, ...contributions.map(([, data]) => data));
```

The composition has no separate implementor. This illustration omits typing,
validation (including duplicate-field checks) and missing-provider/record handling.
