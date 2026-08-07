# Reporting Categories

Reporting Categories controls how the selected company's general ledger accounts are grouped and ordered in financial reports.

## Concepts

* [What Is a Financial Ledger?](../../voyzu-core-concepts/what-is-a-financial-ledger.md) explains the ledger behind reporting.
* [Organizations and Companies](../../voyzu-core-concepts/organizations-and-companies.md) explains shared and company-owned settings.
* [Financial Document Processing](../../voyzu-core-concepts/financial-document-processing.md) explains the records reports summarize.

## Viewing reporting categories

The list shows code, name, account type, sequence, status, and usage state. Search and account-type or status filters narrow the list. Open a row for detail; select rows for status, deletion, or export.

## In use

A category is in use when a GL account refers to it. It must remain compatible with those accounts and cannot be removed while references exist.

## Create a new reporting category

Select **Add Reporting Category**. Enter a stable code and name, choose the account type, and set the sequence used to order the category in reports.

## Make changes

Open the category to update its name or sequence. Keep its code and account type stable after accounts use it.

## Change status

Deactivate only a category that is not required by active accounts. Reactivation makes it available again.

## Delete

Delete only an unused category. Prefer deactivation when the category has historical meaning.

## See also

* [General Ledger Accounts](general-ledger-accounts.md)
* [Balance Sheet](company-reports/balance-sheet.md)
* [Profit & Loss](company-reports/profit-and-loss.md)
