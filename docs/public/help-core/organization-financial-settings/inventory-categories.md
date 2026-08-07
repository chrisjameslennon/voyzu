# Inventory Categories

Inventory Categories groups the organization's financial item definitions and supplies category defaults when a company is created.

## Concepts

* [Inventory](../../voyzu-core-concepts/inventory.md) explains financial inventory, categories, posting profiles, and valuation.
* [Organizations and Companies](../../voyzu-core-concepts/organizations-and-companies.md) explains separate company records.
* [Organizations and Companies](../../voyzu-core-concepts/organizations-and-companies.md) explains why inventory defaults are copied and then decoupled.

## Viewing categories

The list shows code, name, description, posting profile, status, and usage state. Search by code, name, description, or posting profile and filter by status. Click a row to open it; select rows for status, delete, and export actions.

## In use

A category is in use when an item refers to it. It cannot be deleted or deactivated while active records depend on it.

## Create a new category

Select **Add Category**. Enter a stable code, a clear name, and a description that distinguishes it from similar categories, then select the posting profile inherited by its items. New categories are active by default.

## Make changes

Open the category to edit its code, name, description, or posting profile. Changing the posting profile changes the permitted operations and posting accounts used by every item in the category. Organization category changes do not flow into company categories that were copied during company creation.

## Change status

Activate or deactivate selected unused categories. Inactive categories remain visible for history but are unavailable for new use.

## Delete

Delete only an unused category. Deletion is permanent.

## See also

* [Inventory Items](inventory-items.md)
* [Item Posting Profiles](item-posting-profiles.md)
* [Company Inventory Categories](../company-ledger/inventory-categories.md)
