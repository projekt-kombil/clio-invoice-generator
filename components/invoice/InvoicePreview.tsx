import type { InvoiceDocumentData } from "@/lib/invoice-document";
import { shouldShowDraftWatermark } from "@/lib/invoice-document";

import {
  InvoicePreviewAttorneys,
  InvoicePreviewBottom,
  InvoicePreviewFooter,
  InvoicePreviewHeader,
  InvoicePreviewItemsTable,
  InvoicePreviewSignature,
  InvoicePreviewSubject,
  InvoicePreviewSummary,
} from "@/components/invoice/preview";

type InvoicePreviewProps = {
  invoice: InvoiceDocumentData;
};

export function InvoicePreview({ invoice }: InvoicePreviewProps) {
  return (
    <article className="invoice-page bg-white text-slate-950">
      {shouldShowDraftWatermark(invoice) ? (
        <div aria-hidden="true" className="invoice-watermark">
          Draft
        </div>
      ) : null}
      <InvoicePreviewHeader invoice={invoice} />
      <InvoicePreviewSummary invoice={invoice} />
      <InvoicePreviewSubject invoice={invoice} />
      <InvoicePreviewItemsTable group={invoice.services} invoice={invoice} />
      <InvoicePreviewItemsTable group={invoice.expenses} invoice={invoice} />
      <InvoicePreviewAttorneys invoice={invoice} />
      <InvoicePreviewSignature invoice={invoice} />
      <InvoicePreviewBottom invoice={invoice} />
      <InvoicePreviewFooter invoice={invoice} />
    </article>
  );
}
