# INVENTORY_RECEIPT

{% hint style="info" %}
`POST /api/finance/process-document/INVENTORY_RECEIPT`

`POST /api/finance/process-document/INVENTORY_RECEIPT?preview`

**?preview parameter**

If `preview` is passed as a query string parameter then no ledger posting, inventory ledger entries, or persisted records will be created and no changes will be made to the Voyzu system. The return response will be identical to the response returned for a live request.
{% endhint %}

The INVENTORY_RECEIPT posting endpoint records inventory quantity and book value coming into the Inventory Ledger.

INVENTORY_RECEIPT is a financial inventory document. It does not manage operational stock, warehouses, bins, serial numbers, batches, fulfilment, or stock availability. It records the financial movement of an inventory item definition/SKU and posts the resulting book value movement to the Company Ledger.

Inventory receipts can be created in two ways:

* Directly, by posting an `INVENTORY_RECEIPT` document to this endpoint.
* Indirectly, where another source document such as an `AP_BILL` creates a generated inventory receipt entry for an inventory item line.

## Request Object

An Inventory Receipt Financial Document is POST-ed to the endpoint. This is a JSON object containing all values needed to create the inventory ledger movement and the related Company Ledger journal.

This request object has the following notable properties:

* Multiple receipt lines per document are supported.
* Each line must specify an `inventory_item_code`.
* Each line must specify a positive `quantity_delta`.
* The Inventory Control posting target is resolved from Inventory Settings and cannot be overridden by the caller.
* The offset GL code is resolved from the item category's posting profile where this receipt creates its own journal.
* Supply either a unit book value or request to use the current average book value.
* Bank / Cash details are not accepted.
* Optional dimensions are supported at line level and attach to the inventory journal line.

**Annotated Example:**

```jsonc
{
  // Required. Voyzu posting document type. Must be "INVENTORY_RECEIPT".
  "document_type": "INVENTORY_RECEIPT",

  // Required. Company code.
  "company_code": "NZ_COMPANY_001",

  // Optional. Caller document identifier; generated if omitted.
  "document_id": "INV-REC-1001",

  // Optional. Caller document reference / memo.
  "memo": "Direct warehouse receipt GR-7781",

  // Required. Date of the inventory receipt event.
  "receipt_date": "2026-05-06",

  // Optional. Journal posting date. Defaults to receipt_date.
  "posting_date": "2026-05-06",

  // Required. The source of this document.
  "source": {
    // Use "SELF" when directly supplied.
    // Use the generating document type when produced by another financial document.
    "source_document": "SELF"
  },

  // Required. Inventory receipt lines.
  "lines": [
    {
      // Required. Voyzu inventory item / SKU definition.
      // This is not an individual physical unit or serial-numbered asset.
      "inventory_item_code": "SKU-WID-001",

      // Required. Quantity movement into inventory.
      // Must be positive for INVENTORY_RECEIPT.
      "quantity_delta": "20",

      // Required. How Voyzu should determine the unit book value for this receipt.
      // SUPPLIED_UNIT_BOOK_VALUE: caller supplies unit_book_value.
      // CURRENT_AVERAGE_BOOK_VALUE: Voyzu uses the item's current average unit book value.
      "valuation_method": "SUPPLIED_UNIT_BOOK_VALUE",

      // Conditional: Required when valuation_method is SUPPLIED_UNIT_BOOK_VALUE.
      // This is the book/carrying value per unit supplied by the source document.
      // Voyzu calculates book_value_delta = quantity_delta * unit_book_value.
      "unit_book_value": "55.00",

      // Optional. Dimensions for reporting.
      "dimensions": {
        "LOCATION": "MAIN",
        "STOCK_TYPE": "FINISHED_GOODS"
      }
    }
  ]
}
```

## Response Object

The response to an INVENTORY_RECEIPT request is an object containing three sub-objects:

* `detailed_document` The validated inventory receipt. Includes resolved valuation method, unit book value used, book value deltas, and posting treatment.
* `inventory_ledger_details` Inventory Ledger movements resulting from the receipt.
* `posting_details` Details of the Company Ledger journal where this receipt creates a journal.

```json
{
  "detailed_document": { /* ... */ },
  "inventory_ledger_details": { /* ... */ },
  "posting_details": { /* ... */ }
}
```

For a `?preview` request the response shape is identical; status fields on inventory ledger and journal records will be `EPHEMERAL` instead of `POSTED`.

### Valuation methods

`INVENTORY_RECEIPT` supports the following valuation methods for directly supplied receipt lines:

| Valuation method | Caller supplies | Voyzu calculates | Typical use |
| ---------------- | --------------- | ---------------- | ----------- |
| `SUPPLIED_UNIT_BOOK_VALUE` | `quantity_delta`, `unit_book_value` | `book_value_delta` | Direct receipt where the caller knows the book value of the units received. |
| `CURRENT_AVERAGE_BOOK_VALUE` | `quantity_delta` | `unit_book_value_used`, `book_value_delta` | Direct receipt where the quantity should be brought in at the current average unit book value. |

`unit_book_value` is the unit value supplied by the source document/caller. `book_value_delta` is a resolved movement value. It is stored on the posted inventory ledger line and is not supplied directly on an `INVENTORY_RECEIPT` request.

## Financial / Ledger Treatment Principles

A high level explanation of the general principles applying to the INVENTORY_RECEIPT document processing process. Individual use cases are described in more detail in the "Use cases" section.

### Journal treatment

The Inventory Control side is resolved from Inventory Settings. The other GL code depends on whether the receipt creates its own journal or was generated from another document.

```txt
INVENTORY_RECEIPT - direct positive receipt

  Dr Inventory Settings.inventory_control_posting_code
    Cr Item Posting Profile.adjustment_gain_code

INVENTORY_RECEIPT - generated from AP_BILL

  The AP_BILL journal posts the inventory debit.
  The generated inventory receipt records the inventory ledger movement and must not duplicate the AP_BILL journal.
```

### Inventory Ledger movement codes

The Inventory Ledger uses the following movement codes:

| Movement code | Quantity effect | Book value effect | Typical source | Used in inventory receipt |
| ------------- | --------------- | ----------------- | -------------- | ------------------------- |
| `INVENTORY_RECEIPT` | Positive | Positive | `INVENTORY_RECEIPT`, `AP_BILL`, opening stock | Yes |
| `INVENTORY_ISSUE` | Negative | Negative | `AR_INVOICE` sold inventory line, internal issue | No |
| `INVENTORY_QUANTITY_ADJUSTMENT` | Positive or negative | Positive or negative | Stocktake, write-on, write-off, damage, shrinkage | No |
| `INVENTORY_VALUE_ADJUSTMENT` | Zero | Positive or negative | Value-only revaluation or correction | No |

### Inventory Ledger treatment

`INVENTORY_RECEIPT` creates positive quantity movements and positive book value movements in the Inventory Ledger.

The Inventory Ledger is the source of truth for item-level financial inventory movements. Current quantity, current book value, and current average unit book value are derived from posted inventory ledger movements.

```txt
Item quantity balance =
  opening quantity
  + receipt quantities
  - issue quantities
  +/- adjustment quantities

Item book value balance =
  opening book value
  + receipt book values
  - issue book values
  +/- adjustment book values

Average unit book value =
  item book value balance / item quantity balance
```

### Moving weighted-average book value

Voyzu uses pooled item-level book value. It does not track FIFO layers, batch costs, serial-number costs, or individual unit costs.

When a receipt is posted at a unit book value different from the current average, the item’s new average unit book value is recalculated from the resulting balance.

```txt
New average unit book value =
  (existing book value balance + receipt book value delta)
  /
  (existing quantity balance + receipt quantity delta)
```

### Posting Code Slots

INVENTORY_RECEIPT does not support caller-supplied posting code slots.

### Tax treatment

INVENTORY_RECEIPT has no direct tax treatment and creates no Tax Ledger entries.

Inventory ledger values are tax-exclusive unless a non-recoverable tax amount forms part of the item's carrying value. Recoverable tax remains on the source document and Tax Ledger, and is not included in the inventory ledger.

If inventory is purchased through an AP bill, supplier tax is handled by `AP_BILL`. The generated inventory receipt records the inventory quantity and book value movement only.

### Date treatment

`receipt_date` must be supplied. `posting_date` may be supplied. If not supplied, `posting_date` defaults to `receipt_date`.

### Bank Details

`INVENTORY_RECEIPT` does not accept bank details. Supplying `bank_cash_details` is rejected because this document does not post to a Bank / Cash account.

### Dimensions treatment

`INVENTORY_RECEIPT` supports optional line-level dimensions. Dimensions attach to the Inventory journal line.

## Generated receipt from AP_BILL

When an `AP_BILL` line references an inventory item, Voyzu may generate an `INVENTORY_RECEIPT` from that AP bill line.

In this case the AP bill is the source financial document. The inventory receipt is the inventory-ledger representation of the inventory effect.

The AP bill line supplies the value. A separate inventory book value override is not accepted on the AP bill.

```jsonc
{
  // Source AP bill line.
  "document_type": "AP_BILL",
  "document_id": "SAMP-BILL-001",
  "bill_date": "2026-05-06",
  "posting_date": "2026-05-06",
  "lines": [
    {
      "line_id": 1,
      "inventory_item_code": "SKU-WID-001",
      "description": "Standard Widget",
      "quantity": "20",
      "unit_amount": "55.00",
      "net_amount": "1100.00"
    }
  ]
}
```

Generated inventory receipt line:

```jsonc
{
  "document_type": "INVENTORY_RECEIPT",
  "document_id": "INV-REC-10522",
  "receipt_date": "2026-05-06",
  "posting_date": "2026-05-06",
  "source": {
    "source_type": "GENERATED_FROM_AP_BILL",
    "source_document_type": "AP_BILL",
    "source_document_id": "SAMP-BILL-001",
    "source_line_id": 1
  },
  "lines": [
    {
      "line_id": 1,
      "inventory_item_code": "SKU-WID-001",
      "quantity_delta": "20",
      "valuation_method": "SOURCE_LINE_UNIT_VALUE",
      "unit_book_value_used": "55.00",
      "book_value_delta": "1100.00"
    }
  ]
}
```

For generated AP bill receipts:

```txt
unit_book_value_used = AP_BILL line unit_amount
book_value_delta = AP_BILL line net_amount
```

If `unit_amount` is not supplied by the AP bill shape, Voyzu may derive the source line unit value as:

```txt
source line unit value = AP_BILL line net_amount / AP_BILL line quantity
```

## Use cases

### Direct receipt with supplied unit book value

A warehouse system sends a receipt of 20 units. The caller states that these units should enter inventory at 55.00 per unit.

```jsonc
{
  "document_type": "INVENTORY_RECEIPT",
  "company_code": "NZ_COMPANY_001",
  "document_id": "INV-REC-1001",
  "receipt_date": "2026-05-06",
  "lines": [
    {
      "line_id": 1,
      "inventory_item_code": "SKU-WID-001",
      "description": "Standard Widget",
      "quantity_delta": "20",
      "valuation_method": "SUPPLIED_UNIT_BOOK_VALUE",
      "unit_book_value": "55.00"
    }
  ]
}
```

```txt
Calculation:

  book_value_delta = quantity_delta * unit_book_value
  book_value_delta = 20 * 55.00
  book_value_delta = 1,100.00

Ledger:

  Dr Inventory Control             1,100.00
    Cr Item Posting Profile.adjustment_gain_code  1,100.00

Inventory Ledger:

  Movement:             INVENTORY_RECEIPT
  Item:                 SKU-WID-001
  Quantity delta:       20
  Unit value supplied:  55.00
  Book value delta:     1,100.00
```

### AP bill generated receipt

A supplier bill records 20 units at 55.00 each. Voyzu posts the AP bill and generates the inventory receipt from the AP bill line.

```txt
AP bill line:

  Quantity:        20
  Unit amount:     55.00
  Net amount:      1,100.00

Generated Inventory Receipt:

  Movement:             INVENTORY_RECEIPT
  Quantity delta:       20
  Valuation method:     SOURCE_LINE_UNIT_VALUE
  Unit value supplied:  55.00
  Book value delta:     1,100.00
```

If the item balance before the receipt is 90 units with a book value of 4,500.00, the new balance is:

```txt
New quantity balance = 90 + 20 = 110
New book value balance = 4,500.00 + 1,100.00 = 5,600.00
New average unit book value = 5,600.00 / 110 = 50.91
```

## Considerations

* INVENTORY_RECEIPT is for inventory value coming into the Inventory Ledger.
* `book_value_delta` is resolved and stored by Voyzu because it is the amount posted to Inventory Control.
* Receipts generated from AP bills are valued from the AP bill line. AP bill inventory lines do not accept a separate book value override.
* Changes to the carrying value of existing inventory should be posted as `INVENTORY_ADJUSTMENT`
* Voyzu uses item-level pooled book value. It does not track FIFO, cost layers, serials, batches, or per-unit identity.
