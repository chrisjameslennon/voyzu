# Semantic data contracts

## The problem

Independent software services need to exchange data. This has been true since the dawn of computing and was a driving force in the evolution of the internet. The de facto solution to this challenge has become the Data API - data exchanged over the HTTP protocol. Recently, REST principles have come to be viewed by many as best practice.

However, a network of API providers does not equal a truly integrated system. The reason is that each software service develops its interfaces based on its own, independent paradigm, meaning the language and structure of data exchange are not harmonious across the system as a whole. The classic "elephant" paradigm illustrates this point nicely. Each service sees the wider system only from its own vantage point.

## Proposed definitions

- **Data service**. A software system from which data can be retrieved
- **Data system**. One or more data services seeking to integrate with each other
- **Data shape**. Sometimes known as a Master Data Record. A meta-definition of a single item of data.

## Proposed solution

The proposed solution is the establishment of an agreed semantic data contract. This contract must be flexible enough to allow each service to operate as it needs to, yet concrete enough to be valuable.

### Semantic definitions of data

A semantic data contract must provide agreed semantic definitions of the data being exchanged. This must include unique names for each data shape.

### Separation of definition from implementation

The first principle to introduce is that the service defining the semantic contract is not necessarily the service implementing the contract. Indeed, several services may implement the same contract.

### Technology agnostic

Note that a semantic data contract should not depend on a particular technology, as different services may use differing technology.

### Data Retrieval, not modification

This is a specification for data retrieval across disparate services; data modification is not in view. Of course, agreed semantic data definitions can also be leveraged to modify data across services.

### Specification

Below is a proposed specification that conforms to the above principles.

#### Data shape definition

A data shape should contain:

- A **data shape name**, unique across the system
- A **unique identifier** for retrieval
- A semantically meaningful **definition** 
- Optionally, a **data shape definition** - for example, the various fields that make up the shape

#### Data shape composition operations

The following composition options are available to a data shape:

- `extends` (data shape name). The name of another data shape this shape intends to extend.
- `extensions` (array of data shape names). Used to compose a data shape from one or more other data shapes.

#### Shared identifier

These extension relationships depend on a shared identifier, or a reliable way to translate between identifiers. Options include an agreed natural key such as an ISO country code; a centrally assigned identifier; a globally unique identifier propagated between services; or lookup tables mapping each service’s local identifier to a shared one.

The important requirement is not that every service uses the same database primary key, but that each can resolve the same real-world entity consistently.


#### Example

Consider a service that defines a `country` data shape, a generic object with, for example, a country ISO code and name. A financial service also uses countries, but must append tax information to be useful. To avoid duplication, the finance service extends country as follows:

```
  Service A defines "planet"
      identifier: planet ID
      fields:
          name

  Service B defines "planet.continents"
      extends: "planet"
      fields:
          continents

  Service C defines "planet.seas"
      extends: "planet"
      fields:
          seas

  Service D defines "planet.geography"
      extends: "planet"
      extensions:
          "planet.continents"
          "planet.seas"

Service D composes the data supplied by A, B and C without duplicating their definitions or owning their data:

  {
      "planet": {
          name: "Earth"
      },
      "planet.continents": {
          continents: [...]
      },
      "planet.seas": {
          seas: [...]
      }
  }
```



#### Implementing a data shape implementation

Any service can implement a data shape implementation. The service must declare the name of the data shape it implements and be able to support data retrieval. The data retrieval methods are up to the implementation specification; at a minimum, the following methods must be supported:

- `get (unique identifier)` Retrieve the data shape by unique identifier
- `list` List all data shapes

For example, Service C in our first example - planet.seas - could be implemented as:

```
Service C implements "planet.seas"
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

#### Composition vs extension

The same data shape can be generated by either extension or composition. For example, the above end result could also be achieved as follows:

```
 Service A defines "planet"
      identifier: planet ID
      fields:
          name

  Service B defines "planet.continents"
      extends: "planet"
      fields:
          continents

  Service C defines "planet.geography"
      extends: "planet.continents"
      fields:
          seas

In this way, a hierarchy is established:

  planet
  └── planet.continents
      └── planet.seas
          └── planet.geography
```

Whether multi-level extensions are supported is up to the implementation. In general, composition is the simpler and more flexible approach.

## Specification Implementation

A system specification implementation should define the above concepts and principles in greater detail, especially:

### Meta contract specification

The concrete definition of the above specification. For example, by what means will unique data records be identified?, how will data shape definitions be described?, and so on.

### Semantic contract definitions

Thhis document describes the various business objects (data shapes) and their fields that will be shared across the system.

### Technical contract implementation specification

A techical implementation specification would be a separate document, and would generally be specific to a data service. It would describe the mechanisms used to fulfill the above meta specification and demantic definitions. This could include database information, middle tier technology, authorization and authentication and so on.
