# AP\_PAYMENT\_APPLICATION

{% hint style="info" %}
`POST /api/finance/process-document/AP_PAYMENT_APPLICATION`

`POST /api/finance/process-document/AP_PAYMENT_APPLICATION?preview`

**?preview parameter**

If `preview` is passed then no ledger posting, subledger entries, or persisted records are created. The response shape is identical to a live request.
{% endhint %}

The AP\_PAYMENT\_APPLICATION endpoint applies existing unapplied supplier payments to one or more open AP bill items.

It does not record new cash. New cash paid to a supplier is recorded by `AP_PAYMENT`.

### Request Object

This request object has the following notable properties:

* A single AP Counterparty per document is supported.
* Multiple applications may be supplied.
* Source unapplied payments and target bills must belong to the supplied counterparty.
* Application amounts cannot exceed source unapplied balances or target bill open balances.
* No tax, purchase, expense, bank, or new cash movement is created.

**Annotated Example:**

```jsonc
{
  // Required. Must be "AP_PAYMENT_APPLICATION"
  "document_type": "AP_PAYMENT_APPLICATION",

  // Required. Company code
  "company_code": "NZ_COMPANY_001",

  // Required. Existing AP Counterparty code
  "ap_counterparty_code": "SUPP_001",

  // Optional. Caller document identifier; generated if omitted
  "document_id": "APP-9001",

  // Optional. Brief caller memo
  "memo": "Apply PAY-9001 to BILL-1001",

  // Required. Date of application
  "application_date": "2026-05-08",

  // Optional. Defaults to application_date
  "posting_date": "2026-05-08",

  // Required. At least one application
  "applications": [
    {
      "source_payment": {
        // Payment number for the unapplied supplier payment
        "document_id": "PAY-9001"
      },
      "target_bill": {
        // Bill number to apply the payment to
        "document_id": "BILL-1001"
      },
      "amount": "500.00"
    }
  ]
}
```

### Response Object

The response contains:

* `detailed_document` The validated payment application.
* `ap_subledger_details` AP Subledger application details.
* `posting_details` Company Ledger journal details.

```json
{
  "detailed_document": { /* ... */ },
  "ap_subledger_details": { /* ... */ },
  "posting_details": { /* ... */ }
}
```

For `?preview`, status fields are `EPHEMERAL` instead of `POSTED`.

## Financial / Ledger Treatment Principles

### Journal treatment

The engine debits `AP_TRADE_PAYABLES` and credits `AP_UNAPPLIED_SUPPLIER_PAYMENTS`.

```txt
Dr AP_TRADE_PAYABLES             500.00
  Cr AP_UNAPPLIED_SUPPLIER_PAYMENTS 500.00
```

### Posting Code Slots

No posting code slots are provided.

### Tax treatment

AP\_PAYMENT\_APPLICATION has no direct tax treatment and creates no Tax Ledger entries.

### AP Subledger treatment

The application reduces the open unapplied amount on the source payment item and reduces the open amount on the target bill item.

Payment applications are made to AP open items, not bill lines.

### Inventory treatment

AP\_PAYMENT\_APPLICATION has no inventory implications and creates no Inventory Ledger entries.

### Date treatment

`application_date` must be supplied. `posting_date` may be supplied. If not supplied, `posting_date` defaults to `application_date`.

### Bank Details

`AP_PAYMENT_APPLICATION` does not accept bank details. Supplying `bank_cash_details` is rejected because this document does not post to a Bank / Cash account.

### Dimensions treatment

`AP_PAYMENT_APPLICATION` does not support dimensions. If dimensions are supplied, the transaction is rejected.

## Use cases

### Apply unapplied payment to a bill

```txt
Dr AP_TRADE_PAYABLES             500.00
  Cr AP_UNAPPLIED_SUPPLIER_PAYMENTS 500.00

AP Subledger:
  Debit: 500.00 against AP_TRADE_PAYABLES
  Credit: 500.00 against AP_UNAPPLIED_SUPPLIER_PAYMENTS
  Effect: consumes unapplied payment and reduces bill open amount
```

### Apply one payment to multiple bills

```txt
Dr AP_TRADE_PAYABLES           1,000.00
  Cr AP_UNAPPLIED_SUPPLIER_PAYMENTS 1,000.00

AP Subledger:
  Source payment unapplied balance reduced by 1,000.00
  Target bill balances reduced by their applied amounts
```

## Considerations

* The source payment and target bill must belong to the same Company and AP Counterparty.
* Application amounts cannot exceed available balances.
* No cash, bank, purchase, expense, or tax movement is created.
