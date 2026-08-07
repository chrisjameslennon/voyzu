# Item Posting Profiles

Item Posting Profiles define which financial posting codes are used for item revenue, cost, purchases, consumption, and adjustments.

## Concepts

* [Inventory](../../voyzu-core-concepts/inventory.md) explains financial items, categories, posting profiles, and valuation.
* [Financial Document Processing](../../voyzu-core-concepts/financial-document-processing.md) explains how document lines become postings.
* [Organizations and Companies](../../voyzu-core-concepts/organizations-and-companies.md) explains company inheritance.

## Viewing profiles

The list shows profile code, name, description, status, and whether postings exist. Search by visible text and filter by status. Click a row for detail; select rows for status, deletion, or export actions.

## In use

A profile is in use when an item refers to it or postings have used it. In-use profiles cannot be deleted and should not be deactivated while active items depend on them.

## Create a new profile

Select **Add Item Posting Profile**. Enter a stable code, name, and description. Under **Permitted Operations**, choose whether items using the profile may be sold, purchased, or consumed. Assign the enabled revenue, COGS, purchase expense, and consumption accounts, plus any adjustment accounts required.

## Make changes

Open the profile, update its descriptive fields, permitted operations, or posting mappings, then save. Disabling an operation clears its related account selection. Changes affect later documents; they do not rewrite historical entries.

## Change status

Use **Activate** or **Deactivate** for selected unused profiles. Deactivation prevents new use while retaining history.

## Delete

Delete only an unused profile with no postings or item references. Deletion is permanent.

## See also

* [Inventory Items](inventory-items.md)
* [Inventory Categories](inventory-categories.md)
* [Company Item Posting Profiles](../company-ledger/item-posting-profiles.md)
