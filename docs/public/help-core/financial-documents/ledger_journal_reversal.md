# LEDGER\_JOURNAL\_REVERSAL

{% hint style="info" %}
`POST /api/finance/process-document/LEDGER_JOURNAL_REVERSAL`

`POST /api/finance/process-document/LEDGER_JOURNAL_REVERSAL?preview`

**?preview parameter**

If `preview` is passed then no ledger posting or persisted records are created. The response shape is identical to a live request.
{% endhint %}

The LEDGER\_JOURNAL\_REVERSAL endpoint reverses a posted `LEDGER_JOURNAL`.

Only full journal reversals are supported. Partial reversals are not supported.

### Request Object

This request object has the following notable properties:

* The caller supplies the source journal code to reverse.
* The source journal must be a posted `LEDGER_JOURNAL`.
* The source journal must not already be reversed.
* The source journal must not itself be a reversal.
* The reversal recreates all source journal lines with `DR` and `CR` swapped.
* Source line dimensions are inherited onto the corresponding reversal lines.
* No journal lines or amounts are supplied by the caller.
* No supporting ledger entries are created.

**Annotated Example:**

```jsonc
{
  // Required. Must be "LEDGER_JOURNAL_REVERSAL"
  "document_type": "LEDGER_JOURNAL_REVERSAL",

  // Required. Company code
  "company_code": "NZ_COMPANY_001",

  // Optional. Caller document identifier for the reversal
  "document_id": "GJ-1001-REV",

  // Optional. Brief caller memo
  "memo": "Reverse month-end accrual",

  // Optional. Accepted only when the source LEDGER_JOURNAL includes
  // a line posted to a GL account linked to this Bank / Cash account.
  "bank_cash_details": {
    "code": "BANK_PAYROLL",
    "tx_id": "TX-123456789",
    "tx_code": "CR",
    "tx_ref": "BANK-REF-001",
    "tx_details": "Dummy reversal bank transaction details",
    "payment_ref": "GJ-1001-REV"
  },

  // Required. Posted LEDGER_JOURNAL code to reverse
  "source_journal_code": "JRN-2026-010001",

  // Optional. Defaults to the posting date of the journal being reversed
  "posting_date": "2026-05-01"
}
```

### Response Object

The response contains:

* `detailed_document` The validated reversal document and source journal details.
* `posting_details` Company Ledger reversal journal details.

```json
{
  "detailed_document": { /* ... */ },
  "posting_details": { /* ... */ }
}
```

For `?preview`, status fields are `EPHEMERAL` instead of `POSTED`.

## Financial / Ledger Treatment Principles

### Journal treatment

The engine reverses the source `LEDGER_JOURNAL` by creating a new Company Ledger journal with all source lines inverted.

```txt
GIVEN LEDGER_JOURNAL GJ-1001

  Dr 610000 Consulting Expense       1,000.00
    Cr 240000 Accrued Expenses       1,000.00

THEN LEDGER_JOURNAL_REVERSAL GJ-1001-REV

  Dr 240000 Accrued Expenses         1,000.00
    Cr 610000 Consulting Expense     1,000.00
```

The reversal journal is linked to the source journal. The source journal is marked as reversed by the new reversal journal.

### Posting Code Slots

No posting code slots are provided.

The reversal uses the GL accounts from the source journal lines. The caller does not supply posting codes, control accounts, or GL account codes.

### Tax treatment

LEDGER\_JOURNAL\_REVERSAL has no direct tax treatment and creates no Tax Ledger entries.

### Supporting ledger treatment

LEDGER\_JOURNAL\_REVERSAL creates no AR Subledger, AP Subledger, or Tax Ledger entries.

It reverses only the Company Ledger impact of the source `LEDGER_JOURNAL`.

### Inventory treatment

LEDGER\_JOURNAL\_REVERSAL has no direct inventory treatment and creates no Inventory Ledger entries.

If an inventory ledger movement is required, use an inventory document such as `INVENTORY_ADJUSTMENT` to record the quantity or value correction.

### Date treatment

`posting_date` may be supplied.

If `posting_date` is not supplied, it defaults to the posting date of the journal being reversed.

### Bank Details

Bank details are conditionally accepted for `LEDGER_JOURNAL_REVERSAL`. They may be supplied only when the source `LEDGER_JOURNAL` includes a line posted to a GL account linked to a Bank / Cash control account.

If supplied, `bank_cash_details.code` must identify the Bank / Cash account linked to the source journal's Bank / Cash line. If the source journal has no Bank / Cash-linked line, or if the supplied code does not match the linked account, the reversal is rejected.

### Dimensions treatment

Dimensions are inherited from the source journal lines.

Each reversal line carries the same dimensions as the source line it reverses.

## Use cases

### Reverse a month-end accrual

```jsonc
{
  "document_type": "LEDGER_JOURNAL_REVERSAL",
  "company_code": "NZ_COMPANY_001",
  "document_id": "GJ-1001-REV",
  "memo": "Reverse April accrual",
  "source_journal_code": "JRN-2026-010001",
  "posting_date": "2026-05-01"
}
```

```txt
Source journal:

  Dr 610000 Consulting Expense       1,000.00
    Cr 240000 Accrued Expenses       1,000.00

Reversal journal:

  Dr 240000 Accrued Expenses         1,000.00
    Cr 610000 Consulting Expense     1,000.00

Result:
  The source journal remains posted and is marked as reversed.
  The reversal journal is posted and linked to the source journal.
```

## Considerations

* Partial reversals are not supported.
