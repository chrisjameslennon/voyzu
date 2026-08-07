# AP\_WRITE\_OFF

{% hint style="info" %}
`POST /api/finance/process-document/AP_WRITE_OFF`

`POST /api/finance/process-document/AP_WRITE_OFF?preview`

**?preview parameter**

If `preview` is passed then no ledger posting, subledger entries, or persisted records are created. The response shape is identical to a live request.
{% endhint %}

The AP\_WRITE\_OFF endpoint writes off all or part of an open supplier bill balance to a write-off income account.

### Request Object

This request object has the following notable properties:

* A single AP Counterparty per document is supported.
* One or more open AP bill items may be written off.
* Write-off amounts cannot exceed bill open balances.
* A single write-off income posting code is supported.
* No tax, purchase, expense, bank, or cash movement is created.

**Annotated Example:**

```jsonc
{
  // Required. Must be "AP_WRITE_OFF"
  "document_type": "AP_WRITE_OFF",

  // Required. Company code
  "company_code": "NZ_COMPANY_001",

  // Required. Existing AP Counterparty code
  "ap_counterparty_code": "SUPP_001",

  // Optional. Caller document identifier; generated if omitted
  "document_id": "WO-1001",

  // Optional. Brief caller memo
  "memo": "Small supplier balance write-off",

  // Required. Date of write-off
  "write_off_date": "2026-05-15",

  // Optional. Defaults to write_off_date
  "posting_date": "2026-05-15",

  // Optional. Defaults to the slot default
  "write_off_income_posting_code": "452000",

  // Required. Open bill items to write off
  "applications": [
    {
      "target_bill": {
        // Bill number to write off
        "document_id": "BILL-1001"
      },
      "amount": "250.00"
    }
  ]
}
```

### Response Object

The response contains:

* `detailed_document` The validated write-off and target bill applications.
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

The engine debits AP trade payables and credits the write-off income posting code.

```txt
Dr AP_TRADE_PAYABLES             250.00
  Cr 452000  250.00
```

### Posting Code Slots

| Slot name                          | Scope  | Description                                                                                                      |
| ---------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------- |
| `write_off_income_posting_code`    | Header | Optional posting-code slot used to select the write-off income posting target. If omitted, the default is used. |

### Tax treatment

AP\_WRITE\_OFF has no direct tax treatment and creates no Tax Ledger entries.

### AP Subledger treatment

`AP_WRITE_OFF` creates debit AP Subledger movements against the target bill open items.

Write-off amounts reduce bill open balances.

### Inventory treatment

AP\_WRITE\_OFF has no inventory implications and creates no Inventory Ledger entries.

### Date treatment

`write_off_date` must be supplied. `posting_date` may be supplied. If not supplied, `posting_date` defaults to `write_off_date`.

### Bank Details

`AP_WRITE_OFF` does not accept bank details. Supplying `bank_cash_details` is rejected because this document does not post to a Bank / Cash account.

### Dimensions treatment

`AP_WRITE_OFF` does not support dimensions. If dimensions are supplied, the transaction is rejected.

## Use cases

### Write off part of a bill balance

```txt
Dr AP_TRADE_PAYABLES             250.00
  Cr 452000  250.00

AP Subledger:
  Debit: 250.00
  Applied to: AP_BILL BILL-1001
  Effect: reduces bill open amount
```

## Considerations

* Write-offs are made to AP open items, not bill lines.
* Write-off amounts cannot exceed open balances.
* A write-off does not reverse purchase, expense, or tax.
