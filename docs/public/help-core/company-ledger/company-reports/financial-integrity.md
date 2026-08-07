# Financial Integrity

Financial Integrity checks agreement between the selected company's general ledger and its supporting ledgers.

## Concepts

* [What Is a Financial Ledger?](../../../voyzu-core-concepts/what-is-a-financial-ledger.md) explains the records behind financial reports.
* [Financial Document Processing](../../../voyzu-core-concepts/financial-document-processing.md) explains how source documents create reportable postings.
* [Control Accounts](../../../voyzu-core-concepts/control-accounts.md) explains the mappings being checked.

## Set the report scope

Choose the available date or period scope and refresh after all relevant posting runs have completed.

The report always uses the company currently shown in the company switcher. Change company before interpreting or distributing the output.

## Generate and refresh

The preview is generated from posted financial records. Use **Refresh** after changing parameters or after new posting completes. A generation timestamp identifies when the displayed output was produced.

## Read the results

Review every check, not only the overall result. A difference identifies which ledger relationship and amount require investigation; it does not by itself identify the faulty source document.

## Investigate the detail

Follow a failed check into the relevant AP, AR, inventory, tax, or bank/cash ledger, then compare its control-account GL activity.

## View and download

Use the available options to control presentation. **View PDF** opens a printable rendering and **Download** saves the offered output. Where a control is absent, that output is not supported by this report. The PDF and preview reflect the same selected scope.

## Interpretation limits

This report presents recorded financial data; it does not validate the operational event or supply management commentary. Correct source data with a supported new document or reversal, then regenerate the report. Never alter ledger history to force a report total.

## See also

* [Trial Balance](trial-balance.md)
* [AP Ledger Entries](../ap-ledger-entries.md)
* [AR Ledger Entries](../ar-ledger-entries.md)
* [Inventory Ledger Entries](../inventory-ledger-entries.md)
