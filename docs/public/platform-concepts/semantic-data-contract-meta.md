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
      "serviceA.planet": {
        entity: "planet",
        identifier: Type.String(),
        dataDefinition: Type.Object({ name: Type.String() }),
      },
    },
  },
};

// Example lookup: "serviceA.planet", identifier: "Sol III"
// Result: { name: "Earth" }
```

### Service B — continents

```ts
const contracts = {
  defines: {
    semanticDataDefinition: {
      "serviceB.continents": {
        entity: "planet",
        extends: "serviceA.planet",
        identifier: Type.String(),
        dataDefinition: Type.Object({ continents: Type.Array(Type.String()) }),
      },
    },
  },
};

// Example lookup: "serviceB.continents", identifier: "Sol III"
// Result: { continents: ["Africa", "Antarctica", "Asia", "Australia",
//                        "Europe", "North America", "South America"] }
```

### Service C — seas

```ts
const contracts = {
  defines: {
    semanticDataDefinition: {
      "serviceC.seas": {
        entity: "planet",
        extends: "serviceA.planet",
        identifier: Type.String(),
        dataDefinition: Type.Object({ seas: Type.Array(Type.String()) }),
      },
    },
  },
};

// Example lookup: "serviceC.seas", identifier: "Sol III"
// Result: { seas: ["Mediterranean", "Caribbean", "Baltic"] }
```

### Service D — geography

```ts
const contracts = {
  defines: {
    semanticDataDefinition: {
      "serviceD.geography": {
        entity: "planet",
        extends: "serviceA.planet",
        identifier: Type.String(),
        extensions: ["serviceB.continents", "serviceC.seas"],
      },
    },
  },
};

// Example lookup: "serviceD.geography", identifier: "Sol III"
// Result: {
//   "serviceA.planet": { name: "Earth" },
//   "serviceB.continents": { continents: ["Africa", "Antarctica", "Asia",
//     "Australia", "Europe", "North America", "South America"] },
//   "serviceC.seas": { seas: ["Mediterranean", "Caribbean", "Baltic"] },
// }
```

`entity` names the subject of the contract: all four definitions contribute to the
`planet` entity. The contract name identifies a particular definition and resolves
its provider or composition; the entity name does not select a provider. A service
prefix in these examples is a naming convention, not a direct service reference.

`identifier` specifies the lookup argument's schema, not a database column. Here it accepts
`"Sol III"`; `Type.Integer()` would require a number. Extensions receive that same
identifier. `dataShape` validates the returned record.

## Implementation and retrieval

Providers would declare the shape they implement and supply `get(identifier)` and
`list()`. Definition and implementation need not belong to the same service.

### Service E — implements serviceC.seas

Service E implements the definition supplied by Service C. The in-memory records
below stand in for Service E's own data source.

```ts
const records: Record<string, { seas: string[] }> = {
  "Sol III": { seas: ["Mediterranean", "Caribbean", "Baltic"] },
};

const contracts = {
  implements: {
    semanticDataDefinition: {
      "serviceC.seas": {
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

### Service F — retrieves serviceD.geography

```ts
const geography = await semanticData.get("serviceD.geography", "Sol III");

// Returns:
// {
//   "serviceA.planet": { name: "Earth" },
//   "serviceB.continents": {
//     continents: ["Africa", "Antarctica", "Asia", "Australia",
//                  "Europe", "North America", "South America"]
//   },
//   "serviceC.seas": {
//     seas: ["Mediterranean", "Caribbean", "Baltic"]
//   }
// }
```

Voyzu would generate registrations and consumer types during composition, then
validate identifiers and returned data when called.

### Service Discovery

In the above "Service F" example a request is made for `serviceD.geography` - but how does the system know which data services to request the various data from? For example Seas data comes from Service C - but how is this knowledge stored?

The Voyzu implementation is to create a shared platform registry of all semantic data contracts, their definitions and fulfillment. Only one service implementation per Semantic Data Contract definition is permitted.

In this example, Service C defines seas; Service E implements retrieval. Simplified
registry representation (the planet and continent providers are not shown above):

```ts
const registry = {
  definitions: {
    "serviceA.planet": serviceA.contracts.defines.semanticDataDefinition["serviceA.planet"],
    "serviceB.continents": serviceB.contracts.defines.semanticDataDefinition["serviceB.continents"],
    "serviceC.seas": serviceC.contracts.defines.semanticDataDefinition["serviceC.seas"],
    "serviceD.geography": serviceD.contracts.defines.semanticDataDefinition["serviceD.geography"],
  },
  implementations: {
    "serviceA.planet": planetProvider,
    "serviceB.continents": continentsProvider,
    "serviceC.seas": serviceE.contracts.implements.semanticDataDefinition["serviceC.seas"],
  },
};

// Resolve Service F's request for the composed shape.
const definition = registry.definitions["serviceD.geography"];
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
