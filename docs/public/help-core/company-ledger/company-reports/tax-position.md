# Tax Position

Tax Position summarizes the selected company's tax balances as at a date.

## Concepts

* [Tax](../../../voyzu-core-concepts/tax.md) explains tax configuration, filing, and ledger posting.
* [What Is a Financial Ledger?](../../../voyzu-core-concepts/what-is-a-financial-ledger.md) explains the immutable records behind the report.

## Set the report scope

Choose the **as at** date and confirm the selected company. The company's country and tax profile determine the relevant authorities and components.

The report always uses the company currently shown in the company switcher. Change company before interpreting or distributing the output.

## Generate and refresh

The preview is generated from posted financial records. Use **Refresh** after changing parameters or after new posting completes. A generation timestamp identifies when the displayed output was produced.

## Read the results

Review each authority or component and its total. Distinguish payable and receivable positions and confirm that the displayed scope matches the filing question being answered.

## Investigate the detail

Use Tax Ledger Entries for individual movements and Tax Reconciliation to compare tax activity with the GL.

## View and download

Use the available options to control presentation. **View PDF** opens a printable rendering and **Download** saves the offered output. Where a control is absent, that output is not supported by this report. The PDF and preview reflect the same selected scope.

## Interpretation limits

This report presents recorded financial data; it does not validate the operational event or supply management commentary. Correct source data with a supported new document or reversal, then regenerate the report. Never alter ledger history to force a report total.

## See also

* [Tax Ledger Entries](../tax-ledger-entries.md)
* [Tax Return](tax-return.md)
* [Tax Reconciliation](tax-reconciliation.md)
