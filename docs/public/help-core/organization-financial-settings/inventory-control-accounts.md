# Inventory Control Accounts

Inventory control accounts show which general ledger accounts back the organization's inventory ledger.

## Concepts

* [Inventory](../../voyzu-core-concepts/inventory.md) explains financial items, categories, posting profiles, and weighted-average valuation.
* [Control Accounts](../../voyzu-core-concepts/control-accounts.md) explains ledger-backed accounts.
* [Financial Document Processing](../../voyzu-core-concepts/financial-document-processing.md) explains how documents create ledger entries.

## Viewing inventory control accounts

The screen lists each inventory ledger purpose with its code, linked general ledger account, required account type, and whether postings exist. Use it to confirm where inventory value and related movements will appear in the general ledger.

## How the mapping is used

Inventory documents create item-level quantity and value entries in the inventory ledger. The general ledger side is posted through these mappings. A control account is therefore a pointer to a GL account; it does not hold an independent balance.

**Has postings** marks mappings that form part of the recorded financial history.

## Making changes

Open the control account and select an active **Asset** GL account. Save remains on the detail page. The mapping cannot be changed after it has postings; corrections to financial history use new documents or reversals.

## See also

* [Inventory Items](inventory-items.md)
* [Item Posting Profiles](item-posting-profiles.md)
* [Company Inventory Control Accounts](../company-ledger/inventory-control-accounts.md)
* [Inventory Ledger Entries](../company-ledger/inventory-ledger-entries.md)
