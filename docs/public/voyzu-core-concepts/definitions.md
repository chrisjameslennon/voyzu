# Definitions

Definitions provided as a general guide.

**Organization**

A group of companies. A Voyzu instance has only a single Organization

**Company**

A bounded set of financial records. A company could be a registered company, a charitable organization, a partnership, and individual or a division within a company. All companies belong to the one Organization

**Company General Ledger**

Synonymous with Company Journal. The full set of financial entries for a Company and thus the source of financial truth for a company.

**Company Journal Entry**

Or An individual entry (record) in the Company General Ledger.

**Posting**

A verb. The activity of calculating and entering an entry into the Company General Ledger

**General Ledger Account**

An individual "bucket" representing a financial total. Sometimes shortened to "GL Account" or simply "Account". Also sometimes informally known as a General Ledger Code, or GL Code

**Account Type**

The highest level Accounting classification of a General Ledger Account. One of Asset, Liability, Equity, Revenue or Expense

**Dimension**

Structured data that can be attached to a Company Ledger Posting, used for Financial Analysis

**Supporting Ledger**

A record of the financial transactions that stand behind a particular General Ledger Account balance

**Subledger**

An Accounts Receivable or Accounts Payable Supporting Ledger

**Control Account**

A Control Account is a pointer to a General Ledger Account that represents a Subledger Total.

**Tax Account**

A pointer to a General Ledger Account that represents a taxation balance

**Bank / Cash Account**

A Voyzu specific term. A pointer to a General Ledger Account that represents a company Bank Account or Cash Account

**Tax Movement Code**

Tax Movement Codes classify tax-related postings so the system can track and report changes in a company’s tax position.

**Financial Document**

A document representing a financial event, for example a company invoice, a supplier bill and so on. Technically Financial Documents are supplied to Voyzu as JSON objects

**Financial Document Type**

The system classification of the Financial Document, for example `AR_INVOICE`, `AP_BILL` etc. You can see the full list of Financial Documents supported by Voyzu [here](/broken/pages/WH6vot51jiNaqurZoaZk)

**Financial Document Posting Engine**

The logic that validates the Financial Document supplied to the system, posts to the Company Ledger and the relevant supporting ledgers. There is a one to one relationship between Financial Document Types and Financial Document Posting Engines - the `AR_INVOICE` Document Type is posted by the `AR_INVOICE` Posting Engine etc. Sometimes referred to simply as "Posting Engine".

**Financial Document Default**

A stable alias to a General Ledger Account, used by a Posting Engine.
