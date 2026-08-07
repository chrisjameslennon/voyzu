# AP\_PAYMENT

{% hint style="info" %}
`POST /api/finance/process-document/AP_PAYMENT`

`POST /api/finance/process-document/AP_PAYMENT?preview`

**?preview parameter**

If `preview` is passed then no ledger posting, subledger entries, or persisted records are created. The response shape is identical to a live request.
{% endhint %}

The AP\_PAYMENT endpoint records a supplier payment and posts it to the Company Ledger and Accounts Payable Subledger.

### Request Object

This request object has the following notable properties:

* A single AP Counterparty per document is supported.
* Multiple allocations may be supplied, provided all target bills belong to the same counterparty.
* A single Bank / Cash account is supported.
* If `bank_cash_account_code` is omitted, the configured document default Bank / Cash account is used.
* If `bank_cash_account_code` is supplied, it overrides the document default and must identify a valid active Bank / Cash account for the company.
* If no allocations are supplied, the payment is held as unapplied supplier payment.
* If `payment_amount` exceeds allocations, the remainder is held as unapplied supplier payment.

**Annotated Example:**

```jsonc
{
  // Required. Must be "AP_PAYMENT"
  "document_type": "AP_PAYMENT",

  // Required. Company code
  "company_code": "NZ_COMPANY_001",

  // Required unless ap_counterparty is supplied
  "ap_counterparty_code": "SUPP_001",

  // Optional. Caller document identifier; generated if omitted
  "document_id": "PAY-9001",

  // Optional. Brief caller memo
  "memo": "Bank transaction 348923",

  // Required. Date of payment
  "payment_date": "2026-05-07",

  // Optional. Defaults to payment_date
  "posting_date": "2026-05-07",

  // Optional. If omitted, sum of allocation amounts is used
  "payment_amount": "1150.00",

  // Optional. Overrides the document default Bank / Cash account.
  // Must identify a valid active Bank / Cash account for the company.
  "bank_cash_account_code": "BANK_OPERATING",

  // Optional. Bank / Cash transaction details
  "bank_cash_details": {
    "tx_id": "TX-123456789",
    "tx_code": "DR",
    "tx_ref": "BANK-REF-001",
    "tx_details": "Dummy supplier payment transaction details",
    "payment_ref": "PAY-0001"
  },

  // Optional. Bill allocations
  "allocations": [
    {
      // Bill number to allocate this payment to
      "document_id": "BILL-1001",
      "amount": "1150.00"
    }
  ]
}
```

### Response Object

The response contains:

* `detailed_document` The validated payment with resolved allocations.
* `ap_subledger_details` AP Subledger details.
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

The engine debits AP control accounts and credits the selected Bank / Cash account.

```txt
Dr AP_TRADE_PAYABLES           1,150.00
  Cr BANK_OPERATING            1,150.00
```

If part of the payment is unapplied:

```txt
Dr AP_TRADE_PAYABLES           1,150.00
Dr AP_UNAPPLIED_SUPPLIER_PAYMENTS 50.00
  Cr BANK_OPERATING            1,200.00
```

### Bank / Cash account selection

| Slot name                  | Scope  | Description                                                                                                                       |
| -------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `bank_cash_account_code`   | Header | Optional Bank / Cash account slot used to select the payment bank/cash posting target. If omitted, the configured default is used. |

### Tax treatment

AP\_PAYMENT has no direct tax treatment and creates no Tax Ledger entries.

### AP Subledger treatment

`AP_PAYMENT` creates debit AP Subledger movements for the specified counterparty.

Allocated amounts reduce bill open balances. Unallocated amounts create unapplied supplier payment.

### Inventory treatment

AP\_PAYMENT has no inventory implications and creates no Inventory Ledger entries.

### Date treatment

`payment_date` must be supplied. `posting_date` may be supplied. If not supplied, `posting_date` defaults to `payment_date`.

### Bank Details

AP\_PAYMENT supports Bank / Cash details.

If `bank_cash_account_code` is omitted, the configured AP\_PAYMENT Bank / Cash account default is used. If supplied, `bank_cash_account_code` overrides the default and must identify a valid active Bank / Cash account for the company. Voyzu resolves the selected Bank / Cash account to its linked GL account.

If `bank_cash_details` is supplied, it records transaction/reference details for the selected Bank / Cash account.

### Dimensions treatment

`AP_PAYMENT` does not support dimensions. If dimensions are supplied, the transaction is rejected.

## Use cases

### Fully pay a bill

```txt
Dr AP_TRADE_PAYABLES           1,150.00
  Cr BANK_OPERATING            1,150.00

AP Subledger:
  Debit: 1,150.00
  Applied to: AP_BILL BILL-1001
  Effect: bill settled
```

### Overpay a bill

```txt
Dr AP_TRADE_PAYABLES           1,150.00
Dr AP_UNAPPLIED_SUPPLIER_PAYMENTS 50.00
  Cr BANK_OPERATING            1,200.00

AP Subledger:
  Debit: 1,150.00 applied to bill
  Debit: 50.00 held as unapplied supplier payment
```

## Considerations

* Payment allocations are made to AP open items, not bill lines.
* No purchase, expense, or tax is created by a payment.
