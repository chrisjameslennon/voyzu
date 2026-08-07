# PDF generation

Voyzu generates PDFs by rendering an unframed printable page through the shared PDF capability. A report should use the same server page and report template for its normal preview, printable page and PDF output.

## Report template

Keep the document itself in a report template. The template receives already validated report data and presentation options; it must not render the Voyzu application shell, navigation or interactive controls.

Report CSS must be embedded in the document. Export the CSS as a string from a `.css.ts` file and include it in the template:

```tsx
import { trialBalanceReportCss, trialBalanceReportStyles as styles } from "./trial-balance-report.css";

export function TrialBalanceReportTemplate({ data }: Props) {
  return (
    <article className={styles.reportDocument}>
      <style>{trialBalanceReportCss}</style>
      {/* report content */}
    </article>
  );
}
```

Do not rely only on a CSS module imported by the framed screen. The PDF renderer loads the printable route independently and must receive all document styling with that route.

## Server page

Use one server page for the framed and printable routes. The platform supplies `surface.unframed` for an unframed route:

```tsx
export async function TrialBalanceReportPage({ surface }: ReportPageProps) {
  const data = await getTrialBalance();

  if (surface?.unframed) {
    return <TrialBalanceReportTemplate data={data} generatedAt={generatedAt()} />;
  }

  return <TrialBalanceReport initialData={data} />;
}
```

The framed branch renders the interactive report screen. The unframed branch returns only the document template that will be printed or captured as a PDF.

## Route registration

Register both paths against the same page component. Mark the printable route as `unframed`:

```ts
pageRoutes: {
  report: {
    path: "/finance/reports/trial-balance",
    Page: TrialBalanceReportPage,
    auth: { required: true },
  },
  reportPrintable: {
    path: "/finance/reports/trial-balance/printable",
    Page: TrialBalanceReportPage,
    unframed: true,
    auth: { required: true },
  },
}
```

## Report actions

The report toolbar provides three actions:

```tsx
const printablePath = "/finance/reports/trial-balance/printable";
const pdfParams = new URLSearchParams({
  path: printablePath,
  filename: "trial-balance",
  orientation: "portrait",
});

const pdfViewPath = `/api/capability/pdf-view?${pdfParams.toString()}`;
const pdfDownloadPath = `/api/capability/pdf?${pdfParams.toString()}`;

<Button onClick={() => window.open(printablePath, "_blank", "noopener,noreferrer")} />
<Button onClick={() => window.open(pdfViewPath, "_blank", "noopener,noreferrer")} />
<Button onClick={() => { window.location.href = pdfDownloadPath; }} />
```

Add report filters and display options to both the printable URL and PDF capability URL. The server page reads them from `surface.searchParams`, ensuring that the preview, printable page and PDF contain the same report.

Use `portrait` or `landscape` consistently in the PDF parameters and the template's print page rule:

```tsx
<style>{`@media print { @page { size: A4 portrait; } }`}</style>
```

The Trial Balance and organization list reports in `@voyzu/core` are reference implementations of this pattern.
