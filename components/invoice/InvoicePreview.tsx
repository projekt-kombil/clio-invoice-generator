import type { InvoiceDocumentData } from "@/lib/invoice-document";
import { getInvoiceStatusWatermark } from "@/lib/invoice-document";

import {
  InvoicePreviewAttorneys,
  InvoicePreviewBottom,
  InvoicePreviewFooter,
  InvoicePreviewHeader,
  InvoicePreviewItemsTable,
  InvoicePreviewOverallTotal,
  InvoicePreviewSignature,
  InvoicePreviewSubject,
} from "@/components/invoice/preview";

type InvoicePreviewProps = {
  invoice: InvoiceDocumentData;
};

export function InvoicePreview({ invoice }: InvoicePreviewProps) {
  const watermark = getInvoiceStatusWatermark(invoice);

  return (
    <article className="invoice-page bg-white text-slate-950">
      {watermark ? (
        <div aria-hidden="true" className="invoice-watermark">
          {watermark}
        </div>
      ) : null}
      <InvoicePreviewHeader invoice={invoice} />
      <InvoicePreviewSubject invoice={invoice} />
      <InvoicePreviewItemsTable
        group={invoice.services}
        invoice={invoice}
        showTax
      />
      <InvoicePreviewItemsTable group={invoice.expenses} invoice={invoice} />
      <InvoicePreviewOverallTotal invoice={invoice} />
      <InvoicePreviewAttorneys invoice={invoice} />
      <InvoicePreviewSignature invoice={invoice} />
      <InvoicePreviewBottom invoice={invoice} />
      <InvoicePreviewFooter invoice={invoice} />
    </article>
  );
}
