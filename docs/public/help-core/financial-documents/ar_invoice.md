# AR\_INVOICE

{% hint style="info" %}
`POST /api/finance/process-document/AR_INVOICE`

`POST /api/finance/process-document/AR_INVOICE?preview`

**?preview parameter**

If `preview` is passed as a query string parameter then no ledger posting, subledger entries, or persisted records will be created and no changes will be made to the Voyzu system. The return response will be identical to the response returned for a live request.
{% endhint %}

The AR\_INVOICE posting endpoint receives a customer invoice and posts it to the Company Ledger, the Accounts Receivable Subledger, and if applicable the Tax Ledger. The engine calculates all derived amounts (line gross, invoice net / tax / gross, per-line tax components) from the supplied lines — callers do not pre-calculate amounts.

### Request Object

An Accounts Receivable Financial Document — a customer invoice — is POST-ed to the endpoint. This is a JSON object containing all values needed to create the necessary financial entries.

This request object has the following notable properties:

* A single AR Counterparty per document is supported. A single AR\_INVOICE cannot be issued to more than one Customer.
* Multiple invoice lines per document are supported. Each line carries its own revenue posting code and tax posting code.
* The AR receivable posting code is fixed at `AR_TRADE_RECEIVABLES` and cannot be overridden by the caller.
* Caller-supplied amounts are limited to `quantity` and `net_unit_price` (or, where the line has no unit basis, `net_line_total`). All other amounts are derived by the engine.

**Annotated Example:**

```jsonc
{
  // Required. Voyzu Posting document type. Must be "AR_INVOICE"
  "document_type": "AR_INVOICE",

  // Required. Company code,
  "company_code": "NZ_COMPANY_001",

  // Conditional. Exactly ONE of ar_counterparty_code
  // or ar_counterparty must be provided
  "ar_counterparty_code": "CUST_001",

  // If ar_counterparty is provided, a new AR Counterparty will be added
  /*
  "ar_counterparty": {
    "code": "CUST-10001",
    "name":  "NZ Company 2",
    "country_code": "NZ",
    "state_or_province_code": null
  }
  */

  // Optional. Caller document identifier; generated if omitted
  "document_id": "INV-1001",

  // Optional. Caller document reference
  "memo": "PO-7788",

  // Required. Date of invoice issue
  "invoice_date": "2026-04-19",
  // Optional. Journal posting date. Defaults to invoice_date
  "posting_date": "2026-04-19",

  // Optional. header level document posting code slot
  // The Document Posting Code used for the credit side
  // of the revenue journal entry for this line.

  // Applies to all document lines unless over-ridden
  // Defaults to the document property slot default if not provided

  // The specific GL Code posted is derived from the posting codes configuration
  "revenue_posting_code": "400000",

  // Required. Invoice lines (at least one)
  "lines": [
    {
      // Required. Caller line ordering identifier
      "line_id": 1,

      // Required. Description of supply
      "description": "Website design services",

      // Optional. Unit quantity in high precision decimal.
      // Required when net_unit_price is supplied.
      "quantity": 2,

      // Optional. Tax-exclusive unit price in high precision decimal.
      // Required when quantity is supplied.
      "net_unit_price": "1000.00",

      // Conditional. Tax-exclusive line total in high precision decimal.
      // Required when quantity / net_unit_price are NOT supplied.
      // If all three are supplied they must reconcile.
      "net_line_total": null,

      // Optional. Line level posting code, over-rides any header level posting code
      "revenue_posting_code": "REV_EVENTS",

      // Required. The Tax Posting Code applied to this line.
      // Resolves to one or more tax components via configured tax authorities.
      "tax_rule": "NZ_STANDARD"
    }
  ]
}
```

### Response Object

The response to a request to the AR\_INVOICE endpoint is an object containing five sub-objects:

* `detailed_document` The calculated invoice. Includes per-line tax components and resolved posting codes.
* `ar_subledger_details` Accounts Receivable Subledger details resulting from the transaction.
* `ar_counterparty_details` Details of the AR Counterparty retrieved or created.
* `tax_subledger_details` Tax Subledger details resulting from the transaction.
* `posting_details` Details of the Company Ledger journal (header + lines).

```json
{
  "detailed_document":      { /* ... */ },
  "ar_subledger_details":  { /* ... */ },
  "ar_counterparty_details": { /* ... */ },
  "tax_ledger_details": { /* ... */ },
  "posting_details":       { /* ... */ }
}
```

For a `?preview` request the response shape is identical; status fields on subledger and journal records will be `EPHEMERAL` instead of `POSTED`.

## Financial / Ledger Treatment Principles

A high level explanation of the general principles applying to the AR\_INVOICE document processing process. Individual use cases are described in more detail in the "Use cases" section.

### Journal treatment

The engine credits revenue per invoice line using `revenue_posting_code`; if omitted, the default for the `AR_INVOICE.revenue_posting_code` slot is used. Separate revenue journal lines are created per invoice line. If a tax rule resolves to multiple tax components, separate tax journal lines are created per tax component. The debit side is always posted to `AR_TRADE_RECEIVABLES`.

```txt
  AR_INVOICE

  Ledger (typical use case):

  Dr Accounts Receivable            1,150.00
    Cr Revenue                      1,000.00
    Cr Tax Output                     150.00

  BY WAY OF:

    Voyzu journal:
      Dr AR_TRADE_RECEIVABLES Control Account
        Cr Default AR_INVOICE.revenue_posting_code,
           or supplied valid revenue posting code
        Cr Tax Output posting code(s), calculated based on the line level Tax Posting code
```

### Posting Code Slots

AR\_INVOICE provides the following posting code slots:

| Slot name              | Scope                          | Description                                                                                                                            |
| ---------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `revenue_posting_code` | Header default + line override | Optional posting-code slot used to select the revenue posting target for AR invoice lines. If omitted, the configured default is used. |

### Tax treatment

AR\_INVOICE is a tax relevant document. The tax journal line is classified with the `TAX_ON_SALES` tax movement type and credits the tax on sales control account

`AR_INVOICE` creates one or more credit movements in the Tax Subledger, one per resolved tax component

### AR Subledger treatment

A valid AR Counterparty must be specified at the document header level.

`AR_INVOICE` creates a single debit movement in the AR Subledger for the invoice, against the specified counterparty. The AR entry's open amount equals the invoice gross amount and is reduced by subsequent `AR_RECEIPT` allocations.

### Inventory treatment

AR_INVOICE is inventory aware. Supply `inventory_item_code` on a line level to link an invoice line to an inventory item. If the inventory item code is not found the transaction will be rejected. If the number of items supplied exceed inventory stock levels for that master item, then inventory items on hand will become negative.

An AR_INVOICE document that supplies an `inventory_item_code` will automatically genrate an `INVENTORY_ISSUE` document, creating an inventory journal with an `INVENTORY_ISSUE` movement code.

For more information see the [inventory issue](./inventory_issue.md) documentation.

### Date treatment

Invoice date must be supplied. Posting date may be supplied, if not supplied it will default to the Invoice Date.

### Bank Details

`AR_INVOICE` does not accept bank details. Supplying `bank_cash_details` is rejected because this document does not post to a Bank / Cash account.

### Dimensions treatment

`AR_INVOICE` supports optional dimensions.

## Use cases

### Simple single-line invoice

A simple domestic invoice for one line of services, taxed at the standard NZ GST rate.

Request:

```jsonc
{
  "document_type": "AR_INVOICE",
  "company_code": "NZ_COMPANY_001",
  "ar_counterparty_code": "CUST_001",
  "document_id": "INV-1001",
  "invoice_date": "2026-04-19",
  "lines": [
    {
      "line_id": 1,
      "description": "Consulting services",
      "quantity": 1,
      "net_unit_price": "1000.00",
      "tax_rule": "NZ_STANDARD"
    }
  ]
}
```

```txt
Ledger:

  AR_INVOICE INV-1001

  Dr Accounts Receivable            1,150.00
    Cr Revenue                      1,000.00
    Cr Tax Output                     150.00

  BY WAY OF:

    Voyzu journal:
      Dr AR_TRADE_RECEIVABLES       1,150.00
        Cr 400000                1,000.00
        Cr TAX_OUTPUT                 150.00

AR Subledger Treatment:

  AR-20000
    Document: AR_INVOICE INV-1001
    Counterparty: CUST_001
    Posting code: AR_TRADE_RECEIVABLES
    Debit: 1,150.00
    Credit: -
    Open amount: 1,150.00
    Effect: creates AR invoice open item

Tax Subledger Treatment:

  TAX-30000
    Document: AR_INVOICE INV-1001
    Tax authority: IRD
    Tax rule code: STANDARD
    Tax movement: TAX_ON_SALES
    Tax rate: 0.15
    Taxable amount: 1,000.00
    Credit: 150.00
    Effect: records output tax payable

Result:
  INV-1001 is open with a balance of 1,150.00 against CUST_001.
```

### Dimensions supplied

A simple domestic invoice for one line of services, taxed at the standard NZ GST rate. "Department" dimension is specified as "SALES"

Request:

```jsonc
{
  "document_type": "AR_INVOICE",
  "company_code": "NZ_COMPANY_001",
  "ar_counterparty_code": "CUST_001",
  "document_id": "INV-1001",
  "invoice_date": "2026-04-19",
  "lines": [
    {
      "line_id": 1,
      "description": "Consulting services",
      "quantity": 1,
      "net_unit_price": "1000.00",
      "tax_rule": "GB_STANDARD",
      "dimensions":{
        "DEPARTMENT":"Sales"
      }
    }
  ]
}
```

```txt
Ledger:

  AR_INVOICE INV-1001

  Dr Accounts Receivable            1,150.00
    Cr Revenue                      1,000.00
    Cr Tax Output                     150.00

  BY WAY OF:

    Voyzu journal:
      Dr AR_TRADE_RECEIVABLES       1,150.00
        Cr 400000                1,000.00
          Dimension "DEPARTMENT=Sales" attached to Journal
        Cr TAX_OUTPUT                 150.00

```

### Single tax rule resolving to multiple tax authorities (Canada / BC)

A British Columbia company issues an invoice taxed at the standard rate. In BC the standard tax treatment combines two authorities — federal GST (5%) and provincial PST (7%) — so the single line `tax_rule: "CA_BC_STANDARD"` resolves to **two** tax components, each producing its own tax subledger entry and its own credit journal line.

Request:

```jsonc
{
  "document_type": "AR_INVOICE",
  "company_code": "CA_BC_COMPANY_001",
  "ar_counterparty_code": "CUST_BC_001",
  "document_id": "INV-2001",
  "invoice_date": "2026-04-19",
  "lines": [
    {
      "line_id": 1,
      "description": "Office supplies",
      "quantity": 1,
      "net_unit_price": "1000.00",
      "tax_posting_code": "CA_BC_STANDARD"
    }
  ]
}
```

```txt
Ledger:

  AR_INVOICE INV-2001

  Dr Accounts Receivable            1,120.00
    Cr Revenue                      1,000.00
    Cr Tax Output - GST                50.00
    Cr Tax Output - PST                70.00

  BY WAY OF:

    Voyzu journal:
      Dr AR_TRADE_RECEIVABLES       1,120.00
        Cr 400000                1,000.00
        Cr TAX_ON_SALES               120.00

AR Subledger Treatment:

  AR-20010
    Document: AR_INVOICE INV-2001
    Counterparty: CUST_BC_001
    Posting code: AR_TRADE_RECEIVABLES
    Debit: 1,120.00
    Credit: -
    Open amount: 1,120.00
    Effect: creates AR invoice open item

Tax Subledger Treatment:

  TAX-30010
    Document: AR_INVOICE INV-2001
    Tax authority: CRA
    Scheme: GST
    Tax movement: TAX_ON_SALES
    Tax rate: 0.05
    Taxable amount: 1,000.00
    Credit: 50.00
    Effect: records federal GST output tax payable

  TAX-30011
    Document: AR_INVOICE INV-2001
    Tax authority: BC_MIN_FINANCE
    Scheme: PST
    Tax movement: TAX_ON_SALES
    Tax rate: 0.07
    Taxable amount: 1,000.00
    Credit: 70.00
    Effect: records BC PST output tax payable

Result:
  INV-2001 is open with a balance of 1,120.00 against CUST_BC_001.
  Federal and provincial tax obligations are tracked separately in the Tax Ledger.
```
