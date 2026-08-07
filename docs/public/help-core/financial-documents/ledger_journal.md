# LEDGER\_JOURNAL

{% hint style="info" %}
`POST /api/finance/process-document/LEDGER_JOURNAL`

`POST /api/finance/process-document/LEDGER_JOURNAL?preview`

**?preview parameter**

If `preview` is passed then no ledger posting or persisted records are created. The response shape is identical to a live request.
{% endhint %}

The LEDGER\_JOURNAL endpoint posts a caller-supplied journal directly to the Company Ledger.

It is used for general ledger journals that are not sourced from AR, AP, Tax, or another specialised financial document processor.

### Request Object

This request object has the following notable properties:

* The caller supplies the journal header information.
* The caller supplies the journal lines.
* `posting_date` is the only required accounting date.
* The journal header description is system generated and is not accepted in the request.
* Journal lines post directly to GL account codes.
* Control Accounts and Posting Codes are reserved for transactions from a Financial Document. GL accounts linked to a Control Account or a Posting Code cannot be supplied.
* The journal must balance in company base currency.
* Dimensions are supported on journal lines.
* No supporting ledger entries are created.

**Annotated Example:**

```jsonc
{
  // Required. Must be "LEDGER_JOURNAL"
  "document_type": "LEDGER_JOURNAL",

  // Required. Company code
  "company_code": "NZ_COMPANY_001",

  // Optional. Caller document identifier
  "document_id": "GJ-1001",

  // Optional. Brief caller memo
  "memo": "Bank fee journal",

  // Required. Journal posting date
  "posting_date": "2026-04-30",

  // Optional. Accepted only when a journal line uses a GL account
  // linked to this Bank / Cash account.
  "bank_cash_details": {
    "code": "BANK_PAYROLL",
    "tx_id": "TX-123456789",
    "tx_code": "DR",
    "tx_ref": "BANK-REF-001",
    "tx_details": "Dummy bank fee transaction details",
    "payment_ref": "GJ-1001"
  },

  // Required. Journal lines. At least one DR and one CR line are required.
  "lines": [
    {
      // Required. Caller line ordering identifier
      "line_id": 1,

      // Required. Direct GL account code
      "gl_account_code": "810000",

      // Optional. Line description
      "description": "Bank fees",

      // Optional. Line memo
      "memo": "April bank account fees",

      // Required. Must be "DR" or "CR"
      "dr_cr": "DR",

      // Required. Positive amount in company base currency
      "base_currency_amount": "1000.00",

      // Optional. Line dimensions
      "dimensions": {
        "DEPARTMENT": "Operations",
        "PROJECT": "Implementation"
      }
    },
    {
      "line_id": 2,
      "gl_account_code": "100100",
      "description": "Payroll bank",
      "dr_cr": "CR",
      "base_currency_amount": "1000.00"
    }
  ]
}
```

### Response Object

The response contains:

* `detailed_document` The validated ledger journal document.
* `posting_details` Company Ledger journal details.

```json
{
  "detailed_document": { /* ... */ },
  "posting_details": { /* ... */ }
}
```

For `?preview`, status fields are `EPHEMERAL` instead of `POSTED`.

## Financial / Ledger Treatment Principles

### Journal treatment

The engine posts the supplied lines directly to the Company Ledger.

The engine does not calculate balancing lines. The caller must provide a balanced journal.

```txt
LEDGER_JOURNAL GJ-1001

  Dr 610000 Consulting Expense       1,000.00
    Cr 220000 Accrued Expenses       1,000.00
```

### Posting Code Slots

No posting code slots are provided.

Ledger journal lines use direct GL account codes. Posting codes and control account resolution are not used.

### Tax treatment

LEDGER\_JOURNAL has no direct tax treatment and creates no Tax Ledger entries.

Tax-relevant activity should be posted through a tax-specific financial document processor.

### Supporting ledger treatment

LEDGER\_JOURNAL creates no AR Subledger, AP Subledger, or Tax Ledger entries.

It posts only to the Company Ledger.

### Inventory treatment

LEDGER\_JOURNAL has no direct inventory treatment and creates no Inventory Ledger entries.

If an inventory ledger movement is required, use an inventory document such as `INVENTORY_RECEIPT`, `INVENTORY_ISSUE`, or `INVENTORY_ADJUSTMENT`.

### Date treatment

`posting_date` must be supplied.

The posting date determines the financial year and financial period used by the journal.

### Bank Details

Bank details are conditionally accepted for `LEDGER_JOURNAL`. They may be supplied only when at least one journal line posts to a GL account linked to a Bank / Cash control account.

If supplied, `bank_cash_details.code` must identify the Bank / Cash account linked to one of the GL accounts in the journal. If no journal line targets a Bank / Cash-linked GL account, or if the supplied code does not match the linked account, the transaction is rejected.

### Dimensions treatment

LEDGER\_JOURNAL supports optional dimensions on journal lines.

Dimensions are attached to the journal line they are supplied on. Header-level dimensions are not supported.

## Use cases

### Month-end accrual

```jsonc
{
  "document_type": "LEDGER_JOURNAL",
  "company_code": "NZ_COMPANY_001",
  "document_id": "GJ-1001",
  "memo": "Month-end accrual",
  "posting_date": "2026-04-30",
  "lines": [
    {
      "line_id": 1,
      "gl_account_code": "610000",
      "description": "Consulting accrual",
      "dr_cr": "DR",
      "base_currency_amount": "1000.00",
      "dimensions": {
        "DEPARTMENT": "Operations"
      }
    },
    {
      "line_id": 2,
      "gl_account_code": "220000",
      "description": "Accrued expenses",
      "dr_cr": "CR",
      "base_currency_amount": "1000.00"
    }
  ]
}
```

```txt
Ledger:

  Dr 610000 Consulting Expense       1,000.00
    Cr 220000 Accrued Expenses       1,000.00

Result:
  A balanced general ledger journal is posted for the accrual.
```

### Reclassification between expense accounts

```txt
Ledger:

  Dr 620000 Software Expense           250.00
    Cr 610000 Consulting Expense       250.00

Result:
  Expense is reclassified between GL accounts without creating any supporting ledger movement.
```

## Considerations

* The journal must contain at least one debit line and one credit line.
* Total debits must equal total credits in company base currency.
* Amounts must be positive; the debit or credit direction is expressed by `dr_cr`.
* Protected GL accounts cannot be posted to directly.
* No AR, AP, or Tax supporting ledger movement is created.
* Reversal is handled by `LEDGER_JOURNAL_REVERSAL`.
