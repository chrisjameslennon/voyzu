# Tax Return

Tax Return summarizes the selected company's tax activity for a configured filing period.

## Concepts

* [Tax](../../../voyzu-core-concepts/tax.md) explains tax configuration, filing, and ledger posting.
* [What Is a Financial Ledger?](../../../voyzu-core-concepts/what-is-a-financial-ledger.md) explains the immutable records behind the report.

## Set the report scope

Select a financial year and one of the filing periods derived from the company's tax profile. Confirm the period dates and company before refreshing.

The report always uses the company currently shown in the company switcher. Change company before interpreting or distributing the output.

## Generate and refresh

The preview is generated from posted financial records. Use **Refresh** after changing parameters or after new posting completes. A generation timestamp identifies when the displayed output was produced.

## Read the results

Review taxable bases and tax amounts by authority or component, then the report total. The screen reports ledger data; submission workflow remains outside Voyzu.

## Investigate the detail

Use Tax Ledger Entries to inspect individual amounts and Tax Reconciliation before relying on the return totals.

## View and download

Use the available options to control presentation. **View PDF** opens a printable rendering and **Download** saves the offered output. Where a control is absent, that output is not supported by this report. The PDF and preview reflect the same selected scope.

## Interpretation limits

This report presents recorded financial data; it does not validate the operational event or supply management commentary. Correct source data with a supported new document or reversal, then regenerate the report. Never alter ledger history to force a report total.

## See also

* [Tax Reconciliation](tax-reconciliation.md)
* [Tax Ledger Entries](../tax-ledger-entries.md)
* [Tax Position](tax-position.md)
