# Tax Ledger Entries Report

Tax Ledger Entries Report provides an audit-oriented extract of tax ledger entries.

## Concepts

* [Tax](../../../voyzu-core-concepts/tax.md) explains tax configuration, filing, and ledger posting.
* [What Is a Financial Ledger?](../../../voyzu-core-concepts/what-is-a-financial-ledger.md) explains the immutable records behind the report.

## Set the report scope

Select the financial year and period or from/to dates. Confirm the company, authority scope, and filing context before refreshing.

The report always uses the company currently shown in the company switcher. Change company before interpreting or distributing the output.

## Generate and refresh

The preview is generated from posted financial records. Use **Refresh** after changing parameters or after new posting completes. A generation timestamp identifies when the displayed output was produced.

## Read the results

Read authority, component, source document, taxable base, tax amount, date, and control-account context. Totals describe the chosen ledger scope and may differ from a return if its filing scope differs.

## Investigate the detail

Use Tax Ledger Entries for detail and Tax Reconciliation to compare the same scope with the GL.

## View and download

Use the available options to control presentation. **View PDF** opens a printable rendering and **Download** saves the offered output. Where a control is absent, that output is not supported by this report. The PDF and preview reflect the same selected scope.

## Interpretation limits

This report presents recorded financial data; it does not validate the operational event or supply management commentary. Correct source data with a supported new document or reversal, then regenerate the report. Never alter ledger history to force a report total.

## See also

* [Tax Ledger Entries](../tax-ledger-entries.md)
* [Tax Reconciliation](tax-reconciliation.md)
* [Tax Return](tax-return.md)
