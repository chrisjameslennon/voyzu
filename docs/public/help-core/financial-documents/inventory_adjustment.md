# INVENTORY_ADJUSTMENT

{% hint style="info" %}
`POST /api/finance/process-document/INVENTORY_ADJUSTMENT`

`POST /api/finance/process-document/INVENTORY_ADJUSTMENT?preview`

**?preview parameter**

If `preview` is passed as a query string parameter then no ledger posting, inventory ledger entries, or persisted records will be created and no changes will be made to the system. The return response will be identical to the response returned for a live request.
{% endhint %}

The INVENTORY_ADJUSTMENT posting endpoint records inventory quantity corrections and value corrections in the Inventory Ledger.

INVENTORY_ADJUSTMENT is a financial inventory document. It does not manage operational stock, warehouses, bins, serial numbers, batches, fulfilment, or stock availability. It records the financial movement of an inventory item definition/SKU and posts the resulting book value movement to the Company Ledger.

## Request Object

An Inventory Adjustment Financial Document is POST-ed to the endpoint. This is a JSON object containing all values needed to create the inventory ledger movement and the related Company Ledger journal.

This request object has the following notable properties:

* Multiple adjustment lines per document are supported.
* Each line must specify an `inventory_item_code`.
* Quantity adjustments change quantity and book value.
* Value adjustments change book value only.
* Value adjustments supply a `book_value_delta`, not a new total item value.
* The Inventory Control posting target is resolved from Inventory Settings and cannot be overridden by the caller.
* The offset GL code is resolved from the item category's posting profile based on whether the value movement is positive or negative.
* Bank / Cash details are not accepted.
* Optional dimensions are supported at line level and attach to the inventory journal line.

**Annotated Example:**

```jsonc
{
  // Required. Posting document type. Must be "INVENTORY_ADJUSTMENT".
  "document_type": "INVENTORY_ADJUSTMENT",

  // Required. Company code.
  "company_code": "NZ_COMPANY_001",

  // Optional. Caller document identifier; generated if omitted.
  "document_id": "INV-ADJ-1001",

  // Optional. Caller document reference / memo.
  "memo": "May stocktake corrections",

  // Required. Date of the inventory adjustment event.
  "adjustment_date": "2026-05-12",

  // Optional. Journal posting date. Defaults to adjustment_date.
  "posting_date": "2026-05-12",

  // Required. The source of this document.
  "source": {
    "source_document": "SELF"
  },

  // Required. Inventory adjustment lines.
  "lines": [
    {
      // Required. Inventory item / SKU definition.
      "inventory_item_code": "SKU-WID-001",

      // Required. Quantity or value adjustment.
      "adjustment_type": "QUANTITY_ADJUSTMENT",

      // Required for QUANTITY_ADJUSTMENT.
      // Can be positive or negative.
      "quantity_delta": "-5",

      // Optional. Reason used for audit and reporting.
      "reason_code": "STOCKTAKE_VARIANCE",

      // Optional. Dimensions for reporting.
      "dimensions": {
        "LOCATION": "MAIN"
      }
    },
    {
      "inventory_item_code": "SKU-WID-001",
      "adjustment_type": "VALUE_ADJUSTMENT",

      // Required for VALUE_ADJUSTMENT.
      // This is a delta, not the new total item value.
      "book_value_delta": "-300.00",
      "reason_code": "VALUE_CORRECTION"
    }
  ]
}
```

## Response Object

The response to an INVENTORY_ADJUSTMENT request is an object containing three sub-objects:

* `detailed_document` The validated inventory adjustment. Includes calculated unit value used, book value deltas, and posting treatment.
* `inventory_ledger_details` Inventory Ledger movements resulting from the adjustment.
* `posting_details` Details of the Company Ledger journal.

```json
{
  "detailed_document": { /* ... */ },
  "inventory_ledger_details": { /* ... */ },
  "posting_details": { /* ... */ }
}
```

For a `?preview` request the response shape is identical; status fields on inventory ledger and journal records will be `EPHEMERAL` instead of `POSTED`.

## Adjustment types

| Adjustment type | Caller supplies | Calculates | Typical use |
| --------------- | --------------- | ---------- | ----------- |
| `QUANTITY_ADJUSTMENT` | `quantity_delta` | `book_value_delta` | Stocktake variance, write-on, write-off, damage, shrinkage |
| `VALUE_ADJUSTMENT` | `book_value_delta` | New average unit value | Value-only revaluation or correction |

For positive quantity adjustments, the caller may also supply `unit_book_value` when the value of the added units is known. If omitted, the current average unit book value is used.

## Financial / Ledger Treatment Principles

### Journal treatment

The Inventory Control side is resolved from Inventory Settings. The other GL code depends on the movement and whether the book value movement is positive or negative.

```txt
INVENTORY_RECEIPT - positive correction / write-on

  Dr Inventory Settings.inventory_control_posting_code
    Cr Item Posting Profile.adjustment_gain_code

INVENTORY_ISSUE - negative correction / write-off

  Dr Item Posting Profile.adjustment_loss_code
    Cr Inventory Settings.inventory_control_posting_code

INVENTORY_QUANTITY_ADJUSTMENT / INVENTORY_VALUE_ADJUSTMENT - positive value movement

  Dr Inventory Settings.inventory_control_posting_code
    Cr Item Posting Profile.adjustment_gain_code

INVENTORY_QUANTITY_ADJUSTMENT / INVENTORY_VALUE_ADJUSTMENT - negative value movement

  Dr Item Posting Profile.adjustment_loss_code
    Cr Inventory Settings.inventory_control_posting_code
```

### Inventory Ledger movement codes

The Inventory Ledger uses the following movement codes:

| Movement code | Quantity effect | Book value effect | Typical source | Can be used in inventory adjustment |
| ------------- | --------------- | ----------------- | -------------- | ----------------------------------- |
| `INVENTORY_RECEIPT` | Positive | Positive | `INVENTORY_RECEIPT`, `AP_BILL`, opening stock | Yes |
| `INVENTORY_ISSUE` | Negative | Negative | `AR_INVOICE` sold inventory line, internal issue | Yes |
| `INVENTORY_QUANTITY_ADJUSTMENT` | Positive or negative | Positive or negative | Stocktake, write-on, write-off, damage, shrinkage | Yes |
| `INVENTORY_VALUE_ADJUSTMENT` | Zero | Positive or negative | Value-only revaluation or correction | Yes |

### Inventory Ledger treatment

Quantity adjustments affect both quantity balance and book value balance.

```txt
quantity_delta = supplied quantity_delta
book_value_delta = quantity_delta * current_average_unit_book_value
```

Value adjustments affect book value balance only.

```txt
quantity_delta = 0
book_value_delta = supplied book_value_delta
```

If a UI allows the user to enter a target total item value, it should resolve that to a `book_value_delta` before posting.

```txt
book_value_delta = target_book_value_balance - current_book_value_balance
```

### Posting Code Slots

INVENTORY_ADJUSTMENT does not support caller-supplied posting code slots.

### Tax treatment

INVENTORY_ADJUSTMENT has no direct tax treatment and creates no Tax Ledger entries.

Inventory adjustment values are tax-exclusive. If a non-recoverable tax amount forms part of inventory carrying value, adjust the resulting book value only; no Tax Ledger entry is created.

### Date treatment

`adjustment_date` must be supplied. `posting_date` may be supplied. If not supplied, `posting_date` defaults to `adjustment_date`.

### Bank Details

INVENTORY_ADJUSTMENT does not accept bank details. Supplying `bank_cash_details` is rejected because this document does not post to a Bank / Cash account.

### Dimensions treatment

INVENTORY_ADJUSTMENT supports optional line-level dimensions. Dimensions attach to the Inventory journal line.

## Use cases

### Negative quantity adjustment

A stocktake finds 5 fewer units than the inventory ledger balance. The issue value is calculated from the current average unit value.

```txt
Assume current average unit value: 50.91

Calculation:

  quantity_delta = -5
  book_value_delta = -5 * 50.91
  book_value_delta = -254.55

Ledger:

  Dr Item Posting Profile.adjustment_loss_code  254.55
    Cr Inventory Control                        254.55

Inventory Ledger:

  Movement:             INVENTORY_QUANTITY_ADJUSTMENT
  Quantity delta:       -5
  Unit value supplied:  -
  Book value delta:     -254.55
```

### Positive quantity adjustment with supplied unit value

A stocktake finds 3 extra units and the caller supplies a unit value of 48.00.

```txt
Calculation:

  quantity_delta = 3
  unit_value_supplied = 48.00
  book_value_delta = 3 * 48.00
  book_value_delta = 144.00

Ledger:

  Dr Inventory Control                         144.00
    Cr Item Posting Profile.adjustment_gain_code  144.00

Inventory Ledger:

  Movement:             INVENTORY_QUANTITY_ADJUSTMENT
  Quantity delta:       3
  Unit value supplied:  48.00
  Book value delta:     144.00
```

### Value-only adjustment

A value correction reduces the carrying value of an item by 300.00 without changing quantity.

```txt
Calculation:

  quantity_delta = 0
  book_value_delta = -300.00

Ledger:

  Dr Item Posting Profile.adjustment_loss_code  300.00
    Cr Inventory Control                        300.00

Inventory Ledger:

  Movement:             INVENTORY_VALUE_ADJUSTMENT
  Quantity delta:       0
  Unit value supplied:  -
  Book value delta:     -300.00
```

## Considerations

* INVENTORY_ADJUSTMENT is for corrections to inventory quantity or book value.
* Value-only adjustments supply a delta, not a new total item value.
* `book_value_delta` is resolved and stored because it is the amount posted to Inventory Control.
* Positive value movements use the item's `adjustment_gain_code`.
* Negative value movements use the item's `adjustment_loss_code`.
