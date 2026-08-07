# Inventory Items

Inventory Items shows the organization's financial item catalogue used as the default source when companies are created.

## Concepts

* [Inventory](../../voyzu-core-concepts/inventory.md) explains that Voyzu items are financial, not operational, and covers posting and weighted-average valuation.
* [Organizations and Companies](../../voyzu-core-concepts/organizations-and-companies.md) explains separate company financial records.
* [Organizations and Companies](../../voyzu-core-concepts/organizations-and-companies.md) explains why organization items are copied and then decoupled.

## Viewing items

The list shows item code, name, type, category, unit, and status. Search the catalogue and filter by item type, category, or status. Click a row to inspect its detail. Export supports selected rows, the current view, or the full dataset.

Quantity and book value are financial results derived from ledger entries. They are not warehouse stock controls. Voyzu does not manage serial numbers, bins, locations, or warehousing on this screen.

## How organization items are used

When a company is created, organization items and categories are copied into that company's records and then decoupled. Later organization edits do not change an existing company's catalogue.

## Making changes

This application screen is for inspection. Item definitions are supplied through the supported setup or API process. Never edit a derived quantity or book value directly; record the appropriate inventory financial document so the ledger produces the new balance.

## See also

* [Inventory Categories](inventory-categories.md)
* [Item Posting Profiles](item-posting-profiles.md)
* [Company Inventory Items](../company-ledger/inventory-items.md)
* [Inventory Ledger Entries](../company-ledger/inventory-ledger-entries.md)
