# Roadmap

## Feature Complete Core ERP

* Accounts Receivable: Customers, Orders, Invoicing
* Accounts Payable: Suppliers, Purchase Orders, Bills
* Bank reconciliation including automated bank transaction importing
* Inventory Management: Stock and Logistics
* Headless Website and e-commerce

## Extend Platform Capabilities

* Extend package management capabilities
* Add new capabilities that can be leveraged by packages:
  * Data Import
  * Email
  * File platform / storage

## Longer Term

The below functionality is not currently planned

### Deepen Financial Ledger Functionality

Introduce advanced Accounting features such as:

* Multi currency
* International Tax

### Widen Financial Ledger Integration

Extend the Financial Ledger to accommodate other domains. \`This would mainly involve the addition of additional families of Financial Domains and their associated accounting formulas

<table><thead><tr><th width="122">Domain code</th><th>Domain name</th><th>Ledger support model</th><th width="270">Possible Financial document type codes</th></tr></thead><tbody><tr><td><strong>CASH</strong></td><td>Cash / Bank</td><td>Cash ledger / reconciliation support</td><td><code>CASH_RECEIPT</code>, <code>CASH_PAYMENT</code>, <code>CASH_TRANSFER</code>, <code>CASH_DEPOSIT</code>, <code>CASH_WITHDRAWAL</code>, <code>CASH_BANK_FEE</code>, <code>CASH_BANK_INTEREST_INCOME</code>, <code>CASH_BANK_INTEREST_EXPENSE</code>, <code>CASH_RECON_ADJUSTMENT</code>, <code>CASH_OPENING_BALANCE</code></td></tr><tr><td><strong>ACC</strong></td><td>Accruals / Prepayments</td><td>Accrual/prepayment schedule</td><td><code>ACC_ACCRUAL</code>, <code>ACC_REVERSAL</code>, <code>ACC_PREPAYMENT</code>, <code>ACC_PREPAYMENT_AMORTISATION</code>, <code>ACC_ADJUSTMENT</code>, <code>ACC_OPENING_BALANCE</code></td></tr><tr><td><strong>DEFREV</strong></td><td>Deferred Revenue</td><td>Revenue deferral / recognition schedule</td><td><code>DEFREV_DEFERRAL</code>, <code>DEFREV_RECOGNITION</code>, <code>DEFREV_ADJUSTMENT</code>, <code>DEFREV_OPENING_BALANCE</code></td></tr><tr><td><strong>WIP</strong></td><td>WIP / Contract Assets</td><td>WIP / unbilled revenue support model</td><td><code>WIP_RECOGNITION</code>, <code>WIP_BILLING</code>, <code>WIP_ADJUSTMENT</code>, <code>WIP_WRITE_OFF</code>, <code>WIP_OPENING_BALANCE</code></td></tr><tr><td><strong>FA</strong></td><td>Fixed Assets</td><td>Fixed asset register</td><td><code>FA_ACQUISITION</code>, <code>FA_CAPITALISATION</code>, <code>FA_DEPRECIATION</code>, <code>FA_DISPOSAL</code>, <code>FA_IMPAIRMENT</code>, <code>FA_REVALUATION</code>, <code>FA_TRANSFER</code>, <code>FA_OPENING_BALANCE</code></td></tr><tr><td><strong>LOAN</strong></td><td>Loans / Financing</td><td>Loan schedule / debt detail</td><td><code>LOAN_DRAWDOWN</code>, <code>LOAN_REPAYMENT</code>, <code>LOAN_INTEREST_ACCRUAL</code>, <code>LOAN_FEE</code>, <code>LOAN_ADJUSTMENT</code>, <code>LOAN_RECLASS_CURRENT_PORTION</code>, <code>LOAN_OPENING_BALANCE</code></td></tr><tr><td><strong>PAY</strong></td><td>Payroll</td><td>Payroll liability detail</td><td><code>PAY_PAYRUN</code>, <code>PAY_ACCRUAL</code>, <code>PAY_PAYMENT</code>, <code>PAY_LIABILITY_SETTLEMENT</code>, <code>PAY_ADJUSTMENT</code>, <code>PAY_OPENING_BALANCE</code></td></tr><tr><td><strong>EQUITY</strong></td><td>Equity</td><td>Mostly GL-only / equity movement support</td><td><code>EQUITY_ISSUE</code>, <code>EQUITY_BUYBACK</code>, <code>EQUITY_DIVIDEND_DECLARATION</code>, <code>EQUITY_DIVIDEND_PAYMENT</code>, <code>EQUITY_RETAINED_EARNINGS_CLOSE</code>, <code>EQUITY_ADJUSTMENT</code>, <code>EQUITY_OPENING_BALANCE</code></td></tr><tr><td><strong>IC</strong></td><td>Intercompany</td><td>Intercompany detail / elimination support</td><td><code>IC_CHARGE</code>, <code>IC_RECHARGE</code>, <code>IC_SETTLEMENT</code>, <code>IC_ELIMINATION</code>, <code>IC_ADJUSTMENT</code>, <code>IC_OPENING_BALANCE</code></td></tr><tr><td><strong>CCARD</strong></td><td>Credit Cards</td><td>Card statement / reconciliation support</td><td><code>CCARD_CHARGE</code>, <code>CCARD_REFUND</code>, <code>CCARD_PAYMENT</code>, <code>CCARD_FEE</code>, <code>CCARD_INTEREST</code>, <code>CCARD_STATEMENT</code>, <code>CCARD_OPENING_BALANCE</code></td></tr><tr><td><strong>EXPCLAIM</strong></td><td>Expense Claims</td><td>Claim detail / reimbursement support</td><td><code>EXPCLAIM_POSTING</code>, <code>EXPCLAIM_REIMBURSEMENT</code>, <code>EXPCLAIM_ADJUSTMENT</code>, <code>EXPCLAIM_OPENING_BALANCE</code></td></tr></tbody></table>
