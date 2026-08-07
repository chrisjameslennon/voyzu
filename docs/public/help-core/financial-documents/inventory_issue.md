# INVENTORY_ISSUE

{% hint style="info" %}
`POST /api/finance/process-document/INVENTORY_ISSUE`

`POST /api/finance/process-document/INVENTORY_ISSUE?preview`

**?preview parameter**

If `preview` is passed as a query string parameter then no ledger posting, inventory ledger entries, or persisted records will be created and no changes will be made to the system. The return response will be identical to the response returned for a live request.
{% endhint %}

The INVENTORY_ISSUE posting endpoint records inventory quantity and book value leaving the Inventory Ledger.

INVENTORY_ISSUE is a financial inventory document. It does not manage operational stock, warehouses, bins, serial numbers, batches, fulfilment, or stock availability. It records the financial movement of an inventory item definition/SKU and posts the resulting book value movement to the Company Ledger.

Inventory issues can be created in two ways:

* Directly, by posting an `INVENTORY_ISSUE` document to this endpoint.
* Indirectly, where another source document such as an `AR_INVOICE` creates a generated inventory issue entry for an inventory item line.

## Request Object

An Inventory Issue Financial Document is POST-ed to the endpoint. This is a JSON object containing all values needed to create the inventory ledger movement and the related Company Ledger journal.

This request object has the following notable properties:

* Multiple issue lines per document are supported.
* Each line must specify an `inventory_item_code`.
* Each line must specify a negative `quantity_delta`.
* The issue book value is calculated from the item's current average unit book value.
* The Inventory Control posting target is resolved from Inventory Settings and cannot be overridden by the caller.
* The offset GL code is resolved from the item category's posting profile based on the issue purpose.
* Bank / Cash details are not accepted.
* Optional dimensions are supported at line level and attach to the inventory journal line.

**Annotated Example:**

```jsonc
{
  // Required. Posting document type. Must be "INVENTORY_ISSUE".
  "document_type": "INVENTORY_ISSUE",

  // Required. Company code.
  "company_code": "NZ_COMPANY_001",

  // Optional. Caller document identifier; generated if omitted.
  "document_id": "INV-ISS-1001",

  // Optional. Caller document reference / memo.
  "memo": "Generated issue for customer invoice SAMP-INV-002",

  // Required. Date of the inventory issue event.
  "issue_date": "2026-05-10",

  // Optional. Journal posting date. Defaults to issue_date.
  "posting_date": "2026-05-10",

  // Required. The source of this document.
  "source": {
    // Use "SELF" when directly supplied.
    // Use the generating document type when produced by another financial document.
    "source_document": "AR_INVOICE",
    "source_document_id": "SAMP-INV-002"
  },

  // Required. Inventory issue lines.
  "lines": [
    {
      // Required. Inventory item / SKU definition.
      "inventory_item_code": "SKU-WID-001",

      // Required. Quantity movement out of inventory.
      // Must be negative for INVENTORY_ISSUE.
      "quantity_delta": "-15",

      // Required for directly supplied issues.
      // SOLD uses the item category posting profile cogs_code.
      // CONSUMED uses the item category posting profile consumption_code.
      "issue_purpose": "SOLD",

      // Optional. Dimensions for reporting.
      "dimensions": {
        "LOCATION": "MAIN",
        "SALES_CHANNEL": "ONLINE"
      }
    }
  ]
}
```

## Response Object

The response to an INVENTORY_ISSUE request is an object containing three sub-objects:

* `detailed_document` The validated inventory issue. Includes calculated unit value used, book value deltas, and posting treatment.
* `inventory_ledger_details` Inventory Ledger movements resulting from the issue.
* `posting_details` Details of the Company Ledger journal.

```json
{
  "detailed_document": { /* ... */ },
  "inventory_ledger_details": { /* ... */ },
  "posting_details": { /* ... */ }
}
```

For a `?preview` request the response shape is identical; status fields on inventory ledger and journal records will be `EPHEMERAL` instead of `POSTED`.

## Financial / Ledger Treatment Principles

### Journal treatment

The Inventory Control side is resolved from Inventory Settings. The other GL code depends on the issue purpose and the item category's posting profile.

```txt
INVENTORY_ISSUE - sold item

  Dr Item Posting Profile.cogs_code
    Cr Inventory Settings.inventory_control_posting_code

INVENTORY_ISSUE - internally consumed item

  Dr Item Posting Profile.consumption_code
    Cr Inventory Settings.inventory_control_posting_code
```

### Inventory Ledger movement codes

The Inventory Ledger uses the following movement codes:

| Movement code | Quantity effect | Book value effect | Typical source | Used in inventory issue |
| ------------- | --------------- | ----------------- | -------------- | ----------------------- |
| `INVENTORY_RECEIPT` | Positive | Positive | `INVENTORY_RECEIPT`, `AP_BILL`, opening stock | No |
| `INVENTORY_ISSUE` | Negative | Negative | `AR_INVOICE` sold inventory line, internal issue | Yes |
| `INVENTORY_QUANTITY_ADJUSTMENT` | Positive or negative | Positive or negative | Stocktake, write-on, write-off, damage, shrinkage | No |
| `INVENTORY_VALUE_ADJUSTMENT` | Zero | Positive or negative | Value-only revaluation or correction | No |

### Inventory Ledger treatment

INVENTORY_ISSUE creates negative quantity movements and negative book value movements in the Inventory Ledger.

The issue value is calculated from the item's current average unit book value.

```txt
book_value_delta = quantity_delta * current_average_unit_book_value
```

`unit_value_supplied` is normally blank for issues because the source document supplies quantity, not the inventory carrying value.

### Posting Code Slots

INVENTORY_ISSUE does not support caller-supplied posting code slots.

### Tax treatment

INVENTORY_ISSUE has no direct tax treatment and creates no Tax Ledger entries.

Inventory ledger values are tax-exclusive. Any sales tax on the source sale is handled by the source document and Tax Ledger; if non-recoverable tax was capitalised into inventory, it is already part of the item's carrying value.

If inventory is sold through an AR invoice, customer tax is handled by `AR_INVOICE`. The generated inventory issue records the inventory quantity and book value movement only.

### Date treatment

`issue_date` must be supplied. `posting_date` may be supplied. If not supplied, `posting_date` defaults to `issue_date`.

### Bank Details

INVENTORY_ISSUE does not accept bank details. Supplying `bank_cash_details` is rejected because this document does not post to a Bank / Cash account.

### Dimensions treatment

INVENTORY_ISSUE supports optional line-level dimensions. Dimensions attach to the Inventory journal line.

## Generated issue from AR_INVOICE

When an `AR_INVOICE` line references an inventory item, the invoice may generate an `INVENTORY_ISSUE` from that AR invoice line.

The AR invoice is the source financial document. The inventory issue is the inventory-ledger representation of the inventory effect.

```jsonc
{
  // Source AR invoice line.
  "document_type": "AR_INVOICE",
  "document_id": "SAMP-INV-002",
  "invoice_date": "2026-05-10",
  "posting_date": "2026-05-10",
  "lines": [
    {
      "line_id": 1,
      "inventory_item_code": "SKU-WID-001",
      "description": "Standard Widget",
      "quantity": "15"
    }
  ]
}
```

Generated inventory issue line:

```jsonc
{
  "document_type": "INVENTORY_ISSUE",
  "document_id": "INV-ISS-10523",
  "issue_date": "2026-05-10",
  "posting_date": "2026-05-10",
  "source": {
    "source_type": "GENERATED_FROM_AR_INVOICE",
    "source_document_type": "AR_INVOICE",
    "source_document_id": "SAMP-INV-002",
    "source_line_id": 1
  },
  "lines": [
    {
      "line_id": 1,
      "inventory_item_code": "SKU-WID-001",
      "quantity_delta": "-15",
      "movement": "INVENTORY_ISSUE",
      "unit_book_value_used": "50.91",
      "book_value_delta": "-763.65"
    }
  ]
}
```

## Use cases

### AR invoice generated issue

An AR invoice sells 15 units. The issue value is calculated from the current average unit value.

```txt
Assume current average unit value: 50.91

Calculation:

  book_value_delta = -15 * 50.91
  book_value_delta = -763.65

Ledger:

  Dr Item Posting Profile.cogs_code   763.65
    Cr Inventory Control              763.65

Inventory Ledger:

  Movement:             INVENTORY_ISSUE
  Issue purpose:        SOLD
  Quantity delta:       -15
  Unit value supplied:  -
  Book value delta:     -763.65
```

### Internal consumption issue

Packaging inventory is consumed during fulfilment. The issue value is calculated from the current average unit value and posted to the item's consumption code.

```txt
Assume current average unit value: 1.50

Calculation:

  book_value_delta = -40 * 1.50
  book_value_delta = -60.00

Ledger:

  Dr Item Posting Profile.consumption_code   60.00
    Cr Inventory Control                     60.00

Inventory Ledger:

  Movement:             INVENTORY_ISSUE
  Issue purpose:        CONSUMED
  Quantity delta:       -40
  Unit value supplied:  -
  Book value delta:     -60.00
```

## Considerations

* INVENTORY_ISSUE is for inventory value leaving the Inventory Ledger.
* Issue value is calculated from the current average unit book value.
* `book_value_delta` is resolved and stored because it is the amount posted to Inventory Control.
* Items must be enabled for sale or consumption depending on the issue purpose.
