# Bank / Cash Accounts

Bank / Cash Accounts manages the selected company's financial bank and cash accounts and their GL mappings.

## Concepts

* [Control Accounts](../../voyzu-core-concepts/control-accounts.md) explains ledger-backed accounts.
* [What Is a Financial Ledger?](../../voyzu-core-concepts/what-is-a-financial-ledger.md) explains supporting ledgers and the GL.
* [Organizations and Companies](../../voyzu-core-concepts/organizations-and-companies.md) explains company settings.

## Viewing bank / cash accounts

The list shows code, name, type, GL account, status, and posting state. Search by code or name, filter by type or status, and open a row for detail. Refresh and export operate on the currently selected company.

## In use

An account is in use when postings exist or another setting refers to it. In-use accounts cannot be deleted or deactivated because their ledger relationship is part of company history.

## Create a new bank or cash account

Select **Add Bank / Cash Account**. Enter its code, name, type, linked GL account, and applicable bank details. Use a GL account whose type and purpose match the financial account.

## Make changes

Open the account to update permitted descriptive and banking details. Treat the code, type, and GL link as structural once postings exist.

## Change status

Activate an account for new use. Deactivate only an unused account; history remains visible.

## Delete

Delete only an account with no postings or references. Deletion is permanent.

## See also

* [Bank / Cash Movement](company-reports/bank-cash-movement.md)
* [General Ledger Accounts](general-ledger-accounts.md)
* [Journals](journal-entries.md)
