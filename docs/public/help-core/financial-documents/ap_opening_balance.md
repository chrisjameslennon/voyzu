# AP\_OPENING\_BALANCE

{% hint style="info" %}
`POST /api/finance/process-document/AP_OPENING_BALANCE`

`POST /api/finance/process-document/AP_OPENING_BALANCE?preview`

**?preview parameter**

If `preview` is passed then no ledger posting, subledger entries, or persisted records are created. The response shape is identical to a live request.
{% endhint %}

The AP\_OPENING\_BALANCE endpoint seeds opening supplier payable balances during migration or system setup. Use this document when an opening balance has been established for a given counterparty but there isn't the necessary evidence to enter an `AP_BILL` document. Note that line information is only provided for reference, an open item will not be created

### Request Object

This request object has the following notable properties:

* A single AP Counterparty per document is supported.
* Multiple opening AP items may be supplied.
* Opening balances create AP open items.
* A single opening balance equity posting code is supported.
* No tax, purchase, expense, bank, or cash movement is created.

**Annotated Example:**

```jsonc
{
  // Required. Must be "AP_OPENING_BALANCE"
  "document_type": "AP_OPENING_BALANCE",

  // Required. Company code
  "company_code": "NZ_COMPANY_001",

  // Required unless ap_counterparty is supplied
  "ap_counterparty_code": "SUPP_001",

  // Optional. Caller document identifier; generated if omitted
  "document_id": "AP-OB-1001",

  // Optional. Brief caller memo
  "memo": "Opening AP migration",

  // Required. Opening balance date
  "opening_balance_date": "2026-04-01",

  // Optional. Defaults to opening_balance_date
  "posting_date": "2026-04-01",

  // Optional. Defaults to the slot default
  "opening_balance_equity_posting_code": "OPENING_BALANCE_EQUITY",

  // Required. Opening AP items
  // These are stored for information and to derive the posting total.
  // No open item is created
  "items": [
    {
      "line_id": 1,
      "external_reference": "LEGACY-BILLS TO DATE",
      "description": "Legacy supplier bills to date",
      "gross_amount": "3000.00"
    }
  ]
}
```

### Response Object

The response contains:

* `detailed_document` The validated opening balance document.
* `ap_subledger_details` AP Subledger opening balance details.
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

The engine debits the opening balance equity posting code and credits AP trade payables.

```txt
Dr OPENING_BALANCE_EQUITY       3,000.00
  Cr AP_TRADE_PAYABLES          3,000.00
```

### Posting Code Slots

| Slot name                             | Scope  | Description                                                                                                          |
| ------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------- |
| `opening_balance_equity_posting_code` | Header | Optional posting-code slot used to select the opening balance equity posting target. If omitted, the default is used. |

### Tax treatment

AP\_OPENING\_BALANCE has no direct tax treatment and creates no Tax Ledger entries.

### AP Subledger treatment

`AP_OPENING_BALANCE` creates credit AP Subledger movements for the specified counterparty.

Each item creates an opening AP open item that can later be settled by normal AP documents.

### Inventory treatment

AP\_OPENING\_BALANCE has no direct inventory treatment and creates no Inventory Ledger entries.

If an inventory ledger opening balance is required, use an inventory document such as `INVENTORY_RECEIPT` or `INVENTORY_ADJUSTMENT`.

### Date treatment

`opening_balance_date` must be supplied. `posting_date` may be supplied. If not supplied, `posting_date` defaults to `opening_balance_date`.

### Bank Details

`AP_OPENING_BALANCE` does not accept bank details. Supplying `bank_cash_details` is rejected because this document does not post to a Bank / Cash account.

### Dimensions treatment

`AP_OPENING_BALANCE` does not support dimensions. If dimensions are supplied, the transaction is rejected.

## Use cases

### Seed opening supplier payables

```txt
Dr OPENING_BALANCE_EQUITY       3,000.00
  Cr AP_TRADE_PAYABLES          3,000.00

AP Subledger:
  Credit: 3,000.00
  Counterparty: SUPP_001
  Effect: creates opening AP open item
```

## Considerations

* Opening balances are for migration or system setup.
* Opening balances do not create purchase, expense, or tax.
* Opening AP items can be settled by normal AP documents after migration.
