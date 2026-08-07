# TAX\_ADJUSTMENT

{% hint style="info" %}
`POST /api/finance/process-document/TAX_ADJUSTMENT`

`POST /api/finance/process-document/TAX_ADJUSTMENT?preview`

**?preview parameter**

If `preview` is passed then no ledger posting, tax ledger entries, or persisted records are created. The response shape is identical to a live request.
{% endhint %}

The TAX\_ADJUSTMENT endpoint records a tax balance adjustment not sourced from AR or AP documents.

### Request Object

This request object has the following notable properties:

* A single tax authority per document is supported.
* `tax_movement_code` selects the tax control account being adjusted.
* The tax side does not provide a caller-supplied posting code slot or GL override.
* `adjustment_effect` determines whether the selected tax balance increases or reduces.
* `adjustment_amount` is always supplied as a positive amount. The debit / credit direction is derived from tax_movement_code and adjustment_effect.
* The adjustment offset side posts to the configured default unless `adjustment_gl_account_code` is supplied.
* No AR or AP Subledger movement is created.

**Annotated Example:**

```jsonc
{
  // Required. Must be "TAX_ADJUSTMENT"
  "document_type": "TAX_ADJUSTMENT",

  // Required. Company code
  "company_code": "NZ_COMPANY_001",

  // Required. Tax authority the adjustment relates to
  "tax_authority_code": "IRD",

  // Optional. Caller document identifier; generated if omitted
  "document_id": "TAX-ADJ-1001",

  // Optional. Brief caller memo
  "memo": "GST assessment adjustment",

  // Required. Date of adjustment
  "adjustment_date": "2026-05-20",

  // Optional. Defaults to adjustment_date
  "posting_date": "2026-05-20",

  // Required. Tax movement being adjusted.
  // Options:
  // - "TAX_ON_SALES"     for output/payable tax adjustments
  // - "TAX_ON_PURCHASES" for input/recoverable tax adjustments
  "tax_movement_code": "TAX_ON_SALES",

  // Required. Business effect of the adjustment.
  // Options when tax_movement_code = "TAX_ON_SALES":
  // - "INCREASES_TAX_PAYABLE"
  // - "REDUCES_TAX_PAYABLE"
  //
  // Options when tax_movement_code = "TAX_ON_PURCHASES":
  // - "INCREASES_TAX_RECOVERABLE"
  // - "REDUCES_TAX_RECOVERABLE"
  "adjustment_effect": "INCREASES_TAX_PAYABLE",

  // Required. Adjustment amount
  // Always positive
  "adjustment_amount": "75.00",

  // Optional. Direct GL override for the adjustment offset side.
  // If omitted, the configured 603000 default is used.
  "adjustment_gl_account_code": "603000"
}
```

### Response Object

The response contains:

* `detailed_document` The validated tax adjustment document.
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

The engine posts one side to the selected tax control account and the other side to the adjustment offset account.

```txt
  TAX_ADJUSTMENT

  Ledger (typical use case):

  Dr Tax adjustment offset
    Cr TAX_ON_SALES

  BY WAY OF:

    Voyzu journal:
      Dr 603000 Posting Code,
        or supplied General Ledger Account in adjustment_gl_account_code document property
        Cr TAX_ON_SALES Control Account
```

### Combinations

```txt
TAX_ON_SALES + INCREASES_TAX_PAYABLE

Dr 603000
  Cr TAX_ON_SALES
```

```txt
TAX_ON_SALES + REDUCES_TAX_PAYABLE

Dr TAX_ON_SALES
  Cr 603000
```

```txt
TAX_ON_PURCHASES + INCREASES_TAX_RECOVERABLE

Dr TAX_ON_PURCHASES
  Cr 603000
```

```txt
TAX_ON_PURCHASES + REDUCES_TAX_RECOVERABLE

Dr 603000
  Cr TAX_ON_PURCHASES
```

### Posting Code Slots

The tax side does not provide a caller-supplied posting code slot or GL override.

The tax side always resolves through the configured tax control account selected by `tax_movement_code`.

Default offset posting targets are configured in Voyzu. `adjustment_gl_account_code` may be supplied as a direct GL override for the adjustment offset side.

### Tax Ledger treatment

TAX\_ADJUSTMENT creates a Tax Ledger movement against the supplied tax authority. The debit or credit direction follows the selected `tax_movement_code` and `adjustment_effect`.

### Inventory treatment

TAX\_ADJUSTMENT has no inventory implications and creates no Inventory Ledger entries.

### Date treatment

`adjustment_date` must be supplied. `posting_date` may be supplied. If not supplied, `posting_date` defaults to `adjustment_date`.

### Bank Details

TAX\_ADJUSTMENT does not accept bank details. Supplying `bank_cash_details` is rejected because this document does not post to a Bank / Cash account.

### Dimensions treatment

TAX\_ADJUSTMENT does not support dimensions. If dimensions are supplied, the transaction is rejected.

## Use cases

### Increase tax payable

An authority assessment increases output tax payable.

```txt
Ledger:

  TAX_ADJUSTMENT TAX-ADJ-1001

  Dr Tax Adjustments               75.00
    Cr Tax on Sales - Payable      75.00

  BY WAY OF:

    Voyzu journal:
      Dr 603000 Posting Code,
        or supplied General Ledger Account in adjustment_gl_account_code document property
                                      75.00
        Cr TAX_ON_SALES Control Account 75.00

Tax Ledger Treatment:

  TAX-30000
    Document: TAX_ADJUSTMENT TAX-ADJ-1001
    Tax authority: IRD
    Tax movement: TAX_ON_SALES
    Debit: -
    Credit: 75.00
    Effect: increases tax payable
```

### Reduce tax recoverable

An authority assessment reduces input tax recoverable.

```txt
Ledger:

  TAX_ADJUSTMENT TAX-ADJ-1002

  Dr Tax Adjustments                  40.00
    Cr Tax on Purchases - Recoverable 40.00

  BY WAY OF:

    Voyzu journal:
      Dr 603000 Posting Code,
        or supplied General Ledger Account in adjustment_gl_account_code document property
                                            40.00
        Cr TAX_ON_PURCHASES Control Account 40.00

Tax Ledger Treatment:

  TAX-30001
    Document: TAX_ADJUSTMENT TAX-ADJ-1002
    Tax authority: IRD
    Tax movement: TAX_ON_PURCHASES
    Debit: -
    Credit: 40.00
    Effect: reduces tax recoverable
```

## Considerations

* TAX\_ADJUSTMENT records tax balance changes outside AR/AP source documents.
* Adjustments relate to one tax authority per document.
* Invalid combinations of `tax_movement_code` and `adjustment_effect` are rejected.
* `adjustment_amount` must be supplied as a positive amount. Negative adjustment amounts are rejected.
