# Financial Document Defaults

Financial Document Defaults shows the standard accounts or targets used when an organization document does not provide a more specific choice.

## Concepts

* [Financial Document Processing](../../voyzu-core-concepts/financial-document-processing.md) explains document posting and defaults.
* [Organizations and Companies](../../voyzu-core-concepts/organizations-and-companies.md) explains how defaults flow to companies.
* [Control Accounts](../../voyzu-core-concepts/control-accounts.md) explains ledger-backed targets.

## Viewing defaults

The list shows document, default code and name, target type, account, status, and whether postings exist. Search by visible values and filter by document, target, or status. Click a row to inspect its full mapping. Refresh reloads data; Export supports the selection, current view, or full dataset.

## In use

A default is in use when a document or posting depends on it. Existing postings retain the values applied when they were created. Changing a default affects later processing only.

## Make changes

Open a default to review the document and target it controls. Update only the selectable target allowed by the screen, then save. Confirm that the replacement account has the correct account type and business meaning.

These mappings are seeded as part of the financial model rather than created or deleted from this screen.

## Change status

Where status controls are available, deactivate a default only when no active processing depends on it. Preserve historical mappings for audit and explanation.

## See also

* [Financial Document Types](financial-document-types.md)
* [General Ledger Accounts](general-ledger-accounts.md)
* [Company Financial Document Defaults](../company-ledger/financial-document-defaults.md)
