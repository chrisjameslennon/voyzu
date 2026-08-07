# Inventory

Voyzu treats inventory as a **financial subledger**. It records the quantity and book value of items, then posts the financial effect of inventory movements to the general ledger.

It is not an operational inventory or warehouse management system. Voyzu does not manage:

* Warehouses, bins, or stock locations
* Serial numbers, batches, or individual units
* Picking, packing, fulfillment, or transfers
* Stock reservations or availability
* Physical handling and logistics

An operational system can manage those activities and send their financial results to Voyzu.

```mermaid
flowchart LR
    P[Posting profile] --> C[Item category]
    C --> I[Item]
    D[Financial document] --> M[Inventory movement]
    I --> M
    M --> L[Inventory ledger]
    M --> G[General ledger]
```

## Items

An item represents the financial identity of something that is bought, sold, consumed, or held as inventory. It can correspond to a SKU in another system, but it does not contain that system's operational stock detail.

Each item has a code, name, unit, and category. Its type determines how Voyzu treats it:

| Item type     | Financial treatment                                             |
| ------------- | --------------------------------------------------------------- |
| Inventory     | Quantity and book value are maintained in the inventory ledger. |
| Non-inventory | Can be bought or sold without maintaining an inventory balance. |
| Service       | Represents a service rather than physical stock.                |

The category's posting profile defines whether its items may be sold, purchased, or consumed. This keeps permitted financial operations aligned with their related general ledger accounts.

For inventory items, Voyzu derives the current quantity on hand, total book value, and average unit book value from posted inventory movements. These are financial balances, not a statement of stock available at a particular location.

## Categories

Categories group related items for classification and reporting. Each category selects an item posting profile, so every item in the category shares the same permitted operations and posting accounts. The company's inventory control account provides the inventory asset side of the posting.

Organization-level items and categories act as defaults when a company is created. The resulting company records are then decoupled, so each company can maintain its own inventory setup.

## Posting profiles

A posting profile tells Voyzu which general ledger accounts to use for the non-inventory side of an item's transactions. It also defines the permitted operations for its items: sold, purchased, and consumed. The related account fields are available only when that operation is permitted. A profile can define accounts for:

* Revenue
* Cost of goods sold
* Purchase expense
* Consumption
* Inventory adjustment gains
* Inventory adjustment losses

Many categories can share a posting profile, and all items in a category inherit that profile. This keeps account selection consistent without embedding general ledger account choices in every item or transaction.

When a financial document line supplies an item, Voyzu uses the posting profile selected by the item's category. A posting account explicitly supplied by the financial document overrides the profile for that document only.

The inventory asset side is posted to the company's [inventory control account](control-accounts.md). The other side is selected from the item category's posting profile or is provided by the source financial document.

Typical postings include:

| Movement                      | Debit               | Credit            |
| ----------------------------- | ------------------- | ----------------- |
| Direct inventory receipt      | Inventory control   | Adjustment gain   |
| Sale-related inventory issue  | Cost of goods sold  | Inventory control |
| Consumption issue             | Consumption expense | Inventory control |
| Positive inventory adjustment | Inventory control   | Adjustment gain   |
| Negative inventory adjustment | Adjustment loss     | Inventory control |

An accounts payable bill for an inventory item can create an inventory receipt, while an accounts receivable invoice can create an inventory issue. The source document handles matters such as the supplier, customer, payable, receivable, revenue, and tax. The inventory movement records the item's quantity and book value effect without duplicating the source document's journal posting.

## Inventory movements

The inventory ledger supports four kinds of financial movement:

| Movement            | Effect                                                          |
| ------------------- | --------------------------------------------------------------- |
| Receipt             | Increases quantity and book value.                              |
| Issue               | Decreases quantity and book value at the current average value. |
| Quantity adjustment | Corrects quantity and its associated book value.                |
| Value adjustment    | Corrects book value without changing quantity.                  |

Each movement records its source, item, quantity change, book value change, and resulting balances. The inventory ledger therefore explains the inventory control account balance at item level.

## Moving weighted-average book value

Voyzu uses **moving weighted-average book value**, also known as perpetual weighted-average valuation. Inventory of the same item is treated as one pool; Voyzu does not maintain FIFO layers or costs for batches, serial numbers, or individual units.

The current average is:

```
Average unit book value = total item book value / item quantity
```

When a receipt is posted, its value is combined with the existing pool:

```
New average unit book value =
  (existing book value + receipt book value)
  / (existing quantity + receipt quantity)
```

For example, an item with 10 units valued at $100 has an average unit book value of $10. Receiving another 10 units valued at $140 produces 20 units valued at $240, with a new average of $12 per unit. A subsequent issue is valued at that current $12 average.

This model gives the general ledger a continuously updated inventory value while keeping operational stock handling outside Voyzu.

For the exact posting inputs and ledger treatment, see [Inventory Receipt](../help-core/financial-documents/inventory_receipt.md), [Inventory Issue](../help-core/financial-documents/inventory_issue.md), and [Inventory Adjustment](../help-core/financial-documents/inventory_adjustment.md).
