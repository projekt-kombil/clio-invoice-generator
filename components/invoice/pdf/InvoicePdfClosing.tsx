import { Image, Text, View } from "@react-pdf/renderer";
import type { InvoiceDocumentData } from "@/lib/invoice-document";
import {
  formatInvoiceMoney,
  formatInvoicePercent,
} from "@/lib/invoice-formatting";
import { imageSource } from "@/components/invoice/pdf/image-source";
import { invoicePdfStyles as styles } from "@/components/invoice/pdf/styles";
import { getInvoiceOverallTotalSummary } from "@/components/invoice/overall-total";

type InvoicePdfSectionProps = {
  invoice: InvoiceDocumentData;
};

export function InvoicePdfOverallTotal({ invoice }: InvoicePdfSectionProps) {
  const totalSummary = getInvoiceOverallTotalSummary(invoice);

  return (
    <View style={styles.overallTotalSection} wrap={false}>
      <Text style={styles.tableTitle}>Invoice Total</Text>
      <View style={styles.overallTotalLineRow}>
        <Text>Subtotal</Text>
        <Text>{formatInvoiceMoney(totalSummary.subtotal, invoice)}</Text>
      </View>
      <View style={styles.overallTotalLineRow}>
        <Text>
          Tax
          {invoice.taxRate !== null
            ? ` (${formatInvoicePercent(invoice.taxRate)})`
            : ""}
        </Text>
        <Text>{formatInvoiceMoney(totalSummary.tax, invoice)}</Text>
      </View>
      <View style={styles.overallTotalRow}>
        <Text>Total ({invoice.firm.currencyCode})</Text>
        <Text>{formatInvoiceMoney(totalSummary.total, invoice)}</Text>
      </View>
    </View>
  );
}

export function InvoicePdfPaymentBlocks({ invoice }: InvoicePdfSectionProps) {
  return (
    <>
      <View style={styles.signatureSection} wrap={false}>
        <Text style={styles.signatureHeading}>
          With Compliments,
        </Text>
        <View style={styles.signatureBox}>
          {imageSource(invoice.responsibleAttorneySignatureImage) ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image
              src={imageSource(invoice.responsibleAttorneySignatureImage) ?? ""}
              style={styles.signatureImage}
            />
          ) : null}
          <Text style={styles.signatureText}>Jema lawyers</Text>
        </View>
      </View>

      <View style={styles.paymentDetails} wrap={false}>
        <Text style={styles.paymentInstruction}>
          Please pay within 14 days by direct deposit in Jema Lawyers Bank Account
          as detailed:
        </Text>
        <View style={styles.paymentBankGrid}>
          {invoice.firm.bankAccounts.map((account) => (
            <View key={account.accountNumber} style={styles.paymentBankColumn}>
              <Text style={styles.tableTitle}>{account.bankName}</Text>
              <View style={styles.paymentBankRow}>
                <Text style={styles.paymentBankLabel}>Account Name</Text>
                <Text style={styles.paymentBankValue}>{account.accountName}</Text>
              </View>
              <View style={styles.paymentBankRow}>
                <Text style={styles.paymentBankLabel}>Branch</Text>
                <Text style={styles.paymentBankValue}>{account.branch}</Text>
              </View>
              <View style={styles.paymentBankRow}>
                <Text style={styles.paymentBankLabel}>BSB No</Text>
                <Text style={styles.paymentBankValue}>{account.bsbNumber}</Text>
              </View>
              <View style={styles.paymentBankRow}>
                <Text style={styles.paymentBankLabel}>SWIFT Code</Text>
                <Text style={styles.paymentBankValue}>{account.swiftCode}</Text>
              </View>
              <View style={styles.paymentBankRow}>
                <Text style={styles.paymentBankLabel}>Account Number</Text>
                <Text style={styles.paymentBankValue}>{account.accountNumber}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </>
  );
}

export function InvoicePdfFooter({ invoice }: InvoicePdfSectionProps) {
  return (
    <View style={styles.footer} wrap={false}>
      {invoice.firm.footerLines.map((line) => (
        <Text key={line}>{line}</Text>
      ))}
    </View>
  );
}

export function InvoicePdfPageNumber() {
  return (
    <Text
      fixed
      render={({ pageNumber, totalPages }) =>
        `Page ${pageNumber} of ${totalPages}`
      }
      style={styles.pageNumber}
    />
  );
}
