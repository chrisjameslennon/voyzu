# Item Posting Profiles

Item Posting Profiles determines which posting codes the selected company's items use for financial movements.

## Concepts

* [Inventory](../../voyzu-core-concepts/inventory.md) explains item posting and weighted-average valuation.
* [Financial Document Processing](../../voyzu-core-concepts/financial-document-processing.md) explains how item document lines post.
* [Organizations and Companies](../../voyzu-core-concepts/organizations-and-companies.md) explains company settings.

## Viewing item posting profiles

The list shows profile code, name, description, status, and posting state. Search and status filters narrow the list. Open a profile for its revenue, COGS, purchase expense, consumption, and adjustment mappings.

## In use

A profile is in use when an item or posting refers to it. Used profiles must remain available to explain how item activity was posted.

## Create a new item posting profile

Select **Add Item Posting Profile**. Enter a stable code, name, and description. Under **Permitted Operations**, choose whether items using the profile may be sold, purchased, or consumed, then assign the enabled posting accounts.

## Make changes

Open the profile and update its permitted operations or account mappings. Disabling an operation clears its related account selection. A changed mapping applies to later documents; it does not move historical postings.

## Change status

Deactivate only a profile no active item requires. Reactivate it to make it selectable again.

## Delete

Delete only a profile with no item references or postings.

## See also

* [Inventory Items](inventory-items.md)
* [Inventory Control Accounts](inventory-control-accounts.md)
* [Inventory Ledger Entries](inventory-ledger-entries.md)
