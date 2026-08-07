# AP\_CREDIT\_NOTE

{% hint style="info" %}
`POST /api/finance/process-document/AP_CREDIT_NOTE`

`POST /api/finance/process-document/AP_CREDIT_NOTE?preview`

**?preview parameter**

If `preview` is passed then no ledger posting, subledger entries, or persisted records are created. The response shape is identical to a live request.
{% endhint %}

The AP\_CREDIT\_NOTE endpoint records a supplier credit note and posts it to the Company Ledger, the Accounts Payable Subledger, and if applicable the Tax Ledger. A supplier credit note may be applied to one or more open AP bill items. Any unapplied amount is held as supplier credit.

### Request Object

This request object has the following notable properties:

* A single AP Counterparty per document is supported.
* Multiple credit note lines per document are supported.
* Optional allocations may be supplied, provided all target bills belong to the same counterparty.
* If no allocations are supplied, the credit note is held as unapplied supplier credit.
* The AP payable posting code is fixed by the engine and cannot be overridden by the caller.
* Each taxable credit note line supplies a `tax_rule`. The rule resolves to one or more configured tax components and tax authorities.
* Caller-supplied tax components are only used for tax rules configured as caller supplied.

**Annotated Example:**

```jsonc
{
  // Required. Must be "AP_CREDIT_NOTE"
  "document_type": "AP_CREDIT_NOTE",

  // Required. Company code
  "company_code": "NZ_COMPANY_001",

  // Required unless ap_counterparty is supplied
  "ap_counterparty_code": "SUPP_001",

  // Optional. Caller document identifier; generated if omitted
  "document_id": "CN-1001",

  // Required. Supplier's own credit note number
  "supplier_credit_note_number": "SUPP-CN-1001",

  // Optional. Brief caller memo
  "memo": "Credit for returned goods",

  // Required. Date of supplier credit note issue
  "credit_note_date": "2026-05-10",

  // Optional. Defaults to credit_note_date
  "posting_date": "2026-05-10",

  // Optional. Defaults to true unless configured otherwise
  "tax_recoverable": true,

  // Optional. Applies to all lines unless overridden
  "purchase_posting_code": "699000",

  // Required. Credit note lines
  "lines": [
    {
      "line_id": 1,
      "description": "Returned goods",
      "net_amount": "1000.00",
      "tax_rule": "NZ_STANDARD",
      "gross_amount": "1150.00"
    }
  ],

  // Optional. Bill allocations
  "allocations": [
    {
      // Bill number to apply this credit note to
      "document_id": "BILL-1001",
      "amount": "1150.00"
    }
  ]
}
```

### Response Object

The response contains:

* `detailed_document` The validated credit note and resolved allocations.
* `ap_subledger_details` AP Subledger details.
* `tax_ledger_details` Tax Ledger details.
* `posting_details` Company Ledger journal details.

```json
{
  "detailed_document": { /* ... */ },
  "ap_subledger_details": { /* ... */ },
  "tax_ledger_details": { /* ... */ },
  "posting_details": { /* ... */ }
}
```

For `?preview`, status fields are `EPHEMERAL` instead of `POSTED`.

## Financial / Ledger Treatment Principles

### Journal treatment

The engine debits AP control accounts and credits purchase, expense, asset, and recoverable tax accounts. Allocated amounts reduce supplier bill payables. Unallocated amounts are held as supplier credit.

```txt
Dr AP_TRADE_PAYABLES             1,150.00
  Cr 699000             1,000.00
  Cr TAX_ON_PURCHASES              150.00
```

If the credit note is unapplied:

```txt
Dr AP_UNAPPLIED_SUPPLIER_PAYMENTS 1,150.00
  Cr 699000             1,000.00
  Cr TAX_ON_PURCHASES              150.00
```

### Posting Code Slots

| Slot name               | Scope                          | Description                                                                                                                                    |
| ----------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `purchase_posting_code` | Header default + line override | Optional posting-code slot used to select the purchase, expense, or asset posting target for AP credit note lines. If omitted, the default is used. |

### Tax treatment

AP\_CREDIT\_NOTE is a tax relevant document. Each line supplies a `tax_rule`; the engine resolves the rule to configured tax components and derives the tax amount from the line net amount.

Recoverable tax creates a Tax Ledger credit. Non-recoverable tax reduces the purchase, expense, or asset cost.

### AP Subledger treatment

`AP_CREDIT_NOTE` creates debit AP Subledger movements for the specified counterparty.

Allocated amounts reduce bill open balances. Unallocated amounts create unapplied supplier credit.

### Inventory treatment

AP\_CREDIT\_NOTE has no direct inventory treatment and creates no Inventory Ledger entries.

If an inventory ledger movement is required, use an inventory document such as `INVENTORY_ADJUSTMENT` to record the quantity or value correction.

### Date treatment

`credit_note_date` must be supplied. `posting_date` may be supplied. If not supplied, `posting_date` defaults to `credit_note_date`.

### Bank Details

`AP_CREDIT_NOTE` does not accept bank details. Supplying `bank_cash_details` is rejected because this document does not post to a Bank / Cash account.

### Dimensions treatment

`AP_CREDIT_NOTE` supports optional dimensions.

## Use cases

### Credit an open supplier bill

```txt
Dr AP_TRADE_PAYABLES             1,150.00
  Cr 699000             1,000.00
  Cr TAX_ON_PURCHASES              150.00

AP Subledger:
  Debit: 1,150.00
  Applied to: AP_BILL BILL-1001
  Effect: reduces bill open amount

Tax Ledger:
  Credit: 150.00
  Effect: reverses recoverable input tax
```

### Credit note tax resolved from tax rule

Request:

```jsonc
{
  "document_type": "AP_CREDIT_NOTE",
  "company_code": "NZ_COMPANY_001",
  "ap_counterparty_code": "SUPP_001",
  "supplier_credit_note_number": "SUPP-CN-1002",
  "document_id": "CN-1002",
  "credit_note_date": "2026-05-10",
  "lines": [
    {
      "line_id": 1,
      "description": "Returned goods",
      "net_amount": "1000.00",
      "tax_rule": "NZ_STANDARD",
      "gross_amount": "1150.00"
    }
  ]
}
```

```txt
Dr AP_UNAPPLIED_SUPPLIER_PAYMENTS 1,150.00
  Cr 699000             1,000.00
  Cr TAX_ON_PURCHASES              150.00
```

### Record unapplied supplier credit

```txt
Dr AP_UNAPPLIED_SUPPLIER_PAYMENTS 1,150.00
  Cr 699000             1,000.00
  Cr TAX_ON_PURCHASES              150.00

AP Subledger:
  Debit: 1,150.00 held as unapplied supplier credit
```

## Considerations

* Credit note allocations are made to AP open items, not bill lines.
* A credit note does not move cash or bank.
* Bill cancellation should be used to withdraw a fully open bill recorded in error.
