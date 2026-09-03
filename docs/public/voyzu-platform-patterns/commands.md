# Command patterns

Voyzu commands are request-response integration contracts designed for direct
calls from tests and other packages. Within the owning package, functions and
HTTP handlers should call the module's service methods directly.

Cross-package callers use the global command name and do not import the
providing package. This keeps the packages decoupled.

## Define a command

Define the parameter tuple and result with TypeBox, then give
`command.defineLazy` a direct, typed loader for the service method:

```ts
// organizations/commands.ts
import { command } from "@voyzu/capability/commands";
import Type from "typebox";

export const patchOrganization = command.defineLazy(
  {
    parameters: Type.Tuple([
      Type.String(),
      OrganizationPatchRequestDto,
    ]),
    result: OrganizationResponseDto,
  },
  () => import("./server/lib/organization.service")
    .then((module) => module.patchOrganization),
);

export const commands = { patchOrganization } as const;
```

Include `commands` in the complete module definition, and expose the manifest
directly as `./<module>/commands`. Composition discovers the dedicated export,
not the module definition, and registers the command under its global name,
in this example
`@voyzu/erp-core.patchOrganization`. Command names must be unique within the
package.

The commands manifest imports schemas but not the service module. The wrapper
loads and caches the service method on its first call, validates arguments
before calling it, and validates its result before returning it. Business
validation remains in the service layer. `command.define` remains available
when a handler is already lightweight and does not introduce an eager service
dependency.

Voyzu commands are request-response contracts: callers always await completion and
receive either the result or the error. They are asynchronous JavaScript
functions because service loading and persistence are asynchronous; they are
not fire-and-forget messages.

A database executor is not injected automatically. Add an explicit final
`DbExecutor` parameter only when a caller must pass a shared transaction across
package boundaries. The caller owns that transaction and every participating
service uses the supplied executor rather than opening a nested transaction.

## Call a command

Use `call` when the providing command is required:

```ts
import { command } from "@voyzu/capability/commands";

const organization = await command.call(
  "@voyzu/erp-core.patchOrganization",
  code,
  { name: "New name" },
);
```

`call` throws if the command is not registered. Arguments and results are
also subject to the providing command's TypeBox contract.

The caller deliberately does not import the provider's DTO types. The result is
therefore `unknown`; narrow it locally when the caller needs to inspect it.

## Optional commands

Use `callOptional` when the providing package or command is an optional
extension:

```ts
const result = await command.callOptional(
  "@voyzu/erp-core.patchOrganization",
  code,
  changes,
);

if (result === undefined) {
  // The command is not installed.
}
```

When the command is not registered, `callOptional` returns `undefined`
without making a call. It does not suppress argument-validation errors,
result-validation errors, or errors thrown by a registered service.

Use `has` when availability changes behavior before a call:

```ts
if (command.has("@voyzu/erp-core.patchOrganization")) {
  // Show or enable the optional integration behavior.
}
```

In most cases, prefer calling `callOptional` and checking its result rather
than checking with `has` first. Use `has` when no call is needed yet, or when a
registered command can itself return `undefined`.

## Composition

Command registration is generated when Voyzu composes the installed
packages. Composition runs explicitly through `npm run voyzu:compose` and as
part of package installation, linking, and platform update workflows.

For each included package, the composer inspects the package's `exports` for
entries shaped like `./<module>/commands`. For example:

```jsonc
{
  "exports": {
    "./organizations/commands": "./modules/organizations/commands.ts"
  }
}
```

The composer generates an installed-package registry:

```text
apps/web/.generated/commands/installed.ts
```

That file imports each module's exported `commands` object and registers it
with the package name and module name:

```ts
import { commands } from "@voyzu/erp-core/organizations/commands";

command.registerModule(
  "@voyzu/erp-core",
  "organizations",
  commands,
);
```

Pre-installed platform commands use the matching generated registry:

```text
apps/web/.generated/commands/pre-installed.ts
```

`pre-installed.ts` and `installed.ts` have the same imports, validation rules,
registration calls, and registry shape. The split only allows `npm run dev` to
regenerate the pre-installed registry without disturbing installed-package
composition. Only functions created with `command.define`
or `command.defineLazy` are added to the callable registry. Voyzu derives
each global name from the package name and exported command key, such as
`@voyzu/erp-core.patchOrganization`. Command keys must therefore be unique
across all modules in the same package.

At Node.js application startup, Next.js instrumentation imports both generated
registration files. Their registration calls populate the platform's in-memory
command registry before application code handles requests. Importing these
files loads only command schemas and lazy loaders; service modules remain
outside the startup dependency graph until their command is called.

There is no fallback through `voyzu.package.ts`, `module.ts`, or a package
barrel. If the `./<module>/commands` export is absent, those commands are
not composed.

Recompose after changing installed packages or adding a commands-module
export, and restart the application so the new registry is loaded. Generated
files are transient: package code must not import them or register commands
manually.
