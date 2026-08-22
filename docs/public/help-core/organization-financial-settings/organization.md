# Organization

The Organization screen maintains the identity of the Voyzu organization. A Voyzu installation has one organization and every company belongs to it.

## Concepts

* [Organizations and Companies](../../voyzu-core-concepts/organizations-and-companies.md) explains the organization boundary, companies, and shared standards.
* [Users and permissions](../../help-platform/settings/users.md) explains platform roles; company assignments are managed from **Organization > Company Access**.

## Viewing the organization

The screen shows the organization code, name, status, posting state, and audit information. The organization is created during setup; it cannot be added or deleted from this screen.

### In use

The **HAS POSTINGS** badge means at least one company has financial postings. Once this occurs, the organization code becomes read-only because it is a stable identifier behind existing records and integrations.

## Make changes

Before postings exist, the code can contain up to 40 capital letters, numbers, dashes, or underscores. The organization name can contain up to 50 characters.

After postings exist, only the organization name remains editable. Select **Save** to apply changes. Status is displayed for reference and is not changed on this screen.

The audit panel identifies when the organization was created and last changed, the actor, and the related mutation. Follow its audit link to inspect the event.

## See also

* [Companies](companies.md)
* [Organization Audit Log](audit-log.md)
* [Users](../../help-platform/settings/users.md)
