# TAX\_PAYMENT

{% hint style="info" %}
`POST /api/finance/process-document/TAX_PAYMENT`

`POST /api/finance/process-document/TAX_PAYMENT?preview`

**?preview parameter**

If `preview` is passed then no ledger posting, tax ledger entries, or persisted records are created. The response shape is identical to a live request.
{% endhint %}

The TAX\_PAYMENT endpoint records a payment made to a tax authority.

### Request Object

This request object has the following notable properties:

* A single tax authority per document is supported.
* The tax side posts to the configured `TAX_ON_SALES` tax control account.
* The bank / cash side is resolved from the selected Bank / Cash account.
* If `bank_cash_account_code` is omitted, the configured document default Bank / Cash account is used.
* If `bank_cash_account_code` is supplied, it overrides the document default and must identify a valid active Bank / Cash account code.
* Bank / cash details are supported.
* No AR or AP Subledger movement is created.

**Annotated Example:**

```jsonc
{
  // Required. Must be "TAX_PAYMENT"
  "document_type": "TAX_PAYMENT",

  // Required. Company code
  "company_code": "NZ_COMPANY_001",

  // Required. Tax authority being paid
  "tax_authority_code": "IRD",

  // Optional. Caller document identifier; generated if omitted
  "document_id": "TAX-PAY-1001",

  // Optional. Brief caller memo
  "memo": "GST return payment",

  // Required. Date of payment
  "payment_date": "2026-05-20",

  // Optional. Defaults to payment_date
  "posting_date": "2026-05-20",

  // Required. Amount paid
  "payment_amount": "1000.00",

  // Optional. Overrides the document default Bank / Cash account.
  // Must identify a valid active Bank / Cash account code.
  "bank_cash_account_code": "BANK_OPERATING",

  // Optional. Bank / Cash transaction details
  "bank_cash_details": {
    "tx_id": "TX-123456789",
    "tx_code": "DR",
    "tx_ref": "BANK-REF-001",
    "tx_details": "Tax payment transaction details",
    "payment_ref": "TAX-PAY-1001"
  }
}
```

### Response Object

The response contains:

* `detailed_document` The validated tax payment document.
* `tax_ledger_details` Tax Ledger details.
* `posting_details` Company Ledger journal details.

```json
{
  "detailed_document": { /* ... */ },
  "tax_ledger_details": { /* ... */ },
  "posting_details": { /* ... */ }
}
```

For `?preview`, status fields are `EPHEMERAL` instead of `POSTED`.

## Financial / Ledger Treatment Principles

### Journal treatment

The engine debits the tax GL account and credits the selected Bank / Cash account.

```txt
  TAX_PAYMENT

  Ledger (typical use case):

  Dr TAX_ON_SALES
    Cr Bank / cash

  BY WAY OF:

    Voyzu journal:
      Dr TAX_ON_SALES Control Account
        Cr selected Bank / Cash account
```

### Posting Code Slots

The tax side does not provide a caller-supplied posting code slot or GL override.

The tax side always resolves through the configured `TAX_ON_SALES` tax control account.

### Bank / Cash account selection

| Slot name            | Scope  | Description                                                                                                                           |
| -------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `bank_cash_account_code`  | Header | Optional Bank / Cash account code used to select the payment bank/cash posting target. If omitted, the configured default is used.     |

### Tax Ledger treatment

TAX\_PAYMENT creates a debit movement in the Tax Ledger against the supplied tax authority.

```txt
Tax Ledger Treatment:

  TAX-30000
    Document: TAX_PAYMENT TAX-PAY-1001
    Tax authority: IRD
    Tax movement: Tax on Sales
    Debit: 1,000.00
    Credit: -
    Effect: records tax paid to the authority
```

### Inventory treatment

TAX\_PAYMENT has no inventory implications and creates no Inventory Ledger entries.

### Date treatment

`payment_date` must be supplied. `posting_date` may be supplied. If not supplied, `posting_date` defaults to `payment_date`.

### Bank Details

TAX\_PAYMENT supports Bank / Cash details.

If `bank_cash_account_code` is omitted, the configured TAX\_PAYMENT Bank / Cash account default is used. If supplied, `bank_cash_account_code` overrides the default and must identify a valid active Bank / Cash account code. Voyzu resolves the selected Bank / Cash account to its linked GL account.

If `bank_cash_details` is supplied, it records transaction/reference details for the selected Bank / Cash account.

### Dimensions treatment

TAX\_PAYMENT does not support dimensions. If dimensions are supplied, the transaction is rejected.

## Use cases

### Pay a tax authority

```txt
Ledger:

  TAX_PAYMENT TAX-PAY-1001

  Dr Tax on Sales - Payable        1,000.00
    Cr Bank / cash                 1,000.00

  BY WAY OF:

    Voyzu journal:
      Dr TAX_ON_SALES Control Account              1,000.00
        Cr BANK_OPERATING                          1,000.00

Tax Ledger Treatment:

  TAX-30000
    Document: TAX_PAYMENT TAX-PAY-1001
    Tax authority: IRD
    Tax movement: TAX_ON_SALES
    Debit: 1,000.00
    Credit: -
    Effect: records tax paid to the authority
```

## Considerations

* TAX\_PAYMENT records settlement activity, not AR/AP source tax.
* Payments are made to one tax authority per document.
