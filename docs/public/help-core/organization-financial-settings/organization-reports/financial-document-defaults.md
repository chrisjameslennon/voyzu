# Financial Document Defaults

The Financial Document Defaults report lists the fallback posting targets configured for organization document types.

## Concepts

* [Financial Document Processing](../../../voyzu-core-concepts/financial-document-processing.md) explains how defaults participate in posting.
* [Control Accounts](../../../voyzu-core-concepts/control-accounts.md) explains ledger-backed targets.

## Data shown

Each row shows:

* Document type
* Default code and name
* Target type
* General ledger code
* General ledger account name

Use the report to see which account or ledger-backed target will be used when a financial document does not supply a more specific value. Rows are ordered by document and default code.

## Using the report

Review the document, target, and GL account together. A valid code pointing at the wrong financial purpose can still produce misleading postings. Refresh after configuration changes. This report uses a landscape layout for the wider mapping data.

## See also

* [Financial Document Defaults](../financial-document-defaults.md)
* [Financial Document Types Report](financial-document-types.md)
* [Ledger Backed Account Codes Report](ledger-backed-account-codes.md)
