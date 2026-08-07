# Tax Reconciliation

Tax Reconciliation compares the selected company's tax ledger activity with corresponding general ledger postings.

## Concepts

* [Tax](../../../voyzu-core-concepts/tax.md) explains tax configuration, filing, and ledger posting.
* [What Is a Financial Ledger?](../../../voyzu-core-concepts/what-is-a-financial-ledger.md) explains the immutable records behind the report.
* [Control Accounts](../../../voyzu-core-concepts/control-accounts.md) explains the tax-to-GL mapping.

## Set the report scope

Choose the filing period or date range used for the tax return, then refresh after all documents and reversals for that scope are posted.

The report always uses the company currently shown in the company switcher. Change company before interpreting or distributing the output.

## Generate and refresh

The preview is generated from posted financial records. Use **Refresh** after changing parameters or after new posting completes. A generation timestamp identifies when the displayed output was produced.

## Read the results

Review tax-ledger totals, GL control-account totals, and any difference by authority or component. Zero difference indicates ledger agreement, not necessarily correct tax treatment.

## Investigate the detail

Use Tax Ledger Entries and Account Activity to locate the records behind a difference, then inspect their source documents.

## View and download

Use the available options to control presentation. **View PDF** opens a printable rendering and **Download** saves the offered output. Where a control is absent, that output is not supported by this report. The PDF and preview reflect the same selected scope.

## Interpretation limits

This report presents recorded financial data; it does not validate the operational event or supply management commentary. Correct source data with a supported new document or reversal, then regenerate the report. Never alter ledger history to force a report total.

## See also

* [Tax Return](tax-return.md)
* [Tax Ledger Entries](../tax-ledger-entries.md)
* [Tax Accounts](../tax-control-accounts.md)
