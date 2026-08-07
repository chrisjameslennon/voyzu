# Voyzu

Voyzu is an open-source, embeddable financial ledger.

It is designed for teams that need accounting and ledger capabilities inside their own software, without having to build a full accounting system from scratch.

## Example

```typescript
import Voyzu from "@voyzu/server";
import type { ArInvoicePostRequestDto } from "@voyzu/server/dto";

const voyzu = new Voyzu({
  databaseUrl: process.env.VOYZU_DATABASE_URL!,
});

const invoice = {
  document_type: "AR_INVOICE",
  company_code: "ACME",
  customer_code: "CUST-001",
  invoice_reference: "INV-123",
  invoice_date: "2026-05-12",
  currency_code: "NZD",
  lines: [
    {
      description: "Some services",
      quantity: "1",
      unit_price: "123.45",
      net_amount: "123.45",
      revenue_posting_code: "400000",
      tax_intent: "STANDARD",
    },
  ],
} satisfies ArInvoicePostRequestDto;

// Preview validates the invoice and calculates tax/totals without posting.
const preview = await voyzu.arInvoices.preview(invoice);

if (!preview.postable) {
  throw new Error("Invoice cannot be posted");
}

// Post commits the invoice to the company financial ledger.
const postedInvoice = await voyzu.arInvoices.post(invoice);

// Reports can be generated from the posted ledger data.
const profitLossHtml = await voyzu.profitAndLossReports.renderHtml({
  company_code: "ACME",
  period: "2026-05",
});

console.debug(postedInvoice.document_id);
console.debug(profitLossHtml);
```

## Use cases

Voyzu may be useful for:

- Companies looking for an in-house accounting system that integrates deeply with their proprietary technology
- SaaS providers looking to widen their product offering into the financial and ledger space
- E-commerce solution providers looking to strengthen the financial component of their platform
- Developers who want ledger, tax, AR, AP, and reporting capabilities without building every accounting primitive from scratch
- Developers looking for a Rapid Application Development (RAD) platform with pre-built financial modules

## Check it out

- Online demo — sample data, cleared periodically
- Documentation