# Bank / Cash Accounts

Bank / Cash Accounts manages the organization's standard bank and cash accounts and the general ledger accounts behind them.

## Concepts

* [Control Accounts](../../voyzu-core-concepts/control-accounts.md) explains ledger-backed accounts.
* [Organizations and Companies](../../voyzu-core-concepts/organizations-and-companies.md) explains how organization standards flow to companies.
* [What Is a Financial Ledger?](../../voyzu-core-concepts/what-is-a-financial-ledger.md) explains the relationship between supporting ledgers and the general ledger.

## Viewing accounts

The list shows code, name, account type, linked general ledger account, status, and whether postings exist. Search by code or name, and filter by type or status. Select a row for bulk status or delete actions; click the row to open its detail. Refresh reloads the data and Export can export the selection, current view, or full dataset.

## In use

An account is in use when another record refers to it or postings exist. In-use accounts cannot be deleted or deactivated because doing so would break an active or historical financial relationship.

## Create a new account

Select **Add Bank / Cash Account** and provide the stable code, name, type, linked general ledger account, and the bank or cash details required by the form. New accounts are active unless the form states otherwise.

## Make changes

Open the account from the list. Update descriptive and banking details, then save. Treat the code, type, and linked general ledger account as structural settings: changing their meaning after use makes historical reporting difficult to explain.

## Change status

Select an unused account and choose **Activate** or **Deactivate**. Deactivation prevents new use but preserves the record for history.

## Delete

Delete only an account that has no postings and is not referenced. Deletion is permanent.

## See also

* [General Ledger Accounts](general-ledger-accounts.md)
* [Company Bank / Cash Accounts](../company-ledger/bank-cash-accounts.md)
* [Bank / Cash Movement](../company-ledger/company-reports/bank-cash-movement.md)
