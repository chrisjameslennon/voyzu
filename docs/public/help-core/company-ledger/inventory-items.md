# Inventory Items

Inventory Items manages the selected company's financial item catalogue.

## Concepts

* [Inventory](../../voyzu-core-concepts/inventory.md) explains that Voyzu items are financial rather than warehouse records, and covers posting and valuation.
* [Financial Document Processing](../../voyzu-core-concepts/financial-document-processing.md) explains item document posting.
* [Organizations and Companies](../../voyzu-core-concepts/organizations-and-companies.md) explains company-owned records.

## Viewing inventory items

The list shows item code, name, type, category, unit, derived quantity, derived book value, and status. Search or filter by type, category, and status. Open a row for full detail; use refresh for current derived balances and export for external analysis.

## In use

An item is in use when inventory or financial documents refer to it. Its quantity and book value are derived from immutable ledger entries, not edited balances.

## Create a new inventory item

Select **Add Item**. Enter a stable code and name, then choose the financial item type, category, and unit. The category supplies the posting profile. Voyzu does not ask for serial numbers, bins, locations, or warehouse controls.

## Make changes

Open the item to update allowed master data. Keep its code and financial meaning stable after use. Correct quantity or value with a financial inventory document, never by editing the displayed balance.

## Change status

Deactivate an item to stop new use while preserving its history. An in-use item may be restricted from deactivation.

## Delete

Delete only an item with no documents, ledger entries, or other references.

## See also

* [Inventory Categories](inventory-categories.md)
* [Item Posting Profiles](item-posting-profiles.md)
* [Inventory Ledger Entries](inventory-ledger-entries.md)
