# Accounts Payable Control Accounts

AP control accounts show the general ledger accounts that back the organization's accounts payable ledger.

## Concepts

* [Control Accounts](../../voyzu-core-concepts/control-accounts.md) explains why a ledger-backed account points to a general ledger account.
* [What Is a Financial Ledger?](../../voyzu-core-concepts/what-is-a-financial-ledger.md) explains subledgers and immutable financial records.
* [Financial Document Processing](../../voyzu-core-concepts/financial-document-processing.md) explains how supplier documents create postings.

## Viewing AP control accounts

The list groups the standard accounts payable purposes used for supplier bills, payments, credits, write-offs, and related activity. Open a row to see its code, name, supporting ledger, linked general ledger account, posting state, and audit history.

## How the mapping is used

AP documents create detailed supplier entries in the accounts payable subledger. Their general ledger side is posted to the account identified by the relevant AP control account. The control account is a pointer to that GL account, not another account balance.

**Has postings** identifies a mapping already used by financial activity. The detail screen may also identify companies whose records depend on it.

## Making changes

These screens are read-only. Organization control-account mappings form part of the installed financial model. Review them before companies begin posting, and use the supported configuration or deployment process if the model must change. Never edit or delete another ledger's historical records to force a different result.

## See also

* [General Ledger Accounts](general-ledger-accounts.md)
* [Company AP Control Accounts](../company-ledger/ap-control-accounts.md)
* [AP Ledger Entries](../company-ledger/ap-ledger-entries.md)
* [AP Bills](../company-ledger/ap-bills.md)
