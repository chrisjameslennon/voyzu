# Master Semantic Data Contract

## The problem

Independent software services need to exchange data. This has been true since the dawn of computing and was a driving force in the evolution of the internet. The de facto solution to this challenge has become the Data API - data exchanged over the HTTP protocol. Recently, REST principles have come to be viewed by many as best practice.

However, a network of API providers does not make for a truly integrated system. The reason is that each software service develops its interfaces based on its own, independent paradigm, meaning the language and structure of data exchange are not harmonious across the system as a whole.

## Proposed solution

The proposed solution is the establishment of agreed Semantic Data Contracts, forming a combined system-wide Semantic Data Contract System. This System must be flexible enough to allow each service to operate as it needs to, yet concrete enough to be valuable.

This Semantic Data Contract System should be:

- **distributed** - Semantic Data Contracts can be defined by multiple services
- **composable** - Semantic Data Contracts can be joined together to form other Semantic Data Contracts
- **discoverable** - a given Service within a System should be able to discover its Semantic Data Contracts, and the implementors of those Contracts
- **decoupled** - the service defining the Semantic Data Contract can be, but does not need to be, the implementer of the Contract
- **resilient** - services can be exchanged for other services without disrupting the system

## Proposed Draft Specification

_Version: 0.1_

### Definitions

- **Data Service**. A software system from which data can be retrieved. Sometimes simply called "Service" in this document. 
- **Entity**. A logical way to group data. For example `user` or `customer`.
- **Semantic Data Contract**. A semantic definition of the shape of a discrete item of data. Sometimes called "Contract" here.
- **Semantic Data Contract Catalog** An accessible listing of Semantic Data Contracts together with the Data Services that define and implement them
- **Semantic Data Contract System**. a Data System whose participating services define, implement, discover, and consume a shared set of Semantic Data Contracts. Sometimes simply known as "System" in this document.

### Relationship of this specification to the Semantic Capability Contract Specification

This document sits beside the [Semantic Capability Contract Specification](./data-capability-contracts.md). The Specifications are not formally coupled together, but do work well together; this Semantic Data Contract Specification providing an interoperability framwwork for the exchange of read-only data, and the Capability Contract Specification providing an interoperability framework for data modification, as well as other, non data functionality.

### Principles

#### Semantic

A Semantic Data Contract is a meaningful, structured, human readable definition of a data grouping.

#### Separation of definition from implementation

The Service defining the Semantic Data Contract is not necessarily the service implementing the Contract. Indeed, several services may implement the same Contract, although within a given System it is generally more logical to have only one implementer of a Semantic Data Contract.

#### Technology agnostic

A Semantic Data Contract should not depend on a particular technology, as different Services may use differing technology. A shared protocol, such as HTTP is generally useful to standardize on within a System.


#### Data Retrieval, not modification

This is a specification for data retrieval across disparate services; data modification is not in view. Of course, agreed semantic data definitions can also be leveraged to provide clarity to services that modify data.

#### Not an attempt to describe the whole System

A system of Semantic Data Contracts does not need to describe the data structure of the System as a whole. Individual Data Services may have private data, including data that interacts with data defined in Semantic Data Contracts. The requirement is that where data is provided that can be consumed by other Services, this data is described by a Semantic Data Contract.

### Semantic Data Contract definition

A Semantic Data Contract should contain:

- A **Semantic Data Contract name**, beginning with the Entity being described and unique across the System.
- Optionally, a semantically meaningful **definition** of data being defined
- Optionally, a **Semantic Data Contract definition** - for example, the various fields that make up the shape
- Optionally a **queries** section defining the data query operations that can be performed on the object

#### Semantic Data Contract composition operations

The following composition options are optionally available to a Semantic Data Contract:

- `extends` (Semantic Data Contract name). The name of another Semantic Data Contract this shape intends to extend.

**Examples**

    - extends: "planet"
    - extends: "planet.mountains"

- `extensions` (array of Semantic Data Contract names). Used to compose a Semantic Data Contract from one or more other Semantic Data Contracts.

**Example**

- extensions ["planet.mountains","planet.atmosphere"]

#### Semantic Data Contract name

The name of the Semantic Data Contract must follow the format `{entity name}.{optional entity sub domain}.{etc}`. Where there is no subdomain the Contract is by definition defining the root entity.

**Examples**

- planet
- planet.atmosphere
- planet.mountains

#### Shared identifier

Extension compositions depend on a shared identifier. The Root Semantic Data Contract, and only the Root Contract defines the identifier by supplying in the Contract:
- An **identifier name**
- An **identifier data definition**, being the data type of the identifier

Because Semantic Data Contracts can come from different Services, and can be composed, the underlying data sources may differ in how they define a unique identifier. In this case options include an agreed natural key such as an ISO country code; a centrally assigned identifier; a globally unique identifier propagated between services; or lookup tables mapping each service’s local identifier to a shared one.

The important requirement is not that every service uses the same database primary key, but that each can resolve the same real-world entity consistently.

**Example**

- IdentifierName: `PlanetId`
- IdentifierDataDefinition: `string`

#### Queries

The Queries section lists supported queries and their input definitions. Each query returns an array of records containing the entity identifier and the full data described by the Contract, with no extra fields.

**Example**

```
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
```

The output shape is implicit. Here, height is measured in metres above the planet's reference surface.

### Example

Consider Service A defining a `planet` Semantic Data Contract containing the planet's name. Services B and C define extensions describing its mountains and atmosphere. Service D combines these into `planet.geography`. This allows the separate contributions to be retrieved together using a composed Contract, without duplicating their definitions or owning their data:

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

#### Semantic Data Contract must add value

In addition to mandatory properties, a Semantic Data Contract must include one or both of:
- a data definition
- an extensions clause

A Contract may include an extends clause, but simply extending a Contract adds no value; the Contract must also define data or extend data (or both)

### Considerations

#### Composition vs extension

The same Semantic Data Contract can be generated by either extension or composition. For example, the above end result could also be achieved as follows:

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

### Implementing a Semantic Data Contract

Any service can implement a Semantic Data Contract. The service must declare the name of the Semantic Data Contract it implements and be able to support data retrieval. The data retrieval methods are up to the implementation specification; at a minimum, the following methods must be supported:

- `get (unique identifier)` Retrieve the Semantic Data Contract data object by unique identifier
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

With the definition of a Semantic Data Contract able to be decoupled from its implementation, there needs to be a way to identify the implementor of a given Semantic Data Contract. Various approaches are possible, the simplest being a published catalog of Semantic Data Contracts, including implementation details. A simple example Semantic Data Contract Catalogue, using our "planets" example:

| Semantic Data Contract name | Defining service | Implementing service |
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

### Implementation specification

The concrete definition of the above specification. For example, how Semantic Data Contract data definitions will be described, and so on.

### Semantic contract definitions

This document describes the various business objects (Semantic Data Contracts) and their fields that will be shared across the System.

### Technical contract implementation specification

A technical implementation specification would be a separate document, and would generally be specific to a Data Service. It would describe the mechanisms used to fulfill the above implementation specification and semantic definitions. This could include database information, middle tier technology, authorization and authentication and so on.

## Appendix

### Examples

- [Voyzu Semantic Data Contract Implementation](semantic-data-contract-implementation.md) — Voyzu implementation with TypeScript examples.
- [Voyzu Semantic Data Contracts](semantic-data-contract.md) — Voyzu Semantic Data Contracts and their data definitions.
