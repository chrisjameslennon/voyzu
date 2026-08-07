# Inventory Categories

Inventory Categories groups the selected company's financial item records.

## Concepts

* [Inventory](../../voyzu-core-concepts/inventory.md) explains financial items, posting profiles, and valuation.
* [Organizations and Companies](../../voyzu-core-concepts/organizations-and-companies.md) explains separate company records.
* [Organizations and Companies](../../voyzu-core-concepts/organizations-and-companies.md) explains copied inventory defaults.

## Viewing inventory categories

The list shows code, name, description, posting profile, status, and usage state. Search and status filters narrow the records. Open a row for detail; select rows for status, deletion, or export.

## In use

A category is in use when a company item refers to it. It cannot be deleted or deactivated while active records depend on it.

## Create a new inventory category

Select **Add Category** and enter a stable code, clear name, useful description, and the posting profile inherited by its items.

## Make changes

Open the category to change its code, name, description, or posting profile. Changing the posting profile changes the permitted operations and posting accounts used by every item in the category. This is a company record and is decoupled from the organization category copied at company creation.

## Change status

Deactivate only unused categories. Inactive categories remain available for historical interpretation.

## Delete

Delete only a category with no item references.

## See also

* [Inventory Items](inventory-items.md)
* [Item Posting Profiles](item-posting-profiles.md)
* [Inventory Ledger Entries](inventory-ledger-entries.md)
