import "server-only";

import { Document, Page, Text, pdf } from "@react-pdf/renderer";
import type { InvoiceDocumentData } from "@/lib/invoice-document";
import {
  InvoicePdfClosingBlocks,
  InvoicePdfFooter,
  InvoicePdfHeader,
  InvoicePdfPageNumber,
  InvoicePdfSubject,
  InvoicePdfSummary,
} from "@/components/invoice/pdf/InvoicePdfSections";
import { InvoicePdfTable } from "@/components/invoice/pdf/InvoicePdfTable";
import { invoicePdfStyles as styles } from "@/components/invoice/pdf/styles";
import { shouldShowDraftWatermark } from "@/lib/invoice-document";

type InvoicePdfDocumentProps = {
  invoice: InvoiceDocumentData;
};

function InvoicePdfDocument({ invoice }: InvoicePdfDocumentProps) {
  return (
    <Document
      author="Clio Invoice Generator"
      subject={`Invoice ${invoice.invoiceNumber}`}
      title={`Invoice ${invoice.invoiceNumber}`}
    >
      <Page size="A4" style={styles.page}>
        {shouldShowDraftWatermark(invoice) ? (
          <Text fixed style={styles.watermark}>
            Draft
          </Text>
        ) : null}
        <InvoicePdfHeader invoice={invoice} />
        <InvoicePdfSummary invoice={invoice} />
        <InvoicePdfSubject invoice={invoice} />
        <InvoicePdfTable group={invoice.services} invoice={invoice} />
        <InvoicePdfTable group={invoice.expenses} invoice={invoice} />
        <InvoicePdfClosingBlocks invoice={invoice} />
        <InvoicePdfFooter invoice={invoice} />
        <InvoicePdfPageNumber />
      </Page>
    </Document>
  );
}

export async function renderInvoicePdf(
  invoice: InvoiceDocumentData,
): Promise<ArrayBuffer> {
  const blob = await pdf(<InvoicePdfDocument invoice={invoice} />).toBlob();
  return blob.arrayBuffer();
}
