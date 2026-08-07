# Add a Financial Document Processing Engine

Voyzu includes a number of Financial Document Processing [endpoints](/broken/pages/Y5aSBTUlL30kKlV170oB). Developing a new financial document processing engine should follow the pattern established. Following existing conventions will help keep things consistent.

## Naming conventions

The below fields should be named the same across financial documents

```jsonc
// financial document type. E..g AR_INVOICE, AP_BILL etc
document_type
// Voyzu company code
company_code
// Agreed unique document identifier. E..g INV-1001, RECEIPT-20261211 etc
document_id
// Date to enter into the Company Ledger
posting_date
// Optional. Caller document reference / memo.
meno
```

### Use document-specific event date names

For example:

```txt
AR_INVOICE      invoice_date
AR_RECEIPT      payment_date
AP_BILL         bill_date
AP_PAYMENT      payment_date
AR_REFUND       refund_date
WRITE_OFF       write_off_date
```

### Use document-specific amount field names

For example

```txt
AR_INVOICE      invoice_amount
AR_RECEIPT      receipt_amount
AP_PAYMENT      payment_amount
AR_REFUND       refund_amount
WRITE_OFF       write_off_amount
```
