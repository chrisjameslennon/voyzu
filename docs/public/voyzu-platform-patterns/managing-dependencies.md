# Managing dependencies

Voyzu provides a fixed set of runtime dependencies at versions defined in the [Voyzu root package.json](https://github.com/chrisjameslennon/voyzu/blob/main/package.json). A package declares the platform dependencies it consumes as `peerDependencies`; it must not install its own versions of them.

This applies both to general dependencies such as React and Next.js and to Voyzu libraries such as `@voyzu/audit` and `@voyzu/ui-components`.

Dependencies that are not supplied by Voyzu and are specific to the package belong in that package's ordinary `dependencies` section.

For example, the dependencies section of the [Ugly Package ](../other-voyzu-packages/voyzu-ugly-package.md)below. NPM packages that are provided by the Voyzu platform such as @voyzu/types and next are listed as peer dependencies. `cat-names` is not a standard Voyzu dependency (as you would expect!) so the package declares is as a standard dependency.

```json
  "dependencies": {
    "cat-names": "^4.0.0"
  },
  "peerDependencies": {
    "@voyzu/types": "^0.1.0",
    "next": "^16",
    "react": "^19",
    "server-only": "^0.0.1",
    "shiki": "^4.4.1"
  }
```

