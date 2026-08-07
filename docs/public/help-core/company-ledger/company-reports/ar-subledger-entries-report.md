# AR Subledger Entries Report

AR Subledger Entries Report provides an audit-oriented extract of customer subledger entries.

## Concepts

* [What Is a Financial Ledger?](../../../voyzu-core-concepts/what-is-a-financial-ledger.md) explains the AR subledger and immutable entries.
* [Control Accounts](../../../voyzu-core-concepts/control-accounts.md) explains its GL relationship.

## Set the report scope

Select the financial year and period or from/to dates. Confirm the company and refresh after the relevant customer documents are posted.

The report always uses the company currently shown in the company switcher. Change company before interpreting or distributing the output.

## Generate and refresh

The preview is generated from posted financial records. Use **Refresh** after changing parameters or after new posting completes. A generation timestamp identifies when the displayed output was produced.

## Read the results

Read entry ID, customer, source document, dates, debit or credit amount, applications, and control-account context. Totals describe the selected entry scope, not necessarily outstanding receivables.

## Investigate the detail

Use AR Ledger Entry Enquiry for relationships and AR Invoices for the source financial document.

## View and download

Use the available options to control presentation. **View PDF** opens a printable rendering and **Download** saves the offered output. Where a control is absent, that output is not supported by this report. The PDF and preview reflect the same selected scope.

## Interpretation limits

This report presents recorded financial data; it does not validate the operational event or supply management commentary. Correct source data with a supported new document or reversal, then regenerate the report. Never alter ledger history to force a report total.

## See also

* [AR Ledger Entries](../ar-ledger-entries.md)
* [AR Ledger Entry Enquiry](../ar-ledger-entry-enquiry.md)
* [AR Invoices](../ar-invoices.md)
