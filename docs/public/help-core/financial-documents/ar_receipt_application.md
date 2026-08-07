# AR\_RECEIPT\_APPLICATION

{% hint style="info" %}
`POST /api/finance/process-document/AR_RECEIPT_APPLICATION`

`POST /api/finance/process-document/AR_RECEIPT_APPLICATION?preview`

**?preview parameter**

If `preview` is passed then no ledger posting, subledger entries, or persisted records are created. The response shape is identical to a live request.
{% endhint %}

The AR\_RECEIPT\_APPLICATION endpoint applies existing unapplied customer cash to one or more open AR invoice items.

It does not record new cash. New cash is recorded by `AR_RECEIPT`.

### Request Object

This request object has the following notable properties:

* A single AR Counterparty per document is supported.
* Multiple applications may be supplied.
* Source unapplied receipts and target invoices must belong to the supplied counterparty.
* Application amounts cannot exceed source unapplied balances or target invoice open balances.
* No tax, revenue, bank, or new cash movement is created.

**Annotated Example:**

```jsonc
{
  // Required. Must be "AR_RECEIPT_APPLICATION"
  "document_type": "AR_RECEIPT_APPLICATION",

  // Required. Company code
  "company_code": "NZ_COMPANY_001",

  // Required. Existing AR Counterparty code
  "ar_counterparty_code": "CUST_001",

  // Optional. Caller document identifier; generated if omitted
  "document_id": "APP-9001",

  // Optional. Brief caller memo
  "memo": "Apply PAY-9001 to INV-1001",

  // Required. Date of application
  "application_date": "2026-05-08",

  // Optional. Defaults to application_date
  "posting_date": "2026-05-08",

  // Required. At least one application
  "applications": [
    {
      "source_receipt": {
        // AR_RECEIPT document_id for the unapplied receipt
        "document_id": "PAY-9001"
      },
      "target_invoice": {
        // Invoice number to apply the receipt to
        "document_id": "INV-1001"
      },
      "amount": "500.00"
    }
  ]
}
```

### Response Object

The response contains:

* `detailed_document` The validated receipt application.
* `ar_subledger_details` AR Subledger application details.
* `posting_details` Company Ledger journal details.

```json
{
  "detailed_document": { /* ... */ },
  "ar_subledger_details": { /* ... */ },
  "posting_details": { /* ... */ }
}
```

For `?preview`, status fields are `EPHEMERAL` instead of `POSTED`.

## Financial / Ledger Treatment Principles

### Journal treatment

The engine debits `AR_UNAPPLIED_CASH` and credits `AR_TRADE_RECEIVABLES`.

```txt
Dr AR_UNAPPLIED_CASH            500.00
  Cr AR_TRADE_RECEIVABLES       500.00
```

### Posting Code Slots

No posting code slots are provided.

### Tax treatment

AR\_RECEIPT\_APPLICATION has no direct tax treatment and creates no Tax Ledger entries.

### AR Subledger treatment

The application reduces the open unapplied amount on the source receipt item and reduces the open amount on the target invoice item.

Receipt applications are made to AR open items, not invoice lines.

### Inventory treatment

AR\_RECEIPT\_APPLICATION has no inventory implications and creates no Inventory Ledger entries.

### Date treatment

`application_date` must be supplied. `posting_date` may be supplied. If not supplied, `posting_date` defaults to `application_date`.

### Bank Details

`AR_RECEIPT_APPLICATION` does not accept bank details. Supplying `bank_cash_details` is rejected because this document does not post to a Bank / Cash account.

### Dimensions treatment

`AR_RECEIPT_APPLICATION` does not support dimensions. If dimensions are supplied, the transaction is rejected.

## Use cases

### Apply unapplied cash to an invoice

```txt
Dr AR_UNAPPLIED_CASH            500.00
  Cr AR_TRADE_RECEIVABLES       500.00

AR Subledger:
  Debit: 500.00 against AR_UNAPPLIED_CASH
  Credit: 500.00 against AR_TRADE_RECEIVABLES
  Effect: consumes unapplied cash and reduces invoice open amount
```

### Apply one receipt to multiple invoices

```txt
Dr AR_UNAPPLIED_CASH          1,000.00
  Cr AR_TRADE_RECEIVABLES     1,000.00

AR Subledger:
  Source receipt unapplied balance reduced by 1,000.00
  Target invoice balances reduced by their applied amounts
```

## Considerations

* The source receipt and target invoice must belong to the same Company and AR Counterparty.
* Application amounts cannot exceed available balances.
* No cash, bank, revenue, or tax movement is created.
