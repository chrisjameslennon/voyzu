# @voyzu/ugly-package

`@voyzu/ugly-package` demonstrates the boundaries of Voyzu package development. It is a valid Voyzu package, but its design and implementation choices are deliberately not best practice.

The package shows that a developer can:

* Own the visual design and use package-specific styling instead of Voyzu UI components.
* Register independent page routes and provide package-owned top navigation without a left navigation.
* Declare a package-specific npm dependency and publish package-owned static assets.
* Receive a Next.js request and return a response through a registered API route.
* Choose not to use database objects or auditing when the package does not need them.

Voyzu still controls the outer platform, authentication and route composition. The package must still satisfy the [package contract](../voyzu-platform-guide/package-contract.md), and each registered module must satisfy the [module contract](../voyzu-platform-guide/module-contract.md).

Use Ice Creams as the implementation reference; use Ugly Package to understand how much freedom remains inside those contracts.

## Install

```shell
npm run voyzu:install https://github.com/chrisjameslennon/voyzu-packages.git @voyzu/ugly-package
```

[View the source on GitHub](https://github.com/chrisjameslennon/voyzu-packages/tree/main/packages/%40voyzu/ugly-package).
