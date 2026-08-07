# AP\_BILL\_CANCELLATION

{% hint style="info" %}
`POST /api/finance/process-document/AP_BILL_CANCELLATION`

`POST /api/finance/process-document/AP_BILL_CANCELLATION?preview`

**?preview parameter**

If `preview` is passed then no ledger posting, subledger entries, or persisted records are created. The response shape is identical to a live request.
{% endhint %}

The AP\_BILL\_CANCELLATION endpoint withdraws a posted, fully open AP\_BILL. It reverses the payable, purchase, and tax effects of the original bill.

### Request Object

This request object has the following notable properties:

* A single AP Counterparty per document is supported.
* A single source bill is cancelled per document.
* The source bill must be a posted `AP_BILL` for the supplied Company and AP Counterparty.
* The source bill must be fully open.
* Amounts, posting codes, tax, and dimensions are derived from the original bill snapshot.
* No bill lines or amounts are supplied by the caller.

**Annotated Example:**

```jsonc
{
  // Required. Must be "AP_BILL_CANCELLATION"
  "document_type": "AP_BILL_CANCELLATION",

  // Required. Company code
  "company_code": "NZ_COMPANY_001",

  // Required. Existing AP Counterparty code
  "ap_counterparty_code": "SUPP_001",

  // Optional. Caller document identifier for the cancellation; generated if omitted
  "document_id": "BILL-WD-1001",

  // Optional. Brief caller memo
  "memo": "Withdraw supplier bill",

  // Required. Source bill to cancel
  "source_bill": {
    // Bill number to cancel
    "document_id": "BILL-1001"
  },

  // Required. Date the bill is withdrawn
  "cancellation_date": "2026-05-09",

  // Optional. Defaults to the original bill date
  "posting_date": "2026-04-19"
}
```

### Response Object

The response contains:

* `detailed_document` The validated cancellation and source bill details.
* `ap_subledger_details` AP Subledger reversal details.
* `tax_ledger_details` Tax Ledger reversal details.
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

The engine reverses the original AP\_BILL journal treatment.

```txt
GIVEN AP_BILL BILL-1001

  Dr 699000             1,000.00
  Dr TAX_ON_PURCHASES              150.00
    Cr AP_TRADE_PAYABLES         1,150.00

THEN AP_BILL_CANCELLATION BILL-WD-1001

  Dr AP_TRADE_PAYABLES           1,150.00
    Cr 699000           1,000.00
    Cr TAX_ON_PURCHASES            150.00
```

### Posting Code Slots

No posting code slots are provided. Reversal uses the original bill posting code(s).

### Tax treatment

AP\_BILL\_CANCELLATION reverses tax from the original bill snapshot.

### AP Subledger treatment

`AP_BILL_CANCELLATION` creates a debit AP Subledger movement against `AP_TRADE_PAYABLES` and applies it to the source bill open item.

The source bill open amount is reduced to zero.

### Inventory treatment

AP\_BILL\_CANCELLATION has no direct inventory treatment and creates no Inventory Ledger entries.

If an inventory ledger movement is required, use an inventory document such as `INVENTORY_ADJUSTMENT` to record the quantity or value correction.

### Date treatment

`cancellation_date` must be supplied. `posting_date` may be supplied. If not supplied, `posting_date` defaults to the original bill date.

### Bank Details

`AP_BILL_CANCELLATION` does not accept bank details. Supplying `bank_cash_details` is rejected because this document does not post to a Bank / Cash account.

### Dimensions treatment

The caller does not supply dimensions.

Where original bill lines carried dimensions, those dimensions are inherited onto the corresponding reversal journal lines.

## Use cases

### Withdraw an unpaid bill

```txt
Dr AP_TRADE_PAYABLES           1,150.00
  Cr 699000           1,000.00
  Cr TAX_ON_PURCHASES            150.00

AP Subledger:
  Debit: 1,150.00
  Applied to: AP_BILL BILL-1001
  Effect: withdraws the bill

Tax Ledger:
  Credit: 150.00
  Effect: reverses recoverable input tax
```

## Considerations

* Only fully open posted AP bills can be cancelled.
* Amounts are derived from the original bill snapshot, not recalculated.
* No cash, bank, payment, or unapplied payment movement is created.
