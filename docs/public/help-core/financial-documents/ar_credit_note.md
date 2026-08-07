# AR\_CREDIT\_NOTE

{% hint style="info" %}
`POST /api/finance/process-document/AR_CREDIT_NOTE`

`POST /api/finance/process-document/AR_CREDIT_NOTE?preview`

**?preview parameter**

If `preview` is passed then no ledger posting, subledger entries, or persisted records are created. The response shape is identical to a live request.
{% endhint %}

The AR\_CREDIT\_NOTE endpoint receives a customer credit note and posts it to the Company Ledger, the Accounts Receivable Subledger, and if applicable the Tax Ledger. A credit note may be applied to one or more open AR invoice items. Any unapplied amount is held as customer credit.

### Request Object

This request object has the following notable properties:

* A single AR Counterparty per document is supported.
* Multiple credit note lines per document are supported.
* Optional allocations may be supplied, provided all target invoices belong to the same counterparty.
* If no allocations are supplied, the credit note is held as unapplied customer credit.
* The AR receivable posting code is fixed by the engine and cannot be overridden by the caller.
* Caller-supplied amounts are limited to `quantity` and `net_unit_price` or `net_line_total`. All other amounts are derived by the engine.

**Annotated Example:**

```jsonc
{
  // Required. Must be "AR_CREDIT_NOTE"
  "document_type": "AR_CREDIT_NOTE",

  // Required. Company code
  "company_code": "NZ_COMPANY_001",

  // Required unless ar_counterparty is supplied
  "ar_counterparty_code": "CUST_001",

  // Optional. Caller document identifier; generated if omitted
  "document_id": "CN-1001",

  // Optional. Brief caller memo
  "memo": "Credit for returned goods",

  // Required. Date of credit note issue
  "credit_note_date": "2026-05-10",

  // Optional. Defaults to credit_note_date
  "posting_date": "2026-05-10",

  // Optional. Applies to all lines unless overridden
  "revenue_posting_code": "400000",

  // Required. Credit note lines
  "lines": [
    {
      "line_id": 1,
      "description": "Returned goods",
      "quantity": 1,
      "net_unit_price": "1000.00",
      "tax_rule": "NZ_STANDARD"
    }
  ],

  // Optional. Invoice allocations
  "allocations": [
    {
      // Invoice number to apply this credit note to
      "document_id": "INV-1001",
      "amount": "1150.00"
    }
  ]
}
```

### Response Object

The response contains:

* `detailed_document` The calculated credit note and resolved allocations.
* `ar_subledger_details` AR Subledger details.
* `tax_ledger_details` Tax Ledger details.
* `posting_details` Company Ledger journal details.

```json
{
  "detailed_document": { /* ... */ },
  "ar_subledger_details": { /* ... */ },
  "tax_ledger_details": { /* ... */ },
  "posting_details": { /* ... */ }
}
```

For `?preview`, status fields are `EPHEMERAL` instead of `POSTED`.

## Financial / Ledger Treatment Principles

### Journal treatment

The engine debits revenue and tax on sales, and credits AR control accounts. Allocated amounts reduce invoice receivables. Unallocated amounts are held as customer credit.

```txt
Dr 400000                    1,000.00
Dr TAX_ON_SALES                   150.00
  Cr AR_TRADE_RECEIVABLES       1,150.00
```

If part of the credit note is unapplied:

```txt
Dr 400000                    1,000.00
Dr TAX_ON_SALES                   150.00
  Cr AR_TRADE_RECEIVABLES       1,000.00
  Cr AR_UNAPPLIED_CREDIT          150.00
```

### Posting Code Slots

| Slot name              | Scope                          | Description                                                                                                                   |
| ---------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `revenue_posting_code` | Header default + line override | Optional posting-code slot used to select the revenue posting target for AR credit note lines. If omitted, the default is used. |

### Tax treatment

AR\_CREDIT\_NOTE is a tax relevant document. It reverses tax previously classified as `TAX_ON_SALES` and creates one Tax Ledger debit per resolved tax component.

### AR Subledger treatment

`AR_CREDIT_NOTE` creates credit AR Subledger movements for the specified counterparty.

Allocated amounts reduce invoice open balances. Unallocated amounts create unapplied customer credit.

### Inventory treatment

AR\_CREDIT\_NOTE has no direct inventory treatment and creates no Inventory Ledger entries.

If an inventory ledger movement is required, use an inventory document such as `INVENTORY_ADJUSTMENT` to record the quantity or value correction.

### Date treatment

`credit_note_date` must be supplied. `posting_date` may be supplied. If not supplied, `posting_date` defaults to `credit_note_date`.

### Bank Details

`AR_CREDIT_NOTE` does not accept bank details. Supplying `bank_cash_details` is rejected because this document does not post to a Bank / Cash account.

### Dimensions treatment

`AR_CREDIT_NOTE` supports optional dimensions.

## Use cases

### Credit an open invoice

```txt
Dr 400000                    1,000.00
Dr TAX_ON_SALES                   150.00
  Cr AR_TRADE_RECEIVABLES       1,150.00

AR Subledger:
  Credit: 1,150.00
  Applied to: AR_INVOICE INV-1001
  Effect: reduces invoice open amount

Tax Ledger:
  Debit: 150.00
  Tax movement: TAX_ON_SALES
  Effect: reverses output tax
```

### Issue unapplied customer credit

```txt
Dr 400000                    1,000.00
Dr TAX_ON_SALES                   150.00
  Cr AR_UNAPPLIED_CREDIT        1,150.00

AR Subledger:
  Credit: 1,150.00 held as unapplied customer credit
```

## Considerations

* Credit note allocations are made to AR open items, not invoice lines.
* A credit note does not move cash or bank.
* Invoice cancellation should be used to withdraw a fully open invoice issued in error.
