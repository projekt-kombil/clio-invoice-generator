"use client";

import { Document, Font, Page, Text, pdf } from "@react-pdf/renderer";
import type { InvoiceDocumentData } from "@/lib/invoice-document";
import {
  InvoicePdfClosingBlocks,
  InvoicePdfFooter,
  InvoicePdfHeader,
  InvoicePdfOverallTotal,
  InvoicePdfPageNumber,
  InvoicePdfPaymentBlocks,
  InvoicePdfSubject,
} from "@/components/invoice/pdf/InvoicePdfSections";
import { InvoicePdfTable } from "@/components/invoice/pdf/InvoicePdfTable";
import { invoicePdfStyles as styles } from "@/components/invoice/pdf/styles";
import { getInvoiceStatusWatermark } from "@/lib/invoice-document";

type InvoicePdfDocumentProps = {
  invoice: InvoiceDocumentData;
};

Font.registerHyphenationCallback((word) => [word]);

export function InvoicePdfDocument({ invoice }: InvoicePdfDocumentProps) {
  const watermark = getInvoiceStatusWatermark(invoice);

  return (
    <Document
      author="Clio Invoice Generator"
      subject={`Invoice ${invoice.invoiceNumber}`}
      title={`Invoice ${invoice.invoiceNumber}`}
    >
      <Page size="A4" style={styles.page}>
        <InvoicePdfHeader invoice={invoice} />
        <InvoicePdfSubject invoice={invoice} />
        <InvoicePdfTable group={invoice.services} invoice={invoice} showTax />
        <InvoicePdfTable group={invoice.expenses} invoice={invoice} />
        <InvoicePdfOverallTotal invoice={invoice} />
        <InvoicePdfClosingBlocks invoice={invoice} />
        <InvoicePdfPaymentBlocks invoice={invoice} />
        <InvoicePdfFooter invoice={invoice} />
        {watermark ? (
          <Text fixed style={styles.watermark}>
            {watermark}
          </Text>
        ) : null}
        <InvoicePdfPageNumber />
      </Page>
    </Document>
  );
}

export async function renderInvoicePdfBlob(
  invoice: InvoiceDocumentData,
): Promise<Blob> {
  return pdf(<InvoicePdfDocument invoice={invoice} />).toBlob();
}

export async function renderInvoicePdf(
  invoice: InvoiceDocumentData,
): Promise<ArrayBuffer> {
  const blob = await renderInvoicePdfBlob(invoice);
  return blob.arrayBuffer();
}
