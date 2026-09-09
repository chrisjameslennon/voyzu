# Voyzu Meta Semantic Data Contract

This proposes Voyzu's implementation of [semantic data contracts](semantic-data-contracts.md),
not its current API. Voyzu's data services operate within the same runtime, enabling
direct asynchronous calls, shared execution context and generated TypeScript types.
Disconnected services may require different mechanisms or cannot offer the same guarantees.

## A Voyzu contract

Definitions would use TypeBox schemas, registered through `voyzu.package.ts`.
The examples assume `import Type from "typebox"` in each service.

### Service A — planet

```ts
const contracts = {
  defines: {
    semanticDataDefinition: {
      "planet": {
        identifier: Type.String(),
        dataShape: Type.Object({ name: Type.String() }),
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
  defines: {
    semanticDataDefinition: {
      "planet.continents": {
        extends: "planet",
        identifier: Type.String(),
        dataShape: Type.Object({ continents: Type.Array(Type.String()) }),
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
  defines: {
    semanticDataDefinition: {
      "planet.seas": {
        extends: "planet",
        identifier: Type.String(),
        dataShape: Type.Object({ seas: Type.Array(Type.String()) }),
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
  defines: {
    semanticDataDefinition: {
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
//   "planet": { name: "Earth" },
//   "planet.continents": { continents: ["Africa", "Antarctica", "Asia",
//     "Australia", "Europe", "North America", "South America"] },
//   "planet.seas": { seas: ["Mediterranean", "Caribbean", "Baltic"] },
// }
```

`identifier` specifies the lookup argument's schema, not a database column. Here it accepts
`"Sol III"`; `Type.Integer()` would require a number. Extensions receive that same
identifier. `dataShape` validates the returned record.

## Implementation and retrieval

Providers would declare the shape they implement and supply `get(identifier)` and
`list()`. Definition and implementation need not belong to the same service.

### Service E — implements planet.seas

Service E implements the definition supplied by Service C. The in-memory records
below stand in for Service E's own data source.

```ts
const records: Record<string, { seas: string[] }> = {
  "Sol III": { seas: ["Mediterranean", "Caribbean", "Baltic"] },
};

const contracts = {
  implements: {
    semanticDataDefinition: {
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

### Service Discovery

In the above "Service F" example a request is made for `planet.geography` - but how does the system know which data services to request the various data from? For example Seas data comes from Service C - but how is this knowledge stored?

The Voyzu implementation is to create a shared platform registry of all semantic data contracts, their definitions and fulfillment. Only one service implementation per data shape definition is permitted.

In this example, Service C defines seas; Service E implements retrieval. Simplified
registry representation (the planet and continent providers are not shown above):

```ts
const registry = {
  definitions: {
    "planet": serviceA.contracts.defines.semanticDataDefinition["planet"],
    "planet.continents": serviceB.contracts.defines.semanticDataDefinition["planet.continents"],
    "planet.seas": serviceC.contracts.defines.semanticDataDefinition["planet.seas"],
    "planet.geography": serviceD.contracts.defines.semanticDataDefinition["planet.geography"],
  },
  implementations: {
    "planet": planetProvider,
    "planet.continents": continentsProvider,
    "planet.seas": serviceE.contracts.implements.semanticDataDefinition["planet.seas"],
  },
};

// Resolve Service F's request for the composed shape.
const definition = registry.definitions["planet.geography"];
const shapes = [definition.extends, ...definition.extensions];

const result = Object.fromEntries(await Promise.all(
  shapes.map(async (shape) => [
    shape,
    await registry.implementations[shape].get("Sol III"),
  ]),
));
```

The composition has no separate implementor. This illustration omits typing,
validation and missing-provider/record handling.
