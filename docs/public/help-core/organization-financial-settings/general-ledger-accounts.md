# General Ledger Accounts

The General Ledger Accounts screens maintain the organization chart of accounts used as standard financial settings by tethered companies.

## Concepts

* [What is a Financial Ledger?](../../voyzu-core-concepts/what-is-a-financial-ledger.md) explains journals, balanced postings, and the Company Ledger.
* [Control Accounts](../../voyzu-core-concepts/control-accounts.md) explains how supporting ledgers point to General Ledger accounts.
* [Organizations and Companies](../../voyzu-core-concepts/organizations-and-companies.md) explains how organization financial settings flow to tethered companies.

## Viewing accounts

The list shows code, name, account type, reporting category, posting state, and status. Search matches the account details. Filter by account type or status, then click a row to open its detail screen.

Select accounts to activate, deactivate, or delete them when the action is permitted. **Refresh** reloads the list. Export supports selected rows, the current view, or the full dataset.

### In use

An account is in use when it has postings or is linked by another financial setting. The detail screen shows **HAS POSTINGS**, affected companies, and a **Linked By** section where applicable.

Accounts with postings cannot be deactivated or deleted. Linked accounts also cannot be removed while another setting depends on them.

## Create a new account

Select **Add Account** and provide a unique code, name, account type, and an active reporting category of the same account type. The account is created as **ACTIVE**.

Choose the account type carefully. It controls the account's accounting meaning and which reporting categories are available.

## Make changes

Open an account from the list to edit its code, name, account type, and reporting category. Select **Save** to apply changes. Once the account is in use, preserve its code and accounting classification so existing postings retain a stable meaning.

Status is changed with **Activate** and **Deactivate**, not through Save. The audit panel links to the account's organization audit events.

## Delete an account

Delete is permanent and is available only when the account has no postings and is not referenced by another setting. Deactivate an unused account when it should remain available for history but not for new configuration.

## See also

* [Reporting Categories](reporting-categories.md)
* [AP Control Accounts](ap-control-accounts.md)
* [AR Control Accounts](accounts-receivable-control-accounts.md)
* [Ledger Backed Account Codes Report](organization-reports/ledger-backed-account-codes.md)
