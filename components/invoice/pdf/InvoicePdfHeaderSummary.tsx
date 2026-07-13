import { Image, Text, View } from "@react-pdf/renderer";
import type { InvoiceDocumentData } from "@/lib/invoice-document";
import { formatInvoiceDate } from "@/lib/invoice-formatting";
import { getInvoiceLegalTeam } from "@/components/invoice/attorney-summary";
import { imageSource } from "@/components/invoice/pdf/image-source";
import { invoicePdfStyles as styles } from "@/components/invoice/pdf/styles";

type InvoicePdfSectionProps = {
  invoice: InvoiceDocumentData;
};

export function InvoicePdfHeader({ invoice }: InvoicePdfSectionProps) {
  const legalTeam = getInvoiceLegalTeam(invoice);

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
        <View style={styles.firmAddress}>
          {invoice.firm.addressLines.map((line) => (
            <Text key={line} style={styles.mutedText}>
              {line}
            </Text>
          ))}
        </View>
        <View style={styles.clientAddress}>
          <Text style={styles.sectionLabel}>Client Address</Text>
          <Text style={styles.primaryText}>{invoice.client.name}</Text>
          {invoice.client.addressLines.map((line) => (
            <Text key={line} style={styles.mutedText}>
              {line}
            </Text>
          ))}
        </View>
      </View>
      <View style={styles.invoiceTitleBlock}>
        <View style={styles.headerLegalTeam}>
          <Text style={styles.headerLegalLabel}>Principal</Text>
          <Text style={styles.headerLegalValueText}>{legalTeam.principal}</Text>
          <Text style={styles.headerLegalLabel}>Lawyers</Text>
          {legalTeam.lawyers.length > 0 ? (
            legalTeam.lawyers.map((lawyer) => (
              <Text key={lawyer} style={styles.headerLegalValueText}>
                {lawyer}
              </Text>
            ))
          ) : (
            <Text style={styles.headerLegalValueText}>Pending</Text>
          )}
        </View>

        <Text style={styles.kicker}>Tax Invoice</Text>
        <Text style={styles.invoiceTaxId}>
          {invoice.firm.taxIdLabel}: {invoice.firm.taxId}
        </Text>
        <View style={styles.titleMeta}>
          <View style={styles.titleMetaRow}>
            <Text style={styles.titleMetaLabel}>Invoice #</Text>
            <Text style={styles.titleMetaValue}>{invoice.invoiceNumber}</Text>
          </View>
          <View style={styles.titleMetaRow}>
            <Text style={styles.titleMetaLabel}>Date</Text>
            <Text style={styles.titleMetaValue}>
              {formatInvoiceDate(invoice.issuedAt)}
            </Text>
          </View>
          <View style={styles.titleMetaRow}>
            <Text style={styles.titleMetaLabel}>Due On</Text>
            <Text style={styles.titleMetaValue}>{formatInvoiceDate(invoice.dueAt)}</Text>
          </View>
          <View style={styles.titleMetaRow}>
            <Text style={styles.titleMetaLabel}>Our Ref</Text>
            <Text style={styles.titleMetaValue}>{invoice.reference ?? ""}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export function InvoicePdfSubject({ invoice }: InvoicePdfSectionProps) {
  return (
    <Text style={styles.reLine}>
      <Text style={styles.reLineLabel}>Re: </Text>
      <Text style={styles.reLineSubject}>
        {invoice.subject ?? invoice.matter.description ?? "Subject details pending"}
      </Text>
    </Text>
  );
}
