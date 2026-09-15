# Voyzu Package Contract

Voyzu user-facing functionality is delivered by way of packages:
- Some packages live inside of the voyzu platform ("voyzu"), these are known as pre-installed packages
- Voyzu publishes compatable packages in the ERP space, these live in "voyzu-packages"
- Any developer can publish their own package, the Voyzu platform will run it; the package must confirm to this contract

Voyzu itself offers package composition and support. It contains a number of libraries designed to be imported by external packages. Thus voyzu itself is not a package. However the various packages residing in voyzu/packages ("pre-installed packages") do come under the scope of this document

## Decoupled

Packages are fully de-coupled from each other, meaning:
- A package may not import from another package. Typescript imports from other packages are not allowed at all.
- A package owns the database tables it defines in its `install` folder. Direct access to another package's tables is restricted to the exceptions below; other interactions use the internal API.
- A package may read platform tables, meaning tables owned by pre-installed packages. This includes joins and transactional row locking. It does not permit ordinary writes to those tables or reads from a peer extension package's tables.
- A package-owned table may declare a foreign key to a platform table. The foreign key and its referential actions are allowed. Foreign keys to tables owned by other extension packages are not allowed.
- A package may attach the platform audit trigger to its own tables; that trigger may write to platform-owned Audit tables. This exception does not permit trigger-based access to a peer package's tables.
- Seeding may write to upstream platform tables. Reads during seeding are already covered by the platform-table read exception. The seed-write exception does not apply to ordinary runtime writes or cleanup deletions.

The four exceptions (platform-table reads, audit trigger, foreign keys, and seed writes) permit interaction with platform-owned tables only. They do not permit interaction with tables owned by a peer extension package. Other cross-package interactions must use the internal API.

So how then can packages interact to add value to the user? The Voyzu platform provides a managed way for packages to interact with both the platform, and each other. To take just one example, packages and define and consume Internal API contracts (todo link)

## Contracts

Package contracts define how packages interact with the Voyzu runtime platform, and with each other. A package must conform to these contracts to be a valid Voyzu package. The Voyzu compiler will reject any non-conforming packages.

A Voyzu package contains both a root level `package.json` file, defining a few top level package properties including the package name, and a root level `voyzu.package.ts` file defining its contracts.

Voyzu package contracts are described below:

### Internal API Contract

Read the Internal API contract [here](internal-api-contract.md).

### HTTP API Contract

Read the HTTP API contract [here](http-api-contract.md).

### Page routing contract

Read the Page routing contract [here](page-routing-contract.md).

### UI Surface Contract

Read the UI Surface contract [here](ui-surface-contract.md).

## Patterns

Voyzu packages follow a standard set of patterns, to promote system understandability, reliability and to promote Rapid Application Development. These patterns do not form part of the package contract. They do interact with the package contracts, in that they assume that contracts are in place and adhered to.

[Read more](../voyzu-platform-patterns/).


