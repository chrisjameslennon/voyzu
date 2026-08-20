---
description: Open. Modular. Business Application Platform
---

# Welcome

Voyzu is an Open Source and modular Platform on which business applications can be built.

The Voyzu platform provides capabilities for building high-quality packages, including:

* A [package contract](voyzu-platform-guide/package-contract.md) that gives every package a standard composition and installation interface.
* A [module contract](voyzu-platform-guide/module-contract.md) for the modules within a package.
* Users and authentication.
* Auditing database tables and APIs.
* Web page rendering and routing.
* REST API development and documentation
* Database access, including transaction support.
* Generic React components that support a consistent user experience.
* Consistent layout, styling, and public CSS variables.

To install Voyzu see [installation-and-setup.md](installation-and-operation/installation-and-setup.md "mention")

{% embed url="https://youtu.be/OqacqjuGXxg?si=3zH9H4OSuCgSRFJI" %}

{% hint style="info" %}
[Star us on github](https://github.com/chrisjameslennon/voyzu)
{% endhint %}

## Packages

### Voyzu Core `@voyzu/core`

```shell
npm run voyzu:install https://github.com/chrisjameslennon/voyzu-packages.git @voyzu/core
```

The Voyzu Core package provides Core and Financial Ledger Capability including:

* Organization management
* Company Management
* Country and Tax Settings management
* Financial Ledger capabilities, including:
  * General Ledger
  * Account Receivable Subledger
  * Accounts Payable Subledger
  * Taxation
  * Inventory Ledger

Start exploring the documentation at [introduction.md](voyzu-core-concepts/introduction.md "mention")

### Voyzu Ice-creams `(@voyzu/ice-creams)`

```shell
npm run voyzu:install https://github.com/chrisjameslennon/voyzu-packages.git @voyzu/ice-creams
```

The Voyzu Ice-creams package is a best practice package that illustrates many of the Voyzu Platform patterns in use. If you are intending to develop a Voyzu package you can install this package and then use its source code as a best practice example for you or you AI agent to follow.

It is not intended to be an actual ice-creams management module :-)

Read more at [voyzu-ice-creams.md](other-voyzu-packages/voyzu-ice-creams.md "mention")

### Voyzu Ugly Package `(@voyzu/ugly-package)`

```shell
npm run voyzu:install https://github.com/chrisjameslennon/voyzu-packages.git @voyzu/ugly-package
```

The Voyzu Ugly package is designed to illustrate the freedom you have as a Voyzu package developer. It deliberately doesn't use Voyzu components or follow Voyzu patterns.

If you are independently minded and are wondering just how far you can push the system and still remain compliant, this is the package for you!

Read more at [voyzu-ugly-package.md](other-voyzu-packages/voyzu-ugly-package.md "mention")
