# AP\_BILL

{% hint style="info" %}
`POST /api/finance/process-document/AP_BILL`

`POST /api/finance/process-document/AP_BILL?preview`

**?preview parameter**

If `preview` is passed as a query string parameter then no ledger posting, subledger entries, or persisted records will be created and no changes will be made to the Voyzu system. The return response will be identical to the response returned for a live request.
{% endhint %}

The AP\_BILL posting endpoint receives a supplier bill and posts it to the Company Ledger, the Accounts Payable Subledger, and if applicable the Tax Ledger.

AP\_BILL records supplier bill lines and resolves tax from each line's `tax_rule`. The engine derives tax components from configured tax rules and validates supplied gross totals where they are provided.

### Request Object

An Accounts Payable Financial Document — a supplier bill — is POST-ed to the endpoint. This is a JSON object containing all values needed to create the necessary financial entries.

This request object has the following notable properties:

* A single AP Counterparty per document is supported. A single AP\_BILL cannot be posted against more than one Supplier.
* Multiple bill lines per document are supported. Each line may carry its own purchase posting code.
* The AP payable posting code is fixed at `AP_TRADE_PAYABLES` and cannot be overridden by the caller.
* Each taxable bill line supplies a `tax_rule`. The rule resolves to one or more configured tax components and tax authorities.
* Caller-supplied tax components are only used for tax rules configured as caller supplied.
* `tax_recoverable`, a boolean specifying whether tax is recoverable for the bill may be supplied as a header default and overridden where tax is supplied.

**Annotated Example:**

```jsonc
{
  // Required. Voyzu posting document type. Must be "AP_BILL".
  "document_type": "AP_BILL",

  // Required. Company code.
  "company_code": "CA_BC_COMPANY_001",

  // Conditional. Exactly ONE of ap_counterparty_code
  // or ap_counterparty must be provided.
  "ap_counterparty_code": "SUPP_BC_001",

  // If ap_counterparty is provided, a new AP Counterparty will be added.
  /*
  "ap_counterparty": {
    "code": "SUPP-10001",
    "name": "BC Office Supplies Ltd",
    "country_code": "CA",
    "state_or_province_code": "BC"
  }
  */

  // Required. Supplier's own invoice number.
  // Used for supplier-bill duplicate detection.
  "supplier_invoice_number": "SUPP-INV-7781",

  // Optional. Caller document identifier; generated if omitted
  "document_id": "BILL-1001",

  // Optional. Caller document reference / memo.
  "memo": "April office supplies",

  // Required. Supplier bill date.
  "bill_date": "2026-04-19",

  // Optional. Journal posting date. Defaults to bill_date.
  "posting_date": "2026-04-19",

  // Optional header-level recoverability default.
  // true = tax is recoverable and posts to Tax on Purchases.
  // false = tax is non-recoverable and is added to purchase/expense/asset cost.
  "tax_recoverable": true,

  // Optional header-level purchase posting code slot.
  // Applies to all document lines unless overridden.
  // Defaults to the AP_BILL purchase posting-code slot default if not provided.
  "purchase_posting_code": "699000",

  // Required. Supplier bill lines.
  "lines": [
    {
      // Optional. Caller line ordering identifier.
      "line_id": 1,

      // Required. Description of purchase.
      "description": "Office supplies",

      // Required. Supplier-stated tax-exclusive line amount.
      "net_amount": "1000.00",

      // Required. Tax rule applied to this line.
      // Resolves to one or more tax components via configured tax authorities.
      "tax_rule": "CA_BC_STANDARD",

      // Optional. Supplier-stated gross amount.
      // If supplied, must equal net_amount plus engine-derived tax.
      "gross_amount": "1120.00",

      // Optional. Overrides header tax_recoverable.
      "tax_recoverable": true,

      // Optional. Line-level posting code; overrides header purchase_posting_code.
      "purchase_posting_code": "699000",

      // Optional. Dimensions for reporting.
      // Attached to the expense/asset/purchase journal line.
      "dimensions": {
        "DEPARTMENT": "Admin",
        "LOCATION": "BC"
      }
    },
    {
      "line_id": 2,
      "description": "Freight",
      "net_amount": "200.00",
      "tax_rule": "CA_BC_STANDARD",
      "gross_amount": "224.00",
      "purchase_posting_code": "FREIGHT_EXPENSE",
      "dimensions": {
        "DEPARTMENT": "Admin",
        "LOCATION": "BC"
      }
    }
  ]

  /*
  // Caller-supplied tax components are only allowed for a tax rule
  // configured with caller-supplied calculation.
  //
  // "tax_rule": "CALLER_SUPPLIED",
  // "tax_components": [
  //   {
  //     "tax_authority_code": "IRD",
  //     "tax_rate": 0.15,
  //     "invoice_label": "GST"
  //   }
  // ]
  */
}
```

### Response Object

The response to a request to the AP\_BILL endpoint is an object containing five sub-objects:

* `detailed_document` The validated supplier bill. Includes resolved posting codes and tax treatment.
* `ap_subledger_details` Accounts Payable Subledger details resulting from the transaction.
* `ap_counterparty_details` Details of the AP Counterparty retrieved or created.
* `tax_ledger_details` Tax Ledger details resulting from the transaction.
* `posting_details` Details of the Company Ledger journal (header + lines).

```json
{
  "detailed_document":      { /* ... */ },
  "ap_subledger_details":  { /* ... */ },
  "ap_counterparty_details": { /* ... */ },
  "tax_ledger_details": { /* ... */ },
  "posting_details":       { /* ... */ }
}
```

For a `?preview` request the response shape is identical; status fields on subledger and journal records will be `EPHEMERAL` instead of `POSTED`.

## Financial / Ledger Treatment Principles

A high level explanation of the general principles applying to the AP\_BILL document processing process. Individual use cases are described in more detail in the "Use cases" section.

### Journal treatment

The engine debits purchase, expense, or asset lines using `purchase_posting_code`; if omitted, the default for the `AP_BILL.purchase_posting_code` slot is used. The credit side is always posted to `AP_TRADE_PAYABLES`.

Recoverable tax is posted to Tax on Purchases. Non-recoverable tax is added to the purchase, expense, or asset cost.

```txt
  AP_BILL

  Ledger (typical use case):

  Dr Expense / Purchase             1,000.00
  Dr Tax on Purchases                 150.00
    Cr Accounts Payable             1,150.00

  BY WAY OF:

    Voyzu journal:
      Dr Default AP_BILL.purchase_posting_code,
         or supplied valid purchase posting code
      Dr Tax on Purchases, where tax is recoverable
        Cr AP_TRADE_PAYABLES Control Account
```

### Posting Code Slots

AP\_BILL provides the following posting code slots:

| Slot name               | Scope                          | Description                                                                                                                                  |
| ----------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `purchase_posting_code` | Header default + line override | Optional posting-code slot used to select the purchase, expense, or asset posting target for AP bill lines. If omitted, the default is used. |

### Tax treatment

AP\_BILL is a tax relevant document. Each line supplies a `tax_rule`; the engine resolves the rule to configured tax components and derives the tax amount from the line net amount.

`AP_BILL` creates tax movements for resolved recoverable tax components. Recoverable tax creates a debit movement in the Tax Ledger. Non-recoverable tax is included in the purchase, expense, or asset posting and does not create a recoverable tax balance.

Counterparty country or region is stored on the AP Counterparty but does not select the tax rule. The caller supplies the appropriate line `tax_rule`.

### AP Subledger treatment

A valid AP Counterparty must be specified at the document header level.

`AP_BILL` creates a single credit movement in the AP Subledger for the supplier bill. The AP entry's open amount equals the bill gross amount and is reduced by subsequent `AP_PAYMENT` allocations.

### Inventory treatment

AP\_BILL is inventory aware. Supply `inventory_item_code` on a line level to link a supplier bill line to an inventory item. If the inventory item code is not found the transaction will be rejected.

An `AP_BILL` line that supplies an `inventory_item_code` may automatically generate an `INVENTORY_RECEIPT` document, creating an Inventory Ledger entry with an `INVENTORY_RECEIPT` movement code.

The `AP_BILL` journal posts the payable, supplier tax, and purchase or inventory debit. The generated inventory receipt records the inventory quantity and book value movement only; it must not duplicate the AP bill journal.

If supplier tax is recoverable, inventory book value is based on the line net amount. If supplier tax is non-recoverable, the non-recoverable tax is included in the purchase, expense, or asset cost according to the AP bill tax treatment.

For more information see the [inventory receipt](inventory_receipt.md) documentation.

### Date treatment

Bill date must be supplied. Posting date may be supplied; if not supplied it will default to the bill date.

### Bank Details

`AP_BILL` does not accept bank details. Supplying `bank_cash_details` is rejected because this document does not post to a Bank / Cash account.

### Dimensions treatment

`AP_BILL` supports optional dimensions. Dimensions attach to purchase, expense, or asset journal lines.

## Use cases

### Simple single-line bill

A simple domestic supplier bill for one line of services with recoverable tax.

Request:

```jsonc
{
  "document_type": "AP_BILL",
  "company_code": "NZ_COMPANY_001",
  "ap_counterparty_code": "SUPP_001",
  "supplier_invoice_number": "SUPP-INV-1001",
  "document_id": "BILL-1001",
  "bill_date": "2026-04-19",
  "lines": [
    {
      "line_id": 1,
      "description": "Consulting services",
      "net_amount": "1000.00",
      "tax_rule": "NZ_STANDARD",
      "gross_amount": "1150.00"
    }
  ]
}
```

```txt
Ledger:

  AP_BILL SUPP-INV-1001

  Dr General Expenses              1,000.00
  Dr Tax on Purchases                150.00
    Cr Accounts Payable            1,150.00

  BY WAY OF:

    Voyzu journal:
      Dr 699000           1,000.00
      Dr TAX_ON_PURCHASES            150.00
        Cr AP_TRADE_PAYABLES       1,150.00

AP Subledger Treatment:

  AP-20000
    Document: AP_BILL SUPP-INV-1001
    Counterparty: SUPP_001
    Posting code: AP_TRADE_PAYABLES
    Debit: -
    Credit: 1,150.00
    Open amount: 1,150.00
    Effect: creates AP bill open item

Tax Subledger Treatment:

  TAX-30000
    Document: AP_BILL SUPP-INV-1001
    Tax authority: IRD
    Tax movement: Tax on Purchases
    Debit: 150.00
    Effect: records recoverable input tax

Result:
  SUPP-INV-1001 is open with a balance of 1,150.00 against SUPP_001.
```

### Supplier bill with multi-component tax

Request:

```jsonc
{
  "document_type": "AP_BILL",
  "company_code": "CA_BC_COMPANY_001",
  "ap_counterparty_code": "SUPP_BC_001",
  "supplier_invoice_number": "SUPP-INV-2001",
  "document_id": "BILL-2001",
  "bill_date": "2026-04-19",
  "lines": [
    {
      "line_id": 1,
      "description": "Office supplies",
      "net_amount": "1000.00",
      "tax_rule": "CA_BC_STANDARD",
      "gross_amount": "1120.00"
    },
    {
      "line_id": 2,
      "description": "Freight",
      "net_amount": "200.00",
      "tax_rule": "CA_BC_STANDARD",
      "gross_amount": "224.00"
    }
  ]
}
```

```txt
Ledger:

  AP_BILL SUPP-INV-2001

  Dr General Expenses              1,200.00
  Dr Tax on Purchases                144.00
    Cr Accounts Payable            1,344.00

Result:
  The multi-component tax rule resolves the tax components and posts recoverable tax to Tax on Purchases.
```

### Dimensions supplied

A supplier bill line may include dimensions for management reporting.

Request:

```jsonc
{
  "document_type": "AP_BILL",
  "company_code": "NZ_COMPANY_001",
  "ap_counterparty_code": "SUPP_001",
  "supplier_invoice_number": "SUPP-INV-1002",
  "document_id": "BILL-1002",
  "bill_date": "2026-04-19",
  "lines": [
    {
      "line_id": 1,
      "description": "Consulting services",
      "net_amount": "1000.00",
      "tax_rule": "NZ_STANDARD",
      "dimensions": {
        "DEPARTMENT": "Admin"
      }
    }
  ]
}
```

```txt
Ledger:

  AP_BILL SUPP-INV-1002

  Dr General Expenses              1,000.00
    Dimension "DEPARTMENT=Admin" attached to expense journal line
  Dr Tax on Purchases                150.00
    Cr Accounts Payable            1,150.00
```
