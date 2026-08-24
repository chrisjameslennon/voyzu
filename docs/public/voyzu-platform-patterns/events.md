# Event patterns

Voyzu events are integration contracts designed for consumption by other
packages. Within a package, functions should call the owning module's service
methods directly. Do not use events as an internal substitute for ordinary
function calls.

## Match events to operations

Each state-changing method exposed by `operations.ts` should have a
corresponding completed-action event in `events.ts`:

| Operation | Event |
|---|---|
| `createOrganization` | `organizationCreated` |
| `updateOrganization` or `patchOrganization` | `organizationUpdated` |
| `deleteOrganization` | `organizationDeleted` |
| `activateOrganization` | `organizationActivated` |

Use the successful operation response DTO as the event payload. This keeps the
operation result and integration contract aligned.

```ts
// organizations/events.ts
export const events = {
  organizationCreated: {
    description: "An organization was created.",
    payload: OrganizationResponseDto,
  },
} as const;
```

The module includes `events` alongside its routes and operations so Voyzu can
register the event under its global name, for example
`@voyzu/erp-core.organizations.organizationCreated`.

## Raise an event

Raise the event from the service after producing the response DTO. When the
service is transactional, pass its transaction to the dispatcher:

```ts
const organization = await enrichRow(created);

await platformEvents.dispatch(
  events.organizationCreated,
  organization,
  { transaction: db },
);

return organization;
```

## Listen from another package

Cross-package listeners live in the consuming package's root `listeners.ts`.
They use the globally stable event name and do not import the publishing
package:

```ts
export const listeners = [{
  event: "@voyzu/erp-core.organizations.organizationCreated",
  handler: async (organization, context) => {
    await createFinanceOrganization(
      organization.id,
      context.transaction,
    );
  },
}] as const;
```

The listener receives the transaction that raised the event through
`context.transaction`. It can use that transaction so its work commits with
the originating operation. If the listener throws, it can cause that
transaction to roll back.

Declare the listeners on the consuming package manifest and export
`./listeners` from its `package.json`. Voyzu composition registers declared
events and listeners automatically.
