# Master Semantic Capability Contract

## The problem

Independent software services need to offer capabilties. This has been true since the dawn of computing and was a driving force in the evolution of the internet. The de facto solution to this challenge has become the HTTP API. Recently, REST principles have come to be viewed by many as best practice.

However, a network of API providers does not make for a truly integrated system. The reason is that each software service develops its interfaces based on its own, independent paradigm, meaning the capabilties offered are not harmonious across the system as a whole.

## Proposed solution

The proposed solution is the establishment of agreed Semantic Capability Contracts, forming a combined system-wide Semantic Capability Contract System. This System must be flexible enough to allow each service to operate as it needs to, yet concrete enough to be valuable.

This Semantic Capability Contract System should be:

- **distributed** - Semantic Capability Contracts can be defined by multiple services
- **discoverable** - a given Service within a System should be able to discover its Semantic Capability Contracts, and the implementors of those Contracts
- **decoupled** - the service defining the Semantic Capability Contract can be, but does not need to be, the implementer of the Contract
- **resilient** - services can be exchanged for other services without disrupting the system

## Specification

_Version: 0.1_

### Definitions

- **Capability Service**. A software system that provides one or more Capability. Sometimes simply called "Service" in this document. 
- **Entity**. A logical way to group data. For example `user` or `customer`.
- **Semantic Capability Contract**. A semantic definition of the capability offered. Sometimes called "Contract" here.
- **Semantic Capability Contract Catalog** An accessible listing of Semantic Capability Contracts together with the Capability Services that define and implement them
- **Semantic Capability Contract System**. a software System whose participating services define, implement, discover, and consume a shared set of Semantic Capability Contracts. Sometimes simply known as "System" in this document.

### Relationship of this specification to the Semantic Data Contract Specification

This document sits beside the [Master Semantic Data Contract](./semantic-data-contract-master.md). The Specifications are not formally coupled together, but do work well together; the Semantic Data Contract Specification providing an interoperability framwwork for the exchange of read-only data, and this Capability Contract Specification providing an interoperability framework for data modification, as well as other, non data functionality.

### Principles

#### Semantic

A Semantic Capability Contract is a meaningful, structured, human readable definition of Capabilities.

#### Separation of definition from implementation

The Service defining the Semantic Capability Contract is not necessarily the service implementing the Contract. Indeed, several services may implement the same Contract, although within a given System it is generally more logical to have only one implementer of a Semantic Capability Contract.

#### Technology agnostic

A Semantic Capability Contract should not depend on a particular technology, as different Services may use differing technology. A shared protocol, such as HTTP is generally useful to standardize on within a System.

#### Not an attempt to describe the whole System

A system of Semantic Capability Contracts does not need to describe all capabilities used within the System as a whole. Individual software Services may use private capabilities, including capabilties that interact with capabilties defined in Semantic Capability Contracts. The requirement is that where a capability is provided that can be consumed by other Services, this Capability is described by a Semantic Capability Contract.

#### Not designed for data read operations

Semantic Capability Contracts are useful for data modification and other operations that cause or request an action, and should not be used to retrieve data.

### Semantic Capability Contract definition

A Semantic Capability Contract should contain:

- A **Semantic Capability Contract name**
- Optionally, a semantically meaningful **definition** of the capability being offered
- One or more **functions** that optionally receive input and optionally return output

#### Semantic Capability Contract name

The name of the Semantic Capability Contract must follow the format `{capability name}`. Periods (`.`) can be used to denote domains and sub domains if desired. Funtions that perform data operations on an Entity, should begin with the name of that Entity.

**Examples**

- planet
- planet.atmosphere
- planet.mountains

#### Functions

Functions perform work; they may modify data, perform operations such as processing and so on. They can optionally take input and optionally return output.

### Example

```
Service A defines "planet.terraforming"

  planet.terraforming:
    definition:
      Provides operations for assessing and modifying a planet's habitability.

    functions:

      assessHabitability:
        input:
          planetId:
            type: string

        output:
          habitable:
            type: boolean
          score:
            type: number
          notes:
            type: string


Service B implements "planet.terraforming"

  assessHabitability(planetId)
      assess the supplied planet
      return its habitability assessment


Example call:

  planetTerraforming.assessHabitability(
      planetId: "Sol IV"
  )

Example result:

  {
      habitable: false,
      score: 42,
      notes: "Atmosphere unsuitable for human life"
  }
```

### Further requirements 

#### No extensions

Unlike the Semantic Data Capability Specification, Semantic Capability Contracts do not allow extension. Services can of course work together - for example Service A could call Service B as a part of its operation. However this is informal and up to the Service implementor.

#### Functions within a Contract must be implemented as a group

Within a given namespace (Semantic Capability Contract) all functions must be declared as a group. A Service other than the defining Service can implement the functions, but all functions within the namespace must be implemented by that Service.

### Considerations

#### Long running operations

If an operation that is designed to be user-facing could exceed a reasonable user wait time, then that operation should perform its work asynchrounously. A completed notification can be provided, for example by way of a web hook. This specification is currently agnostic towards notification protocols.

### Implementing a Semantic Capability Contract

Any Service can implement a Semantic Capability Contract. The Service must declare the name of the Semantic Capability Contract it implements and must implement all functions in full. 

### Service Discovery

With the definition of a Semantic Capability Contract able to be decoupled from its implementation, there needs to be a way to identify the implementor of a given Semantic Capability Contract. Various approaches are possible, the simplest being a published catalog of Semantic Capability Contracts, including implementation details. A simple Semantic Capability Contract Catalogue could look like:

| Contract name | Functions | Defining service | Implementing service |
| --- | --- | --- | --- |
| `planet.terraforming` | `assessHabitability`, `beginTerraforming`, `cancelTerraforming` | Service A | Service B |
| `planet.navigation` | `calculateRoute`, `calculateTravelTime`, `initiateJourney` | Service C | Service D |
| `planet.orbit` | `placeSatellite`, `changeOrbit`, `deorbitSatellite` | Service E | Service E |

Services B and D implement contracts defined by A and C; Service E defines and
implements its own contract. Each implementor supplies all functions in its contract.

## Specification Implementation

A system specification implementation should define the above concepts and principles in greater detail. Three specifications are suggested as possibilities:

### Implementation specification

The concrete definition of the above specification. For example, how Semantic Capability Contract data definitions will be described, and so on.

### Semantic contract definitions

This document describes the various namespaces and functions (Semantic Capability Contracts) and their parameters that will be shared across the System.

### Technical contract implementation specification

A technical implementation specification is a separate document, generally specific to a Service. It describes the mechanisms used to fulfill the above implementation specification and semantic definitions. This can include database information, middle tier technology, authorization and authentication and so on.

## Appendix

### Examples

- [Voyzu Semantic Capability Contract Implementation](semantic-capability-contract-implementation.md) — Voyzu implementation with TypeScript examples.
- [Voyzu Semantic Capability Contracts](semantic-capability-contract.md) — Voyzu Semantic Capability Contracts and their functions.


