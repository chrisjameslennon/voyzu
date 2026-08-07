# Company Ledger

Company Ledger contains the financial settings, immutable records, enquiries, and reports for the company selected in the company switcher.

## Concepts

* [What Is a Financial Ledger?](../../voyzu-core-concepts/what-is-a-financial-ledger.md) explains the general ledger, subledgers, immutability, and reversals.
* [Organizations and Companies](../../voyzu-core-concepts/organizations-and-companies.md) explains why each company has separate financial records.
* [Financial Document Processing](../../voyzu-core-concepts/financial-document-processing.md) explains how API or client documents become ledger entries.
* [Control Accounts](../../voyzu-core-concepts/control-accounts.md), [Inventory](../../voyzu-core-concepts/inventory.md), and [Tax](../../voyzu-core-concepts/tax.md) cover specialist posting areas.

## Select the company

The company switcher sets the scope for every Company Ledger screen. Its name, code, currency, and access are shown in the selector. Change company before opening or interpreting a screen when you need a different ledger.

## Setup

General ledger accounts, reporting categories, control accounts, bank/cash accounts, dimensions, document settings, inventory records, and financial periods define how later documents post. Some settings are tethered to organization standards; others are owned by the company.

## Recorded activity

Journals and AP, AR, inventory, and tax ledger pages are read-only financial history. Source documents normally arrive through an API client or integration. Correct an error with a supported correcting document or reversal, never by deleting a posted record.

## Reports and review

Reports summarize the selected company's posted data for a date, range, period, or filing scope. Ledger enquiries explain individual records; reconciliation and integrity reports compare related ledgers. Refresh after posting and retain the report scope with exported evidence.

## See also

* [Company Reports](company-reports/)
* [Financial Periods](financial-periods.md)
* [Journals](journal-entries.md)
* [Financial Integrity](company-reports/financial-integrity.md)
* [Company Audit Log](audit-log.md)
