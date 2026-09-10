# Semantic Capability Contracts

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

## Proposed Draft Specification

_Version: 0.1_

### Definitions

- **Capability Service**. A software system that provides one or more Capability. Sometimes simply called "Service" in this document. 
- **Semantic Capability Contract**. A semantic definition of the capability offered. Sometimes called "Contract" here.
- **Semantic Capability Contract Catalog** An accessible listing of Semantic Capability Contracts together with the Capability Services that define and implement them
- **Semantic Capability Contract System**. a software System whose participating services define, implement, discover, and consume a shared set of Semantic Capability Contracts. Sometimes simply known as "System" in this document.

### Principles

#### Semantic

A Semantic Capability Contract is a meaningful, structured, human readable definition of Capabilities.

#### Separation of definition from implementation

The Service defining the Semantic Capability Contract is not necessarily the service implementing the Contract. Indeed, several services may implement the same Contract, although within a given System it is generally more logical to have only one implementer of a Semantic Capability Contract.

#### Technology agnostic

A Semantic Capability Contract should not depend on a particular technology, as different Services may use differing technology.

#### Not an attempt to describe the whole System

A system of Semantic Capability Contracts does not need to describe all capabilities used within the System as a whole. Individual software Services may use private capabilities, including capabilties that interact with capabilties defined in Semantic Capability Contracts. The requirement is that where a capability is provided that can be consumed by other Services, this Capability is described by a Semantic Capability Contract.

### Semantic Capability Contract definition

A Semantic Capability Contract should contain:

- A **Semantic Capability Contract name**, beginning with the Entity being described and unique across the System.
- A semantically meaningful **definition** of data being defined
- One or more ***functions** that optionally receive input and optionally return output

#### Semantic Capability Contract name

The name of the Semantic Capability Contract must follow the format `{capability name}`. Periods (`.`) can be used to denote domains and sub domains if desired

**Examples**

- planet
- planet.atmosphere
- planet.mountains

#### Functions



### Example

Consider Service A defining a `planet` Semantic Capability Contract containing the planet's name. Services B and C define extensions describing its mountains and atmosphere. Service D combines these into `planet.geography`. This allows the separate contributions to be retrieved together using a composed Contract, without duplicating their definitions or owning their data:

```
  Service A defines "planet"
  As the root entity it must also define the identifier

    planet:
      identifier: PlanetId
      identifierDataDefinition: string
      dataDefinition:
        fields
          - name

  Service B defines "planet.mountains"
    planet.mountains:
      extends: "planet"

      dataDefinition:
        fields:
          mountains

      queries:
        getHighMountains:
          inputDataDefinition:
            minimumHeightMeters:
              type: number

  Service C defines "planet.atmosphere"
      extends: "planet"
      dataDefinition
        fields:
          atmosphere

  Service D defines "planet.geography"
      extends: "planet"
      extensions:
          "planet.mountains"
          "planet.atmosphere"

An implementor of Service D's Contract could return, for example:

  {
      PlanetId: "Sol III",
      name: "Earth",
      mountains: ["Mount Everest"],
      atmosphere: ["Nitrogen", "Oxygen"]
  }

or:

  {
      PlanetId: "Sol IV",
      name: "Mars",
      mountains: ["Olympus Mons"],
      atmosphere: ["Carbon dioxide"]
  }

The above being examples only, not of course a complete listing of all planetary features.
```

### Further requirements 

#### Semantic Capability Contract must add value

In addition to mandatory properties, a Semantic Capability Contract must include one or both of:
- a data definition
- an extensions clause

A Contract may include an extends clause, but simply extending a Contract adds no value; the Contract must also define data or extend data (or both)

### Considerations

#### Composition vs extension

The same Semantic Capability Contract can be generated by either extension or composition. For example, the above end result could also be achieved as follows:

```
  Service A defines "planet"
      identifier: PlanetId
      identifierDataDefinition: string
      dataDefinition:
        fields:
            name

  Service B defines "planet.mountains"
      extends: "planet"
      dataDefinition:
        fields:
          mountains

  Service C defines "planet.geography"
      extends: "planet.mountains"
      dataDefinition:
        fields:
          atmosphere

In this way, a hierarchy is established:

  planet (entity: planet)
  └── planet.mountains (entity: planet)
      └── planet.geography (entity: planet)
```

Whether multi-level extensions are supported is up to the implementation. In general, composition is the simpler and more flexible approach.

For the combined result, retrieval assembles ancestor contributions using the shared identifier; each provider supplies only its own defined data.

### Implementing a Semantic Capability Contract

Any service can implement a Semantic Capability Contract. The service must declare the name of the Semantic Capability Contract it implements and be able to support data retrieval. The data retrieval methods are up to the implementation specification; at a minimum, the following methods must be supported:

- `get (unique identifier)` Retrieve the Semantic Capability Contract data object by unique identifier
- all queries defined by the Contract

Taking our planets example, a completely separate service, say Service E, could implement `planet.mountains` as follows:

```
Service E implements "planet.mountains"
    uses the planet identifier defined by "planet"

    get(PlanetId)
        retrieve the mountains for this planet from Service E's own data
        return the full planet.mountains record, or not found

        example input: "Sol III"
        example output:
            PlanetId: "Sol III"
            mountains: ["Mount Everest"]

    queries:
        getHighMountains(minimumHeightMeters)
            find planets with a mountain at or above minimumHeightMeters
            using Service E's own data
            return their full planet.mountains records, not filtered mountain lists

            example input:
                minimumHeightMeters: 8000
            example output:
                - PlanetId: "Sol III"
                  mountains: ["Mount Everest"]
                - PlanetId: "Sol IV"
                  mountains: ["Olympus Mons"]
```

Service E supplies the identifier and the `mountains` data defined by Service B.
It does not retrieve the planet's name from Service A or its atmosphere from
Service C. The shared planet identifier associates these contributions. A service
implementing Service D's composed `planet.geography` returns the planet, mountains
and atmosphere data together.

### Service Discovery

With the definition of a Semantic Capability Contract able to be decoupled from its implementation, there needs to be a way to identify the implementor of a given Semantic Capability Contract. Various approaches are possible, the simplest being a published catalog of Semantic Capability Contracts, including implementation details. A simple example Semantic Capability Contract Catalogue, using our "planets" example:

| Semantic Capability Contract name | Defining service | Implementing service |
| --- | --- | --- |
| `planet` | Service A | Service A |
| `planet.mountains` | Service B | Service E |
| `planet.atmosphere` | Service C | Service C |
| `planet.geography` | Service D | Service F |

In this example, Services A and C implement their own definitions, Service E
implements Service B's definition, and a further Service F implements Service D's
composition by retrieving and combining the contributions from A, E and C using
the shared planet identifier.

## Specification Implementation

A system specification implementation should define the above concepts and principles in greater detail. Three specifications are suggested as possibilities:

### Meta contract specification

The concrete definition of the above specification. For example, how Semantic Capability Contract data definitions will be described, and so on.

### Semantic contract definitions

This document describes the various business objects (Semantic Capability Contracts) and their fields that will be shared across the system.

### Technical contract implementation specification

A technical implementation specification would be a separate document, and would generally be specific to a data service. It would describe the mechanisms used to fulfill the above meta specification and semantic definitions. This could include database information, middle tier technology, authorization and authentication and so on.

## Appendix

### Examples

- [Voyzu meta Semantic Capability Contract](semantic-data-contract-meta.md) — Voyzu implementation with TypeScript examples.
- [Voyzu Semantic Capability Contracts](semantic-data-contract.md) — Voyzu Semantic Capability Contracts and their data definitions.


