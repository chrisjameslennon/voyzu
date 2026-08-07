# AR\_WRITE\_OFF

{% hint style="info" %}
`POST /api/finance/process-document/AR_WRITE_OFF`

`POST /api/finance/process-document/AR_WRITE_OFF?preview`

**?preview parameter**

If `preview` is passed then no ledger posting, subledger entries, or persisted records are created. The response shape is identical to a live request.
{% endhint %}

The AR\_WRITE\_OFF endpoint writes off all or part of an open customer invoice balance to a write-off expense account.

### Request Object

This request object has the following notable properties:

* A single AR Counterparty per document is supported.
* One or more open AR invoice items may be written off.
* Write-off amounts cannot exceed invoice open balances.
* A single write-off expense posting code is supported.
* No tax, revenue, bank, or cash movement is created.

**Annotated Example:**

```jsonc
{
  // Required. Must be "AR_WRITE_OFF"
  "document_type": "AR_WRITE_OFF",

  // Required. Company code
  "company_code": "NZ_COMPANY_001",

  // Required. Existing AR Counterparty code
  "ar_counterparty_code": "CUST_001",

  // Optional. Caller document identifier; generated if omitted
  "document_id": "WO-1001",

  // Optional. Brief caller memo
  "memo": "Small balance write-off",

  // Required. Date of write-off
  "write_off_date": "2026-05-15",

  // Optional. Defaults to write_off_date
  "posting_date": "2026-05-15",

  // Optional. Defaults to the slot default
  "write_off_expense_posting_code": "610000",

  // Required. Open invoice items to write off
  "applications": [
    {
      "target_invoice": {
        // Invoice number to write off
        "document_id": "INV-1001"
      },
      "amount": "250.00"
    }
  ]
}
```

### Response Object

The response contains:

* `detailed_document` The validated write-off and target invoice applications.
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

The engine debits the write-off expense posting code and credits AR trade receivables.

```txt
Dr 610000             250.00
  Cr AR_TRADE_RECEIVABLES       250.00
```

### Posting Code Slots

| Slot name                           | Scope  | Description                                                                                                       |
| ----------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------- |
| `write_off_expense_posting_code`    | Header | Optional posting-code slot used to select the write-off expense posting target. If omitted, the default is used. |

### Tax treatment

AR\_WRITE\_OFF has no direct tax treatment and creates no Tax Ledger entries.

### AR Subledger treatment

`AR_WRITE_OFF` creates credit AR Subledger movements against the target invoice open items.

Write-off amounts reduce invoice open balances.

### Inventory treatment

AR\_WRITE\_OFF has no inventory implications and creates no Inventory Ledger entries.

### Date treatment

`write_off_date` must be supplied. `posting_date` may be supplied. If not supplied, `posting_date` defaults to `write_off_date`.

### Bank Details

`AR_WRITE_OFF` does not accept bank details. Supplying `bank_cash_details` is rejected because this document does not post to a Bank / Cash account.

### Dimensions treatment

`AR_WRITE_OFF` does not support dimensions. If dimensions are supplied, the transaction is rejected.

## Use cases

### Write off part of an invoice balance

```txt
Dr 610000             250.00
  Cr AR_TRADE_RECEIVABLES       250.00

AR Subledger:
  Credit: 250.00
  Applied to: AR_INVOICE INV-1001
  Effect: reduces invoice open amount
```

## Considerations

* Write-offs are made to AR open items, not invoice lines.
* Write-off amounts cannot exceed invoice open balances.
* A write-off does not reverse revenue or tax.
