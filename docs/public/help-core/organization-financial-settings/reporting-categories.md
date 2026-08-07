# Reporting Categories

Reporting Categories group General Ledger accounts into ordered financial statement sections within the organization standard settings.

## Concepts

* [What is a Financial Ledger?](../../voyzu-core-concepts/what-is-a-financial-ledger.md) explains the General Ledger that reporting categories organize.
* [Organizations and Companies](../../voyzu-core-concepts/organizations-and-companies.md) explains how standard settings flow to tethered companies.

## Viewing categories

The list shows code, name, account type, display sequence, posting state, and status. Search matches these values. Filter by account type or status and click a row to open its details.

Select rows to activate, deactivate, or delete them where permitted. Refresh reloads the list, and export supports selected rows, the current view, or the full dataset.

### In use

A category is in use when General Ledger accounts or company postings depend on it. The detail screen shows **HAS POSTINGS** and the companies with postings.

An in-use category cannot be deleted, and changes to its account type or code can change the meaning of accounts already grouped beneath it.

## Create a new category

Select **Add Category** and provide a unique code, name, account type, and sequence. New categories are **ACTIVE**.

The account type determines which General Ledger accounts can use the category. Sequence controls where the category appears relative to other categories in reports of the same type.

## Make changes

Open a row to change the category name and supported editable details, then select **Save**. Treat code and account type as stable once the category is in use. Status is changed through Activate and Deactivate actions.

The audit panel links to the category's organization audit events.

## Delete a category

Delete is permanent and is available only when the category is not used by accounts or postings. Move or remove dependent accounts before deleting a category. Use deactivation when the category should remain in history but not be available for new accounts.

## See also

* [General Ledger Accounts](general-ledger-accounts.md)
* [Balance Sheet](../company-ledger/company-reports/balance-sheet.md)
* [Profit and Loss](../company-ledger/company-reports/profit-and-loss.md)
