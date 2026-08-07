# AR\_OPENING\_BALANCE

{% hint style="info" %}
`POST /api/finance/process-document/AR_OPENING_BALANCE`

`POST /api/finance/process-document/AR_OPENING_BALANCE?preview`

**?preview parameter**

If `preview` is passed then no ledger posting, subledger entries, or persisted records are created. The response shape is identical to a live request.
{% endhint %}

The AR\_OPENING\_BALANCE endpoint seeds opening customer receivable balances during migration or system setup.

### Request Object

This request object has the following notable properties:

* A single AR Counterparty per document is supported.
* Multiple opening AR items may be supplied.
* Opening balances create AR open items.
* A single opening balance equity posting code is supported.
* No tax, revenue, bank, or cash movement is created.

**Annotated Example:**

```jsonc
{
  // Required. Must be "AR_OPENING_BALANCE"
  "document_type": "AR_OPENING_BALANCE",

  // Required. Company code
  "company_code": "NZ_COMPANY_001",

  // Required unless ar_counterparty is supplied
  "ar_counterparty_code": "CUST_001",

  // Optional. Caller document identifier; generated if omitted
  "document_id": "AR-OB-1001",

  // Optional. Brief caller memo
  "memo": "Opening AR migration",

  // Required. Opening balance date
  "opening_balance_date": "2026-04-01",

  // Optional. Defaults to opening_balance_date
  "posting_date": "2026-04-01",

  // Optional. Defaults to the slot default
  "opening_balance_equity_posting_code": "OPENING_BALANCE_EQUITY",

  // Required. Opening AR items
  "items": [
    {
      "line_id": 1,
      "external_reference": "LEGACY-INV-1001",
      "description": "Legacy invoice INV-1001",
      "original_invoice_date": "2026-03-20",
      "due_date": "2026-04-20",
      "amount": "3000.00"
    }
  ]
}
```

### Response Object

The response contains:

* `detailed_document` The validated opening balance document.
* `ar_subledger_details` AR Subledger opening balance details.
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

The engine debits AR trade receivables and credits the opening balance equity posting code.

```txt
Dr AR_TRADE_RECEIVABLES         3,000.00
  Cr OPENING_BALANCE_EQUITY     3,000.00
```

### Posting Code Slots

| Slot name                                | Scope  | Description                                                                                                               |
| ---------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------- |
| `opening_balance_equity_posting_code`    | Header | Optional posting-code slot used to select the opening balance equity posting target. If omitted, the default is used. |

### Tax treatment

AR\_OPENING\_BALANCE has no direct tax treatment and creates no Tax Ledger entries.

### AR Subledger treatment

`AR_OPENING_BALANCE` creates debit AR Subledger movements for the specified counterparty.

Each item creates an opening AR open item that can later be settled by normal AR documents.

### Inventory treatment

AR\_OPENING\_BALANCE has no direct inventory treatment and creates no Inventory Ledger entries.

If an inventory ledger opening balance is required, use an inventory document such as `INVENTORY_RECEIPT` or `INVENTORY_ADJUSTMENT`.

### Date treatment

`opening_balance_date` must be supplied. `posting_date` may be supplied. If not supplied, `posting_date` defaults to `opening_balance_date`.

### Bank Details

`AR_OPENING_BALANCE` does not accept bank details. Supplying `bank_cash_details` is rejected because this document does not post to a Bank / Cash account.

### Dimensions treatment

`AR_OPENING_BALANCE` does not support dimensions. If dimensions are supplied, the transaction is rejected.

## Use cases

### Seed opening customer receivables

```txt
Dr AR_TRADE_RECEIVABLES         3,000.00
  Cr OPENING_BALANCE_EQUITY     3,000.00

AR Subledger:
  Debit: 3,000.00
  Counterparty: CUST_001
  Effect: creates opening AR open item
```

## Considerations

* Opening balances are for migration or system setup.
* Opening balances do not create revenue or tax.
* Opening AR items can be settled by normal AR documents after migration.
