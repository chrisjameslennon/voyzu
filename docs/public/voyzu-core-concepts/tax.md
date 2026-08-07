# Tax

Voyzu tax is rules driven. Financial documents do not infer tax from a counterparty, tax authority jurisdiction, or region by themselves. For tax-relevant document lines, the caller supplies a `tax_rule`, and the financial document processing engine uses that rule to calculate tax, create the Company Ledger journal lines, and write Tax Ledger movements.

This keeps the source document explicit: the document says which tax treatment applies, while Voyzu owns the configured rates, authorities, ledger posting, and audit trail.

## Core concepts

### Tax rules

A tax rule is the tax code supplied on a financial document line, for example `NZ_STANDARD`, `GB_REDUCED`, `CA_BC_STANDARD`, or `NO_TAX`.

Tax rules are country-specific and define the calculation model:

| Calculation model       | Meaning                                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `NO_TAX`                | No tax is calculated. The rule is still recorded for audit and reporting context.                                              |
| `CONFIGURED_COMPONENTS` | Voyzu calculates tax from one or more configured tax rule lines associated with the country                                    |
| `CALLER_SUPPLIED`       | The caller supplies the tax components explicitly in the document payload. This supports complex or externally calculated tax. |

The company country constrains which tax rules are valid. The counterparty country or region is stored for reference but does not choose the tax rule.

### Tax rule lines

A tax rule line is a configured line attached to a tax rule. It defines the tax authority, rate, scheme, and labels that Voyzu uses when applying a `CONFIGURED_COMPONENTS` rule.

Tax rule lines are configuration, not financial document output. During document processing, the engine reads the rule lines and produces calculated tax components for the document. The calculation-model identifier remains `CONFIGURED_COMPONENTS`, but the configured records shown in the application are called **tax rule lines**.

### Tax components

A tax component is the calculated or caller-supplied tax line behind a rule. It identifies:

* the tax authority
* the tax rate
* invoice and report labels
* the taxable base amount
* the tax amount

A single tax rule can have multiple tax rule lines. For example, a Canadian provincial rule can have a federal GST line and a provincial PST line. During processing, those lines resolve into corresponding calculated tax components. Each calculated component can produce its own tax journal line and Tax Ledger line.

Tax rates are stored as decimals: `0.15` means 15%.

### Tax authorities

A tax authority is the government or statutory body associated with a tax component. Authorities are used for reporting, settlement, and tax ledger attribution.

Authority jurisdiction is display metadata. Posting behavior is driven by tax rules and tax components, not by jurisdiction labels such as national, federal, provincial, or state.

### Tax control accounts

Voyzu has two tax movement/control account concepts used by posting engines:

| Tax movement       | Used for                                                      |
| ------------------ | ------------------------------------------------------------- |
| `TAX_ON_SALES`     | Output tax/payable tax created by sales-side documents.       |
| `TAX_ON_PURCHASES` | Input tax/recoverable tax created by purchase-side documents. |

These movement codes resolve to configured GL accounts. The Company Ledger holds the financial balance, and the Tax Ledger records the supporting tax detail.

## Financial document processing

Tax is applied only by document types whose processing rules are tax-aware. The exact treatment is documented on each financial document page, but the common pattern is:

1. The caller posts a financial document.
2. Tax relevant documents supply a `tax_rule` at a header level (applies to all lines) or a line level
3. The engine validates that the rule is active and valid for the company country.
4. The engine reads configured tax rule lines to calculate tax components, or validates caller-supplied tax components.
5. The engine calculates tax from the line net amount.
6. The engine posts Company Ledger lines and Tax Ledger movements.

If a gross amount is supplied, Voyzu validates that it reconciles to the net amount plus derived tax.

## Sales documents

Sales-side tax is normally output tax. For example, `AR_INVOICE` uses the line `tax_rule` to calculate tax and credits the `TAX_ON_SALES` control account.

Typical AR invoice posting:

```txt
Dr Accounts Receivable
  Cr Revenue
  Cr TAX_ON_SALES
```

The Tax Ledger receives one credit movement per resolved tax component.

Sales credit documents reverse this treatment. For example, `AR_CREDIT_NOTE` debits `TAX_ON_SALES` and writes reversing Tax Ledger movements.

Example AR invoice line:

```json
{
  "line_id": 1,
  "description": "Consulting services",
  "quantity": 1,
  "net_unit_price": "1000.00",
  "tax_rule": "NZ_STANDARD"
}
```

## Purchase documents

Purchase-side tax is handled by recoverability.

For `AP_BILL`, each line supplies a `tax_rule`. If tax is recoverable, Voyzu debits `TAX_ON_PURCHASES` and writes Tax Ledger movements. If tax is non-recoverable, the tax amount is included in the purchase, expense, asset, or inventory cost and does not create a recoverable tax balance.

Typical recoverable AP bill posting:

```txt
Dr Expense / Purchase
Dr TAX_ON_PURCHASES
  Cr Accounts Payable
```

Typical non-recoverable AP bill posting:

```txt
Dr Expense / Purchase, including tax
  Cr Accounts Payable
```

Purchase credit documents reverse the original purchase-side treatment. For example, `AP_CREDIT_NOTE` credits `TAX_ON_PURCHASES` where the credited tax is recoverable.

Example AP bill line:

```json
{
  "line_id": 1,
  "description": "Office supplies",
  "net_amount": "1000.00",
  "gross_amount": "1150.00",
  "tax_rule": "NZ_STANDARD",
  "tax_recoverable": true
}
```

## Caller-supplied tax

Use a `CALLER_SUPPLIED` tax rule when an external system has already determined the tax split, authority, and rate. This is useful for complex sales tax environments or edge cases that cannot be represented by configured tax rule lines alone.

```json
{
  "tax_rule": "CALLER_SUPPLIED",
  "tax_components": [
    {
      "tax_authority_code": "US_CA_CDTFA",
      "tax_rate": 0.0725,
      "invoice_label": "CA State Sales Tax"
    },
    {
      "tax_authority_code": "US_CA_LOS_ANGELES_DISTRICT",
      "tax_rate": 0.0225,
      "invoice_label": "Los Angeles District Tax"
    }
  ]
}
```

Caller-supplied tax components are only accepted when the selected tax rule is configured as `CALLER_SUPPLIED`.

## Tax settlement documents

Tax settlement documents do not calculate tax from sales or purchase lines. They move balances between tax control accounts and bank/cash accounts, or adjust tax balances directly.

| Document         | Purpose                                                       |
| ---------------- | ------------------------------------------------------------- |
| `TAX_PAYMENT`    | Records a payment made to a tax authority.                    |
| `TAX_REFUND`     | Records a refund received from a tax authority.               |
| `TAX_ADJUSTMENT` | Records an explicit adjustment to tax payable or recoverable. |

These documents take a tax authority because the settlement or adjustment is against that authority. They do not use authority jurisdiction to derive tax.

## Documents without tax calculation

Payment, receipt, application, write-off, opening balance, inventory movement, and general ledger journal documents generally do not calculate new tax. Where they affect tax, they reverse, settle, or reference tax already created by source documents.

For exact behavior, use the Tax treatment section on the relevant financial document page.

## Reporting and reconciliation

The Company Ledger records the accounting impact through `TAX_ON_SALES` and `TAX_ON_PURCHASES` GL accounts. The Tax Ledger records the supporting detail by document, tax rule, tax component, authority, rate, taxable amount, and tax amount.

Tax reports reconcile these two views:

* Company Ledger control account balances show the financial position.
* Tax Ledger movements explain the tax detail behind those balances.
* Tax authority attribution supports filing, settlement, and audit.
