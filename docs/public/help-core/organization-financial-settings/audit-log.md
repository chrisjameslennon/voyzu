# Audit Log

The Organization Audit Log is the read-only history of changes made in organization scope.

## Concepts

* [Organizations and Companies](../../voyzu-core-concepts/organizations-and-companies.md) explains organization and company scope.
* [Users and permissions](../../help-platform/settings/users.md) explains users, roles, and access.
* [What Is a Financial Ledger?](../../voyzu-core-concepts/what-is-a-financial-ledger.md) explains immutability of financial records.

## Finding an event

The list identifies each event by event code, company where applicable, timestamp, entity type, entity code or ID, action, and user. Search and filters can narrow by company, date range, entity type, entity identity, mutation, or user.

Click an event to open its detail. Export the current result when evidence is needed outside Voyzu.

## Reading event detail

Use the event code and timestamp to identify the change, the user to identify who performed it, and the entity fields to identify what changed. Where before-and-after values or a change set are shown, read them together: an individual field without its record context can be misleading.

Audit events are evidence, not editable business records. The log records application mutations; it does not replace ledger enquiry or a financial report.

## Corrections

Audit events cannot be edited or deleted from this screen. Correct the underlying setup through its own screen. Correct posted financial activity with the supported reversal or correcting document so both the financial and audit histories remain intact.

## See also

* [Company Audit Log](../company-ledger/audit-log.md)
* [Organization](organization.md)
* [Companies](companies.md)
