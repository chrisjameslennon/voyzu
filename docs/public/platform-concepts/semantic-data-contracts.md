# Semantic Data Contracts

## The problem

Independent software services need to exchange data. This has been true since the dawn of computing and was a driving force in the evolution of the internet. The de facto solution to this challenge has become the Data API - data exchanged over the HTTP protocol. Recently, REST principles have come to be viewed by many as best practice.

However, a network of API providers does not make for a truly integrated system. The reason is that each software service develops its interfaces based on its own, independent paradigm, meaning the language and structure of data exchange are not harmonious across the system as a whole.

## Proposed definitions

- **Data service**. A software system from which data can be retrieved. Sometimes simply called "Service" in this document.
- **Data system**. One or more data services seeking to integrate with each other. Sometimes simply known as "System" in this document.
- **Semantic Data Contract**. A semantic definition of the shape of a discrete item of data.

## Proposed solution

The proposed solution is the establishment of a network of agreed Semantic Data Contracts, forming a combined system-wide Semantic Data Contract. This contract must be flexible enough to allow each service to operate as it needs to, yet concrete enough to be valuable. This Semantic Data Contract should be:
- **distributed** - Semantic Data Contracts can be defined by multiple services
- **composable** - Semantic Data Contracts can be joined together to form other Semantic Data Contracts
- **discoverable** - a given Service within a System should be able to discover its Semantic Data Contracts, and the implementors of those Contacts
- **decoupled** - the service defining the Semantic Data Contract can be, but does not need to be, the implementer of the Contract
- **resiliant** - services can be exchanged for other services without disrupting the system

### Specification

Below is a proposed specification that conforms to the above principles.

#### Semantic Data Contract

A Semantic Data Contract must provide agreed semantic definitions of the data being exchanged. A Semantic Data Contract is a small, focused definition of data. Within a Data System these Semantic Data Contracts combine to form a system-wide Semantic Data Contract.

#### Separation of definition from implementation

The service defining the semantic contract is not necessarily the service implementing the contract. Indeed, several services may implement the same contract, although within a given System it is generally more logical to have only one implementer of a Semantic Data Contract.

#### Technology agnostic

Note that a Semantic Data Contract should not depend on a particular technology, as different services may use differing technology.

#### Data Retrieval, not modification

This is a specification for data retrieval across disparate services; data modification is not in view. Of course, agreed semantic data definitions can also be leveraged to modify data across services.

#### Not an attempt to describe the whole System

A network of Semantic Data Contracts does not need to describe the data structure of the network as a whole. Individual Data Services may have private data, including data that interacts with data defined in Semantic Data Contracts. The requirement is that where data is provided that can be consumed by other services, this data is described by a Semantic Data Contract.

#### Semantic Data Contract definition

A Semantic Data Contract should contain:

- A **Semantic Data Contract name**, unique across the system
- A **unique identifier** for retrieval
- A semantically meaningful **definition** of data being defined
- Optionally, a **Semantic Data Contract definition** - for example, the various fields that make up the shape

#### Semantic Data Contract composition operations

The following composition options are available to a Semantic Data Contract:

- `extends` (Semantic Data Contract name). The name of another Semantic Data Contract this shape intends to extend.
- `extensions` (array of Semantic Data Contract names). Used to compose a Semantic Data Contract from one or more other Semantic Data Contracts.

#### Semantic Data Contract Name

Contract names describe meaning, not the service or package that defines or implements
them: for example, `planet`, `planet.seas` and `organization`. Names must be unique
across the data system. Any namespace should add semantic or domain meaning, not
identify an owner; defining and implementing services are separate concerns.

The Semantic Data Contract Name should match what it defines. The format {Entity}.{Entity Sub Domain} is suggested.

#### Shared identifier

These extension relationships depend on a shared identifier, or a reliable way to translate between identifiers. Options include an agreed natural key such as an ISO country code; a centrally assigned identifier; a globally unique identifier propagated between services; or lookup tables mapping each service’s local identifier to a shared one.

The important requirement is not that every service uses the same database primary key, but that each can resolve the same real-world entity consistently.

#### Example

Consider Service A defining a `planet` Semantic Data Contract containing the planet's name. Services B and C define extensions describing its continents and seas. Service D combines these into `planet.geography`. This allows the separate contributions to be retrieved together using a composed Contract, without duplicating their definitions or owning their data:

```
  Service A defines "planet"
      identifier: planet ID
      fields:
          name

  Service B defines "planet.continents"
      identifier: planet ID
      extends: "planet"
      fields:
          continents

  Service C defines "planet.seas"
      identifier: planet ID
      extends: "planet"
      fields:
          seas

  Service D defines "planet.geography"
      identifier: planet ID
      extends: "planet"
      extensions:
          "planet.continents"
          "planet.seas"

This means that Service D could return a Semantic Data Contract that is a valid definition of, for example:

  {
      identifier: "Sol III",
      name: "Earth",
      continents: ["Africa", "Antarctica", "Asia", "Australia", "Europe", "North America", "South America"],
      seas: ["Mediterranean", "Caribbean", "Baltic"]
  }
```

#### Unique field names across an entity

To enable composition, field names should be unique across a given entity. In the above example, if a service other than Service A also defined a `name` field, then this would result in an invalid composed Semantic Data Contract.

#### Composition vs extension

The same Semantic Data Contract can be generated by either extension or composition. For example, the above end result could also be achieved as follows:

```
  Service A defines "planet"
      identifier: planet ID
      fields:
          name

  Service B defines "planet.continents"
      identifier: planet ID
      extends: "planet"
      fields:
          continents

  Service C defines "planet.geography"
      identifier: planet ID
      extends: "planet.continents"
      fields:
          seas

In this way, a hierarchy is established:

  planet (entity: planet)
  └── planet.continents (entity: planet)
      └── planet.geography (entity: planet)
```

Whether multi-level extensions are supported is up to the implementation. In general, composition is the simpler and more flexible approach.

#### Composing across entities

The flexible nature of Semantic Data Contracts means that it is possible to compose a Semantic Data Contract that mixes different entities. For example, an object could be defined that combines `planet.seas` with, for example, `food.spicyHotDog`. This, of course, does not make a lot of sense, but there is nothing in this specification preventing such combinations.

Where composing across entities may make sense would be an entity hierarchy - for example, a "solar system" Semantic Data Contract that combined planets with suns.

When composing entities, care must be taken to avoid duplicate field names.

#### Implementing a Semantic Data Contract

Any service can implement a Semantic Data Contract. The service must declare the name of the Semantic Data Contract it implements and be able to support data retrieval. The data retrieval methods are up to the implementation specification; at a minimum, the following methods must be supported:

- `get (unique identifier)` Retrieve the Semantic Data Contract data object by unique identifier
- `list` List all Semantic Data Contract data objects

Taking our planets example, a completely separate service, say Service E, could implement `planet.seas` for the `planet` entity as follows:

```
Service E implements "planet.seas"
    identifier: planet ID

    get(planet ID)
        retrieve the seas for this planet from Service C's own data
        return the record, or not found:
            identifier: planet ID
            data:
                seas: [...]

    list()
        retrieve all planet-seas records from Service C's own data
        return a list of records:
            - identifier: "earth"
              data:
                  seas: [...]
```

Note that Service E supplies only the `seas` portion of the data. It does not retrieve the planet's name from Service A or the continents from Service B. The planet ID associates its record with the corresponding records supplied by those services. However, a request for a Service that implements Service D's composed `planet.geography` Semantic Data Contract returns the planet, continents and seas data together.

#### Service Discovery

With the definition of a Semantic Data Contract able to be decoupled from its implementation, there needs to be a way to identify the implementor of a given Semantic Data Contract. Various approaches are possible, the simplest being a published catalog of Semantic Data Contracts, including implementation details. A simple example catalog using our "planets" example:

| Semantic Data Contract name | Defining service | Implementing service |
| --- | --- | --- |
| `planet` | Service A | Service A |
| `planet.continents` | Service B | Service B |
| `planet.seas` | Service C | Service E |
| `planet.geography` | Service D | Service F |

In this example, Services A and B implement their own definitions, Service E
implements Service C's definition, and a further Service F implements Service D's
composition by retrieving and combining the contributions from A, B and E using
the shared planet identifier.

## Specification Implementation

A system specification implementation should define the above concepts and principles in greater detail. Three specifications are suggested as possibilities:

### Meta contract specification

The concrete definition of the above specification. For example, how Semantic Data Contract data definitions will be described, and so on.

### Semantic contract definitions

This document describes the various business objects (Semantic Data Contracts) and their fields that will be shared across the system.

### Technical contract implementation specification

A technical implementation specification would be a separate document, and would generally be specific to a data service. It would describe the mechanisms used to fulfill the above meta specification and semantic definitions. This could include database information, middle tier technology, authorization and authentication and so on.

## Appendix

### Examples

- [Voyzu meta Semantic Data Contract](semantic-data-contract-meta.md) — Voyzu implementation with TypeScript examples.
- [Voyzu Semantic Data Contracts](semantic-data-contract.md) — Voyzu Semantic Data Contracts and their data definitions.
