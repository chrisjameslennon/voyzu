# AR\_RECEIPT

{% hint style="info" %}
`POST /api/finance/process-document/AR_RECEIPT`

`POST /api/finance/process-document/AR_RECEIPT?preview`

**?preview parameter**

If `preview` is passed then no ledger posting, subledger entries, or persisted records are created. The response shape is identical to a live request.
{% endhint %}

The AR\_RECEIPT endpoint records a customer payment and posts it to the Company Ledger and Accounts Receivable Subledger.

### Request Object

This request object has the following notable properties:

* A single AR Counterparty per document is supported.
* Multiple allocations may be supplied, provided all target invoices belong to the same counterparty.
* A single Bank / Cash account is supported.
* If `bank_cash_account_code` is omitted, the configured document default Bank / Cash account is used.
* If `bank_cash_account_code` is supplied, it overrides the document default and must identify a valid active Bank / Cash account for the company.
* If no allocations are supplied, the receipt is held as unapplied cash.
* If `receipt_amount` exceeds allocations, the remainder is held as unapplied cash.

**Annotated Example:**

```jsonc
{
  // Required. Must be "AR_RECEIPT"
  "document_type": "AR_RECEIPT",

  // Required. Company code
  "company_code": "NZ_COMPANY_001",

  // Required unless ar_counterparty is supplied
  "ar_counterparty_code": "CUST_001",

  // Optional. Creates or resolves an AR Counterparty
  /*
  "ar_counterparty": {
    "code": "CUST_001",
    "name": "Example NZ Customer",
    "status": "ACTIVE",
    "country_code": "NZ",
    "state_or_province_code": null
  }
  */

  // Optional. Caller document identifier; generated if omitted
  "document_id": "PAY-9001",

  // Optional. Brief caller memo
  "memo": "Bank transaction 348923",

  // Required. Date of payment
  "payment_date": "2026-05-07",

  // Optional. Defaults to payment_date
  "posting_date": "2026-05-07",

  // Optional. If omitted, sum of allocation amounts is used
  "receipt_amount": "1150.00",

  // Optional. Overrides the document default Bank / Cash account.
  // Must identify a valid active Bank / Cash account for the company.
  "bank_cash_account_code": "BANK_OPERATING",

  // Optional. Bank / Cash transaction details
  "bank_cash_details": {
    "tx_id": "TX-123456789",
    "tx_code": "CR",
    "tx_ref": "BANK-REF-001",
    "tx_details": "Dummy bank transaction details",
    "payment_ref": "PAY-0001"
  },

  // Optional. Invoice allocations
  "allocations": [
    {
      // Invoice number to allocate this receipt to
      "document_id": "INV-1001",
      "amount": "1150.00"
    }
  ]
}
```

### Response Object

The response contains:

* `detailed_document` The validated receipt with resolved allocations.
* `ar_subledger_details` AR Subledger details.
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

The engine debits the selected Bank / Cash account and credits AR control accounts.

```txt
Dr BANK_OPERATING               1,150.00
  Cr AR_TRADE_RECEIVABLES       1,150.00
```

If part of the receipt is unapplied:

```txt
Dr BANK_OPERATING               1,200.00
  Cr AR_TRADE_RECEIVABLES       1,150.00
  Cr AR_UNAPPLIED_CASH             50.00
```

### Bank / Cash account selection

| Slot name                  | Scope  | Description                                                                                                                       |
| -------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `bank_cash_account_code`   | Header | Optional Bank / Cash account slot used to select the receipt bank/cash posting target. If omitted, the configured default is used. |

### Tax treatment

AR\_RECEIPT has no direct tax treatment and creates no Tax Ledger entries.

### AR Subledger treatment

`AR_RECEIPT` creates credit AR Subledger movements for the specified counterparty.

Allocated amounts reduce invoice open balances. Unallocated amounts create unapplied customer credit.

### Inventory treatment

AR\_RECEIPT has no inventory implications and creates no Inventory Ledger entries.

### Date treatment

`payment_date` must be supplied. `posting_date` may be supplied. If not supplied, `posting_date` defaults to `payment_date`.

### Bank Details

AR\_RECEIPT supports Bank / Cash details.

If `bank_cash_account_code` is omitted, the configured AR\_RECEIPT Bank / Cash account default is used. If supplied, `bank_cash_account_code` overrides the default and must identify a valid active Bank / Cash account for the company. Voyzu resolves the selected Bank / Cash account to its linked GL account.

If `bank_cash_details` is supplied, it records transaction/reference details for the selected Bank / Cash account.

### Dimensions treatment

`AR_RECEIPT` does not support dimensions. If dimensions are supplied, the transaction is rejected.

## Use cases

### Fully pay an invoice

```txt
Dr BANK_OPERATING               1,150.00
  Cr AR_TRADE_RECEIVABLES       1,150.00

AR Subledger:
  Credit: 1,150.00
  Applied to: AR_INVOICE INV-1001
  Effect: invoice settled
```

### Overpay an invoice

```txt
Dr BANK_OPERATING               1,200.00
  Cr AR_TRADE_RECEIVABLES       1,150.00
  Cr AR_UNAPPLIED_CASH             50.00

AR Subledger:
  Credit: 1,150.00 applied to invoice
  Credit: 50.00 held as unapplied cash
```

## Considerations

* Receipt allocations are made to AR open items, not invoice lines.
* No revenue or tax is created by a receipt.
