# Voyzu Semantic Capability Contract Implementation

This proposes Voyzu's implementation of [Master Semantic Capability Contract](semantic-capability-contract-master.md),
not its current API. Services share a runtime, enabling direct asynchronous calls,
shared execution context, database transactions and generated TypeScript types.
Disconnected services may require different mechanisms.

## A Voyzu contract

Definitions use TypeBox schemas, registered through `voyzu.package.ts`.
Examples assume `import Type from "typebox"`. Names describe capabilities, not
their owning services. Unlike Semantic Data Contracts, capabilities have no
`extends`, `extensions` or shared root identifier.

### Service A — defines planet.terraforming

```ts
const contracts = {
  semanticCapabilityDefinition: {
    defines: {
      "planet.terraforming": {
        definition: "Assess and modify a planet's habitability.",
        functions: {
          assessHabitability: {
            input: Type.Object({ planetId: Type.String() }),
            output: Type.Object({
              habitable: Type.Boolean(),
              score: Type.Number(),
              notes: Type.String(),
            }),
          },
          beginTerraforming: {
            input: Type.Object({ planetId: Type.String() }),
            output: Type.Object({ operationId: Type.String() }),
            transactional: true,
          },
          cancelTerraforming: {
            input: Type.Object({ operationId: Type.String() }),
            output: Type.Object({ cancelled: Type.Boolean() }),
            transactional: true,
          },
        },
      },
    },
  },
};

// assessHabitability receives: { planetId: "Sol IV" }
// Returns: {
//   habitable: false, score: 42,
//   notes: "Atmosphere unsuitable for human life"
// }
// beginTerraforming receives: { planetId: "Sol IV" }
// Returns: { operationId: "TF-001" }
// cancelTerraforming receives: { operationId: "TF-001" }
// Returns: { cancelled: true }
```

Each function declares its own input and output, independently of any data record.
An omitted input means no arguments; an omitted output means no return value.
Explicit object outputs are preferred. An assessment computes a result; ordinary
record retrieval belongs in a Semantic Data Contract.

## Implementation and invocation

One service implements every function in a contract. Definition and implementation
need not belong to the same service.

### Service B — implements planet.terraforming

```ts
// Service B's private operations; their implementations are omitted.
import { assessPlanet, enqueueTerraforming, cancelOperation } from "./terraforming";

const contracts = {
  semanticCapabilityDefinition: {
    implements: {
      "planet.terraforming": {
        assessHabitability: async ({ planetId }: { planetId: string }) =>
          assessPlanet(planetId),
        beginTerraforming: async ({ planetId }: { planetId: string }) =>
          enqueueTerraforming(planetId),
        cancelTerraforming: async ({ operationId }: { operationId: string }) =>
          cancelOperation(operationId),
      },
    },
  },
};

// beginTerraforming receives: { planetId: "Sol IV" }
// Returns: { operationId: "TF-001" } after accepting the work, not completing it.
```

`transactional: true` makes Voyzu run the invocation in a database transaction,
joining an existing transaction when present. Enqueuing work must respect that
transaction; the background job runs separately. Transactions do not roll back
external effects or span the duration of a long-running operation.

Long-running work returns an acknowledgement promptly. Completion notifications
are a separate implementation concern, not a prescribed protocol.

### Consumer example

```ts
const terraforming = capabilities.use("planet.terraforming");

const assessment = await terraforming.assessHabitability({ planetId: "Sol IV" });
// Returns: { habitable: false, score: 42,
//            notes: "Atmosphere unsuitable for human life" }

const operation = await terraforming.beginTerraforming({ planetId: "Sol IV" });
// Returns: { operationId: "TF-001" }

const cancellation = await terraforming.cancelTerraforming(operation);
// Returns: { cancelled: true }
```

Calls return the function's declared output directly, without contract-name wrappers.
Consumers reference the contract, not Service B.

## Service Discovery

Voyzu generates a shared registry and consumer types during composition. It requires
one complete implementor per registered capability and validates function inputs
and outputs when called. Simplified registration:

```ts
const registry = {
  definitions: {
    "planet.terraforming":
      serviceA.contracts.semanticCapabilityDefinition.defines["planet.terraforming"],
  },
  implementations: {
    "planet.terraforming":
      serviceB.contracts.semanticCapabilityDefinition.implements["planet.terraforming"],
  },
};
```

`capabilities.use` requires an implementation; `capabilities.optional` returns
`undefined` when none is registered. An absent optional capability is distinct
from a failed invocation: provider errors are not silently ignored.

These examples omit registration plumbing and error handling.
