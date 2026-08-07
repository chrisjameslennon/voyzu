# Tax Control Accounts

Tax control accounts show the general ledger accounts that back the organization's tax ledger.

## Concepts

* [Control Accounts](../../voyzu-core-concepts/control-accounts.md) explains ledger-backed accounts and why they point to general ledger accounts.
* [Tax](../../voyzu-core-concepts/tax.md) explains authorities, rules, components, filing profiles, and tax posting.
* [Financial Document Processing](../../voyzu-core-concepts/financial-document-processing.md) explains how posted documents create ledger entries.

## Viewing tax control accounts

The screen lists each tax purpose with its code, ledger, linked general ledger account, required account type, and whether postings exist. These mappings are organization standards used when company financial settings are tethered.

Open the screen to confirm that every required tax purpose points to the intended general ledger account. **Has postings** means the mapping has already participated in recorded financial activity and should be treated as historical financial configuration.

## How the mapping is used

When a financial document produces tax, Voyzu records the tax detail in the tax ledger and posts the corresponding amount to the mapped general ledger account. The control account is therefore a pointer, not a second general ledger account.

Tax rules are managed from the relevant [Country](countries.md). This screen answers where tax is posted; the country setup answers how tax is calculated and reported.

## Making changes

Open a control account and select an active GL account of the displayed type. **Tax on Sales** requires a Liability account; **Tax on Purchases** requires an Asset account. A mapping cannot be changed after it has postings.

## See also

* [Countries](countries.md)
* [General Ledger Accounts](general-ledger-accounts.md)
* [Company Tax Accounts](../company-ledger/tax-control-accounts.md)
* [Tax Ledger Entries](../company-ledger/tax-ledger-entries.md)
