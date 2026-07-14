import { Image, Text, View } from "@react-pdf/renderer";
import type { InvoiceDocumentData } from "@/lib/invoice-document";
import { formatInvoiceDate } from "@/lib/invoice-formatting";
import { getInvoiceLegalTeam } from "@/components/invoice/attorney-summary";
import { imageSource } from "@/components/invoice/pdf/image-source";
import { invoicePdfStyles as styles } from "@/components/invoice/pdf/styles";

type InvoicePdfSectionProps = {
  invoice: InvoiceDocumentData;
};

const TWO_COLUMN_LAWYER_THRESHOLD = 6;

export function InvoicePdfHeader({ invoice }: InvoicePdfSectionProps) {
  const legalTeam = getInvoiceLegalTeam(invoice);
  const lawyerListStyle =
    legalTeam.lawyers.length >= TWO_COLUMN_LAWYER_THRESHOLD
      ? styles.headerLawyerListTwoColumn
      : styles.headerLawyerList;

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
            <Text key={line} style={styles.addressLine}>
              {line}
            </Text>
          ))}
        </View>
        <View style={styles.clientAddress}>
          <Text style={styles.sectionLabel}>Client Address</Text>
          <Text style={styles.primaryText}>{invoice.client.name}</Text>
          {invoice.client.addressLines.map((line) => (
            <Text key={line} style={styles.addressLine}>
              {line}
            </Text>
          ))}
        </View>
      </View>
      <View style={styles.invoiceTitleBlock}>
        <View style={styles.headerLegalTeam}>
          <Text style={styles.headerLegalLabel}>Principal</Text>
          <Text style={styles.headerLegalValueText}>{legalTeam.principal}</Text>
          <Text
            style={[styles.headerLegalLabel, styles.headerLegalLabelAfterValue]}
          >
            Lawyers
          </Text>
          <View style={lawyerListStyle}>
            {legalTeam.lawyers.length > 0 ? (
              legalTeam.lawyers.map((lawyer) => (
                <Text
                  key={lawyer}
                  style={
                    legalTeam.lawyers.length >= TWO_COLUMN_LAWYER_THRESHOLD
                      ? [
                          styles.headerLegalValueText,
                          styles.headerLawyerListTwoColumnText,
                        ]
                      : styles.headerLegalValueText
                  }
                >
                  {lawyer}
                </Text>
              ))
            ) : null}
          </View>
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
        {invoice.subject ?? invoice.matter.description ?? ""}
      </Text>
    </Text>
  );
}
