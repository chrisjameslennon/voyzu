# AR\_REFUND

{% hint style="info" %}
`POST /api/finance/process-document/AR_REFUND`

`POST /api/finance/process-document/AR_REFUND?preview`

**?preview parameter**

If `preview` is passed then no ledger posting, subledger entries, or persisted records are created. The response shape is identical to a live request.
{% endhint %}

The AR\_REFUND endpoint pays money back to a customer from the customer's available unapplied AR balance.

### Request Object

This request object has the following notable properties:

* A single AR Counterparty per document is supported.
* Refunds are sourced from the customer's available unapplied AR balance.
* A single Bank / Cash account is supported.
* If `bank_cash_account_code` is omitted, the configured document default Bank / Cash account is used.
* If `bank_cash_account_code` is supplied, it overrides the document default and must identify a valid active Bank / Cash account for the company.
* Refund amounts cannot exceed available unapplied balances.
* No tax, revenue, or new credit movement is created.

**Annotated Example:**

```jsonc
{
  // Required. Must be "AR_REFUND"
  "document_type": "AR_REFUND",

  // Required. Company code
  "company_code": "NZ_COMPANY_001",

  // Required. Existing AR Counterparty code
  "ar_counterparty_code": "CUST_001",

  // Optional. Caller document identifier; generated if omitted
  "document_id": "REF-1001",

  // Optional. Brief caller memo
  "memo": "Refund customer credit",

  // Required. Date of refund
  "refund_date": "2026-05-12",

  // Optional. Defaults to refund_date
  "posting_date": "2026-05-12",

  // Required. Total amount refunded
  "refund_amount": "500.00",

  // Optional. Overrides the document default Bank / Cash account.
  // Must identify a valid active Bank / Cash account for the company.
  "bank_cash_account_code": "BANK_OPERATING",

  // Optional. Bank / Cash transaction details
  "bank_cash_details": {
    "tx_id": "TX-123456789",
    "tx_code": "DR",
    "tx_ref": "BANK-REF-001",
    "tx_details": "Dummy customer refund transaction details",
    "payment_ref": "REF-1001"
  }
}
```

### Response Object

The response contains:

* `detailed_document` The validated refund.
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

The engine debits unapplied customer balance and credits the selected Bank / Cash account.

```txt
Dr AR_UNAPPLIED_CREDIT          500.00
  Cr BANK_OPERATING             500.00
```

### Bank / Cash account selection

| Slot name                  | Scope  | Description                                                                                                                      |
| -------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `bank_cash_account_code`   | Header | Optional Bank / Cash account slot used to select the refund bank/cash posting target. If omitted, the configured default is used. |

### Tax treatment

AR\_REFUND has no direct tax treatment and creates no Tax Ledger entries.

### AR Subledger treatment

`AR_REFUND` reduces the customer's available unapplied AR balance.

### Inventory treatment

AR\_REFUND has no inventory implications and creates no Inventory Ledger entries.

### Date treatment

`refund_date` must be supplied. `posting_date` may be supplied. If not supplied, `posting_date` defaults to `refund_date`.

### Bank Details

AR\_REFUND supports Bank / Cash details.

If `bank_cash_account_code` is omitted, the configured AR\_REFUND Bank / Cash account default is used. If supplied, `bank_cash_account_code` overrides the default and must identify a valid active Bank / Cash account for the company. Voyzu resolves the selected Bank / Cash account to its linked GL account.

If `bank_cash_details` is supplied, it records transaction/reference details for the selected Bank / Cash account.

### Dimensions treatment

`AR_REFUND` does not support dimensions. If dimensions are supplied, the transaction is rejected.

## Use cases

### Refund available unapplied customer balance

```txt
Dr AR_UNAPPLIED_CREDIT          500.00
  Cr BANK_OPERATING             500.00

AR Subledger:
  Debit: 500.00 against unapplied customer balance
  Effect: pays money back to the customer
```

## Considerations

* Refunds are made from unapplied customer balance, not invoice lines.
* Refund amounts cannot exceed available unapplied balance.
* No revenue or tax is created or reversed by a refund.
