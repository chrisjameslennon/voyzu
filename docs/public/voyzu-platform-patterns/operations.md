# Operation patterns

Voyzu operations are request-response integration contracts designed for direct
calls from tests and other packages. Within the owning package, functions and
HTTP handlers should call the module's service methods directly.

Cross-package callers use the global operation name and do not import the
providing package. This keeps the packages decoupled.

## Define an operation

Define the parameter tuple and result with TypeBox, then wrap the service
method with `operation.define`:

```ts
// organizations/operations.ts
import { operation } from "@voyzu/capability/operations";
import Type from "typebox";

export const patchOrganization = operation.define(
  {
    parameters: Type.Tuple([
      Type.String(),
      OrganizationPatchRequestDto,
    ]),
    result: OrganizationResponseDto,
  },
  service.patchOrganization,
);

export const operations = { patchOrganization } as const;
```

Include `operations` in the module definition. Voyzu composition registers the
operation under its global name, in this example
`@voyzu/erp-core.patchOrganization`. Operation names must be unique within the
package.

The wrapper validates arguments before calling the service and validates its
result before returning it. Business validation remains in the service layer.

## Call an operation

Use `call` when the providing operation is required:

```ts
import { operation } from "@voyzu/capability/operations";

const organization = await operation.call(
  "@voyzu/erp-core.patchOrganization",
  code,
  { name: "New name" },
);
```

`call` throws if the operation is not registered. Arguments and results are
also subject to the providing operation's TypeBox contract.

The caller deliberately does not import the provider's DTO types. The result is
therefore `unknown`; narrow it locally when the caller needs to inspect it.

## Optional operations

Use `callOptional` when the providing package or operation is an optional
extension:

```ts
const result = await operation.callOptional(
  "@voyzu/erp-core.patchOrganization",
  code,
  changes,
);

if (result === undefined) {
  // The operation is not installed.
}
```

When the operation is not registered, `callOptional` returns `undefined`
without making a call. It does not suppress argument-validation errors,
result-validation errors, or errors thrown by a registered service.

Use `has` when availability changes behavior before a call:

```ts
if (operation.has("@voyzu/erp-core.patchOrganization")) {
  // Show or enable the optional integration behavior.
}
```

In most cases, prefer calling `callOptional` and checking its result rather
than checking with `has` first. Use `has` when no call is needed yet, or when a
registered operation can itself return `undefined`.

## Composition

Operation registration is generated when Voyzu composes the installed
packages. Composition runs explicitly through `npm run voyzu:compose` and as
part of package installation, linking, and platform update workflows.

For each included package, the composer inspects the package's `exports` for
entries shaped like `./<module>/operations`. For example:

```jsonc
{
  "exports": {
    "./organizations/operations": "./modules/organizations/operations.ts"
  }
}
```

The composer generates:

```text
apps/web/.generated/operations/register.ts
```

That file imports each module's exported `operations` object and registers it
with the package name and module name:

```ts
import { operations } from "@voyzu/erp-core/organizations/operations";

operation.registerModule(
  "@voyzu/erp-core",
  "organizations",
  operations,
);
```

Only functions created with `operation.define` are added to the callable
registry. Voyzu derives each global name from the package name and exported
operation key, such as `@voyzu/erp-core.patchOrganization`. Operation keys
must therefore be unique across all modules in the same package.

At Node.js application startup, Next.js instrumentation imports the generated
registration file. Its registration calls populate the platform's in-memory
operation registry before application code handles requests. The package
operations test runner loads the same generated registration file before
running tests.

Recompose after changing installed packages or adding an operations-module
export, and restart the application so the new registry is loaded. Generated
files are transient: package code must not import them or register operations
manually.
