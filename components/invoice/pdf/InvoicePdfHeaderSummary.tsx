import { Image, Text, View } from "@react-pdf/renderer";
import type { InvoiceDocumentData } from "@/lib/invoice-document";
import { formatInvoiceDate } from "@/lib/invoice-formatting";
import { imageSource } from "@/components/invoice/pdf/image-source";
import { invoicePdfStyles as styles } from "@/components/invoice/pdf/styles";

type InvoicePdfSectionProps = {
  invoice: InvoiceDocumentData;
};

export function InvoicePdfHeader({ invoice }: InvoicePdfSectionProps) {
  return (
    <View style={styles.header}>
      <View style={styles.brand}>
        {imageSource(invoice.firm.logoSrc) ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <Image
            src={imageSource(invoice.firm.logoSrc) ?? ""}
            style={styles.logoImage}
          />
        ) : (
          <View style={styles.logo}>
            <Text>{invoice.firm.logoInitials}</Text>
          </View>
        )}
        <View>
          <Text style={styles.firmName}>{invoice.firm.name}</Text>
          {invoice.firm.addressLines.map((line) => (
            <Text key={line} style={styles.mutedText}>
              {line}
            </Text>
          ))}
          <Text style={styles.mutedText}>
            {invoice.firm.taxIdLabel}: {invoice.firm.taxId}
          </Text>
        </View>
      </View>
      <View style={styles.invoiceTitleBlock}>
        <Text style={styles.kicker}>Tax Invoice</Text>
        <Text style={styles.title}>Invoice</Text>
        <Text style={styles.invoiceNumber}>#{invoice.invoiceNumber}</Text>
      </View>
    </View>
  );
}

export function InvoicePdfSummary({ invoice }: InvoicePdfSectionProps) {
  return (
    <View style={styles.summaryGrid} wrap={false}>
      <View style={styles.infoBox}>
        <Text style={styles.sectionLabel}>Bill To</Text>
        <Text style={styles.primaryText}>{invoice.client.name}</Text>
        {invoice.client.addressLines.map((line) => (
          <Text key={line} style={styles.mutedText}>
            {line}
          </Text>
        ))}
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.sectionLabel}>Invoice Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Invoice</Text>
          <Text style={styles.detailValue}>#{invoice.invoiceNumber}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date</Text>
          <Text style={styles.detailValue}>
            {formatInvoiceDate(invoice.issuedAt)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Due</Text>
          <Text style={styles.detailValue}>{formatInvoiceDate(invoice.dueAt)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Reference</Text>
          <Text style={styles.detailValue}>{invoice.reference ?? ""}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Matter</Text>
          <Text style={styles.detailValue}>
            {invoice.matter.description ?? ""}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Matter No.</Text>
          <Text style={styles.detailValue}>{invoice.matter.number ?? ""}</Text>
        </View>
      </View>
    </View>
  );
}

export function InvoicePdfSubject({ invoice }: InvoicePdfSectionProps) {
  return (
    <View style={styles.matterStrip} wrap={false}>
      <Text style={styles.sectionLabel}>Re / Subject</Text>
      <Text style={styles.matterTitle}>
        {invoice.subject ?? invoice.matter.description ?? "Subject details pending"}
      </Text>
      {invoice.matter.number ? (
        <Text style={styles.mutedText}>{invoice.matter.number}</Text>
      ) : null}
    </View>
  );
}
