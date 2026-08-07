# AR\_INVOICE\_CANCELLATION

{% hint style="info" %}
`POST /api/finance/process-document/AR_INVOICE_CANCELLATION`

`POST /api/finance/process-document/AR_INVOICE_CANCELLATION?preview`

**?preview parameter**

If `preview` is passed then no ledger posting, subledger entries, or persisted records are created. The response shape is identical to a live request.
{% endhint %}

The AR\_INVOICE\_CANCELLATION endpoint withdraws a posted, fully open AR\_INVOICE. It reverses the receivable, revenue, and output tax effects of the original invoice.

### Request Object

This request object has the following notable properties:

* A single AR Counterparty per document is supported.
* A single source invoice is cancelled per document.
* The source invoice must be a posted `AR_INVOICE` for the supplied Company and AR Counterparty.
* The source invoice must be fully open.
* Revenue, tax, dimensions, and AR amounts are derived from the original invoice journal snapshot.
* No invoice lines or amounts are supplied by the caller.

**Annotated Example:**

```jsonc
{
  // Required. Must be "AR_INVOICE_CANCELLATION"
  "document_type": "AR_INVOICE_CANCELLATION",

  // Required. Company code
  "company_code": "NZ_COMPANY_001",

  // Required. Existing AR Counterparty code
  "ar_counterparty_code": "CUST_001",

  // Optional. Caller document identifier for the cancellation; generated if omitted
  "document_id": "INV-WD-1001",

  // Optional. Brief caller memo
  "memo": "Withdraw INV-1001",

  // Required. Source invoice to cancel
  "source_invoice": {
    // Invoice number to cancel
    "document_id": "INV-1001"
  },

  // Required. Date the invoice is withdrawn
  "cancellation_date": "2026-05-09",

  // Optional. Defaults to the original invoice date
  "posting_date": "2026-04-19"
}
```

### Response Object

The response contains:

* `detailed_document` The validated cancellation and source invoice details.
* `ar_subledger_details` AR Subledger reversal details.
* `tax_ledger_details` Tax Ledger reversal details.
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

The engine reverses the original AR\_INVOICE journal treatment.

```txt
GIVEN AR_INVOICE INV-1001

  Dr Accounts Receivable            1,150.00
    Cr Revenue                      1,000.00
    Cr Tax Output                     150.00

THEN AR_INVOICE_CANCELLATION INV-WD-1001

  Dr Revenue                        1,000.00
  Dr Tax Output                       150.00
    Cr Accounts Receivable          1,150.00

BY WAY OF:

  Dr original revenue posting code(s)
  Dr TAX_ON_SALES
    Cr AR_TRADE_RECEIVABLES
```

### Posting Code Slots

No posting code slots are provided. Revenue reversal uses the original invoice revenue posting code(s).

### Tax treatment

AR\_INVOICE\_CANCELLATION reverses tax previously classified as `TAX_ON_SALES`.

Tax reversal details are derived from the original invoice snapshot. One Tax Ledger debit is created per original positive tax component.

### AR Subledger treatment

`AR_INVOICE_CANCELLATION` creates a credit AR Subledger movement against `AR_TRADE_RECEIVABLES` and applies it to the source invoice open item.

The source invoice open amount is reduced to zero.

### Inventory treatment

AR\_INVOICE\_CANCELLATION has no direct inventory treatment and creates no Inventory Ledger entries.

If an inventory ledger movement is required, use an inventory document such as `INVENTORY_ADJUSTMENT` to record the quantity or value correction.

### Date treatment

`cancellation_date` must be supplied. `posting_date` may be supplied. If not supplied, `posting_date` defaults to the original invoice date.

### Bank Details

`AR_INVOICE_CANCELLATION` does not accept bank details. Supplying `bank_cash_details` is rejected because this document does not post to a Bank / Cash account.

### Dimensions treatment

The caller does not supply dimensions.

Where original invoice revenue lines carried dimensions, those dimensions are inherited onto the corresponding reversal journal lines.

## Use cases

### Withdraw an unpaid invoice

Request:

```jsonc
{
  "document_type": "AR_INVOICE_CANCELLATION",
  "company_code": "NZ_COMPANY_001",
  "ar_counterparty_code": "CUST_001",
  "document_id": "INV-WD-1001",
  "memo": "Withdraw invoice issued in error",
  "source_invoice": {
    "document_id": "INV-1001"
  },
  "cancellation_date": "2026-05-09"
}
```

```txt
Ledger:

  Dr 400000                    1,000.00
  Dr TAX_ON_SALES                   150.00
    Cr AR_TRADE_RECEIVABLES       1,150.00

AR Subledger:

  Credit: 1,150.00
  Applied to: AR_INVOICE INV-1001
  Effect: withdraws the invoice

Tax Ledger:

  Debit: 150.00
  Tax movement: TAX_ON_SALES
  Effect: reverses output tax
```

## Considerations

* Only fully open posted AR invoices can be cancelled.
* Amounts are derived from the original invoice snapshot, not recalculated.
* No cash, bank, receipt, or unapplied cash movement is created.
