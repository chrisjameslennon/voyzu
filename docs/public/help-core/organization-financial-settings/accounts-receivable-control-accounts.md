# Accounts Receivable Control Accounts

AR control accounts show the general ledger accounts that back the organization's accounts receivable ledger.

## Concepts

* [Control Accounts](../../voyzu-core-concepts/control-accounts.md) explains ledger-backed accounts.
* [What Is a Financial Ledger?](../../voyzu-core-concepts/what-is-a-financial-ledger.md) explains subledgers and immutable records.
* [Financial Document Processing](../../voyzu-core-concepts/financial-document-processing.md) explains how customer documents create postings.

## Viewing AR control accounts

The list groups the standard receivables purposes used for invoices, receipts, credits, write-offs, and related activity. Open a row to inspect its code, name, supporting ledger, linked general ledger account, posting state, and audit history.

## How the mapping is used

AR documents create detailed customer entries in the accounts receivable subledger. Voyzu posts their general ledger side to the account identified by the relevant AR control account. The control account is a pointer to that account, not a separate balance.

**Has postings** means the mapping has already been used. The detail may also show companies whose records depend on it.

## Making changes

Open a control account and select an active **Asset** GL account. Save remains on the detail page. Once the mapping has postings, it becomes read-only; existing financial records are never rewritten to accommodate a new mapping.

## See also

* [General Ledger Accounts](general-ledger-accounts.md)
* [Company AR Control Accounts](../company-ledger/accounts-receivable-control-accounts.md)
* [AR Ledger Entries](../company-ledger/ar-ledger-entries.md)
* [AR Invoices](../company-ledger/ar-invoices.md)
