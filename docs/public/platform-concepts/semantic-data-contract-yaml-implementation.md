# YAML Semantic Data Contract Implementation

This specifies a YAML representation of the [Master Semantic Data Contract](semantic-data-contract-master.md). YAML describes definitions and registrations; a runtime performs retrieval, validation and composition.

## Definitions

Each service publishes a manifest. Contract names are semantic identifiers, independent of the service defining or implementing them.

`dataDefinition` and `inputDataDefinition` use the schema vocabulary shown below: `type`, `properties`, `required`, `items` and `additionalProperties`. Object fields listed in `required` are mandatory; `additionalProperties: false` rejects undeclared fields. Validation must not coerce values.

### Service A — planet

```yaml
service: serviceA
contracts:
  semanticDataDefinition:
    defines:
      planet:
        identifier: PlanetId
        identifierDataDefinition:
          type: string
        dataDefinition:
          type: object
          properties:
            name:
              type: string
          required: [name]
          additionalProperties: false
```

Only the root declares the identifier name and definition. Returned records contain the identifier alongside their defined fields; the runtime validates these separately so the identifier is not treated as an extra data field.

### Service B — mountains

```yaml
service: serviceB
contracts:
  semanticDataDefinition:
    defines:
      planet.mountains:
        extends: planet
        dataDefinition:
          type: object
          properties:
            mountains:
              type: array
              items:
                type: string
          required: [mountains]
          additionalProperties: false
        queries:
          getHighMountains:
            inputDataDefinition:
              type: object
              properties:
                minimumHeightMeters:
                  type: number
              required: [minimumHeightMeters]
              additionalProperties: false
```

`extends` associates the contribution with the root and inherits its identifier, not its returned fields. A mountains record contains `PlanetId` and `mountains`, not the planet's name. Query output is implicit: an array of full identified mountains records, with no extra fields.

### Service C — atmosphere

```yaml
service: serviceC
contracts:
  semanticDataDefinition:
    defines:
      planet.atmosphere:
        extends: planet
        dataDefinition:
          type: object
          properties:
            atmosphere:
              type: array
              items:
                type: string
          required: [atmosphere]
          additionalProperties: false
```

### Service D — geography

```yaml
service: serviceD
contracts:
  semanticDataDefinition:
    defines:
      planet.geography:
        extends: planet
        extensions:
          - planet.mountains
          - planet.atmosphere
```

Composition combines the root and named contributions without copying their definitions. This initial implementation supports direct extensions of one root, not nested extension chains. Every contract must define data, compose extensions, or both.

## Provider registration

An implementor registers `get` and every query declared by its contract. Handler names identify local asynchronous functions resolved by the host; they are not executable YAML or imports of another service's code.

### Service E — implements mountains

```yaml
service: serviceE
contracts:
  semanticDataDefinition:
    implements:
      planet.mountains:
        get:
          handler: mountains.get
        queries:
          getHighMountains:
            handler: mountains.getHighMountains
```

The get handler receives an identifier. Query handlers receive their declared input object. Example calls and results, shown as YAML rather than a prescribed transport protocol:

```yaml
get:
  input: Sol III
  output:
    PlanetId: Sol III
    mountains: [Mount Everest]

getHighMountains:
  input:
    minimumHeightMeters: 8000
  output:
    - PlanetId: Sol III
      mountains: [Mount Everest]
    - PlanetId: Sol IV
      mountains: [Olympus Mons]
```

The query selects planets using private height data measured above each planet's reference surface. It returns their full mountains records, not filtered mountain lists or private heights. Data here is representative only. No general `list` operation is required.

Services A and C register their own get handlers in the same way.

### Service F — implements geography

```yaml
service: serviceF
contracts:
  semanticDataDefinition:
    implements:
      planet.geography:
        get:
          compose: true
```

`compose: true` selects the runtime's composition handler instead of a local function. It resolves `planet`, `planet.mountains` and `planet.atmosphere` through the registry using the same identifier; it must not invoke its own geography handler recursively.

## Retrieval

The runtime exposes get and query operations. Their logical requests and responses can be represented as follows:

```yaml
request:
  operation: get
  contract: planet.geography
  identifier: Sol III
response:
  PlanetId: Sol III
  name: Earth
  mountains: [Mount Everest]
  atmosphere: [Nitrogen, Oxygen]
```

```yaml
request:
  operation: query
  contract: planet.mountains
  query: getHighMountains
  input:
    minimumHeightMeters: 8000
response:
  - PlanetId: Sol III
    mountains: [Mount Everest]
  - PlanetId: Sol IV
    mountains: [Olympus Mons]
```

`includeContractNames` defaults to `false`. When true, the runtime wraps each contribution, retaining its identifier:

```yaml
request:
  operation: get
  contract: planet.geography
  identifier: Sol III
  includeContractNames: true
response:
  planet:
    PlanetId: Sol III
    name: Earth
  planet.mountains:
    PlanetId: Sol III
    mountains: [Mount Everest]
  planet.atmosphere:
    PlanetId: Sol III
    atmosphere: [Nitrogen, Oxygen]
```

For a single contribution, the wrapper uses that contract's name. For queries, wrapping applies to each result record. Providers always return unwrapped data.

## Discovery and validation

At registration, the host builds a catalogue from configured manifests, keeping definitions and implementors separate:

```yaml
catalogue:
  planet:
    definedBy: serviceA
    implementedBy: serviceA
  planet.mountains:
    definedBy: serviceB
    implementedBy: serviceE
  planet.atmosphere:
    definedBy: serviceC
    implementedBy: serviceC
  planet.geography:
    definedBy: serviceD
    implementedBy: serviceF
```

The host rejects duplicate definitions or implementors, unknown references, invalid schemas, missing declared handlers, cycles and unsupported nesting. Composition contributors must share a root. Their data fields must not collide with each other or the identifier; the shared identifier is merged once.

On each call, the runtime validates identifiers, query inputs and complete outputs before returning data. A get result must match the requested identifier. Composition validates every contribution and rejects mismatched identifiers. Query methods are not inherited automatically by composed contracts.

Unknown record identifiers return `null`; queries with no matches return `[]`. A missing definition, implementor or query is an error, not an empty result. If any required composition contribution returns `null`, the composed get returns `null`; provider failures remain errors, with no partial result.

Authentication, authorization and transport are host responsibilities. Composition must preserve the caller's access context; this specification does not imply a transactionally consistent snapshot across services.
