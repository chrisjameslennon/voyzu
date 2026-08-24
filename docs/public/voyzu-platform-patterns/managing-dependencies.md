# Managing dependencies

Voyzu supplies the shared application runtime at the versions declared by the
[Voyzu root package.json](https://github.com/chrisjameslennon/voyzu/blob/main/package.json).
Installable packages consume those host-provided libraries through
`peerDependencies`; they must not install competing copies.

Host-provided dependencies include React, Next.js, TypeBox, and Voyzu packages
such as `@voyzu/types`, `@voyzu/audit`, and `@voyzu/ui-components`.

```jsonc
{
  "peerDependencies": {
    "@voyzu/types": "^0.1.0",
    "@voyzu/ui-components": "^0.1.0",
    "next": "^16",
    "react": "^19",
    "server-only": "^0.0.1",
    "typebox": "^1.3.0"
  }
}
```

A third-party runtime library used only by one package belongs in that
package's ordinary `dependencies`:

```jsonc
{
  "dependencies": {
    "cat-names": "^4.0.0"
  }
}
```

Development-only tooling belongs in `devDependencies`. Do not publish local
`file:` dependencies or import another package through its source directory.
Use the other package's explicit `package.json` exports.

Voyzu package ordering is declared separately in `voyzu.dependencies`. Do not
duplicate the implicit Voyzu platform dependency there.
