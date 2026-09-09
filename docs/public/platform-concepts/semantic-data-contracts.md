# Semantic data contracts

## The problem

Independent software services need to exchange data. This has been true since the dawn of computing and was a driving force in the evolution of the internet. The de facto solution to this challenge has become the Data API - data exchanged over the HTTP protocol. Recently, REST principles have come to be viewed by many as best practice.

However, a network of API providers does not equal a truly integrated system. The reason is that each software service develops its interfaces based on its own, independent paradigm, meaning the language and structure of data exchange are not harmonious across the system as a whole. The classic "elephant" paradigm illustrates this point nicely. Each service sees the wider system only from its own vantage point.

## Proposed definitions

- **Data service**. A software system from which data can be retrieved
- **Data system**. One or more data services seeking to integrate with each other
- **Semantic Data Contract**. Sometimes known as a Master Data Record. A meta-definition of a single item of data.

## Proposed solution

The proposed solution is the establishment of an agreed semantic data contract. This contract must be flexible enough to allow each service to operate as it needs to, yet concrete enough to be valuable. This semantic data contract should be:
- distributed
- composable
- discoverable
- decoupled from its implementation

### Semantic definitions of data

A semantic data contract must provide agreed semantic definitions of the data being exchanged. This must include unique names for each Semantic Data Contract.

Contract names describe meaning, not the service or package that defines or implements
them: for example, `planet`, `planet.seas` and `organization`. Names must be unique
across the data system. Any namespace should add semantic or domain meaning, not
identify an owner; defining and implementing services are recorded separately.

### Separation of definition from implementation

The first principle to introduce is that the service defining the semantic contract is not necessarily the service implementing the contract. Indeed, several services may implement the same contract.

### Technology agnostic

Note that a semantic data contract should not depend on a particular technology, as different services may use differing technology.

### Data Retrieval, not modification

This is a specification for data retrieval across disparate services; data modification is not in view. Of course, agreed semantic data definitions can also be leveraged to modify data across services.

### Specification

Below is a proposed specification that conforms to the above principles.

#### Semantic Data Contract definition

A Semantic Data Contract should contain:

- A **Semantic Data Contract name**, unique across the system
- An **entity name**
- A **unique identifier** for retrieval
- A semantically meaningful **definition** 
- Optionally, a **Semantic Data Contract definition** - for example, the various fields that make up the shape

#### Semantic Data Contract composition operations

The following composition options are available to a Semantic Data Contract:

- `extends` (Semantic Data Contract name). The name of another Semantic Data Contract this shape intends to extend.
- `extensions` (array of Semantic Data Contract names). Used to compose a Semantic Data Contract from one or more other Semantic Data Contracts.

#### Entity Name

A Semantic Data Contract name is a unique identifier for a data contract; given that data contracts can be combined, there is a need to describe the entity that the contract contributes to.

#### Shared identifier

These extension relationships depend on a shared identifier, or a reliable way to translate between identifiers. Options include an agreed natural key such as an ISO country code; a centrally assigned identifier; a globally unique identifier propagated between services; or lookup tables mapping each service’s local identifier to a shared one.

The important requirement is not that every service uses the same database primary key, but that each can resolve the same real-world entity consistently.

#### Example

Consider Service A defining a `planet` Semantic Data Contract containing the planet's name. Services B and C define extensions describing its continents and seas. Service D combines these into `planet.geography`. All four contracts declare `planet` as their entity, allowing the separate contributions to be retrieved together using a shared planet identifier, without duplicating their definitions or owning their data:

```
  Service A defines "planet"
      entity: planet
      identifier: planet ID
      fields:
          name

  Service B defines "planet.continents"
      entity: planet
      identifier: planet ID
      extends: "planet"
      fields:
          continents

  Service C defines "planet.seas"
      entity: planet
      identifier: planet ID
      extends: "planet"
      fields:
          seas

  Service D defines "planet.geography"
      entity: planet
      identifier: planet ID
      extends: "planet"
      extensions:
          "planet.continents"
          "planet.seas"

Meaning that Service D could return, for example:

  {
      name: "Earth",
      continents: ["Africa", "Antarctica", "Asia", "Australia", "Europe", "North America", "South America"],
      seas: ["Mediterranean", "Caribbean", "Baltic"]
  }
```

#### Unique field names within an entity

To enable composition field names should be unique within a given entity. In the above example if Service other than Service A also defined a `name` field, then this would result in an invalid Semantic Data Contract.


#### Composition vs extension

The same Semantic Data Contract can be generated by either extension or composition. For example, the above end result could also be achieved as follows:

```
  Service A defines "planet"
      entity: planet
      identifier: planet ID
      fields:
          name

  Service B defines "planet.continents"
      entity: planet
      identifier: planet ID
      extends: "planet"
      fields:
          continents

  Service C defines "planet.geography"
      entity: planet
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

The flexible nature of Semantic Data Contracts means that it is possible to compose a Semantic Data Contract that mixes different entities. For example, an object could be defined that combines planet.seas with, for example, food.spicyHotDog. This, of course, does not make a lot of sense, but there is nothing in this specification preventing such combinations.

Where composing across entities may make sense would be an entity hierarchy - for example, a "solar system" Semantic Data Contract that combined planets with suns.

When composting entities care must be taken to avoid duplicate field names

#### Implementing a Semantic Data Contract

Any service can implement a Semantic Data Contract. The service must declare the name of the Semantic Data Contract it implements and be able to support data retrieval. The data retrieval methods are up to the implementation specification; at a minimum, the following methods must be supported:

- `get (unique identifier)` Retrieve the Semantic Data Contract by unique identifier
- `list` List all Semantic Data Contracts

For example, Service C in our first example could implement `planet.seas` for the `planet` entity as follows:

```
Service C implements "planet.seas"
    entity: planet
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

Note that Service C supplies only the seas portion. It does not retrieve the planet's name from Service A or the continents from Service B. The planet ID associates its record
with the corresponding records supplied by those services. However, a request for Service D's composed `planet.geography` returns the planet, continents and seas data together.

#### Service Discovery

With the definition of a Semantic Data Contract decoupled from its implementation, there needs to be a way to identify the implementor of a given Semantic Data Contract. Various approaches are possible, the simplest being a published catalog of Semantic Data Contracts, including implementation details.

## Specification Implementation

A system specification implementation should define the above concepts and principles in greater detail, especially:

### Meta contract specification

The concrete definition of the above specification. For example, by what means will unique data records be identified, how will Semantic Data Contract definitions be described, and so on?

### Semantic contract definitions

This document describes the various business objects (Semantic Data Contracts) and their fields that will be shared across the system.

### Technical contract implementation specification

A technical implementation specification would be a separate document, and would generally be specific to a data service. It would describe the mechanisms used to fulfill the above meta specification and semantic definitions. This could include database information, middle tier technology, authorization and authentication and so on.
