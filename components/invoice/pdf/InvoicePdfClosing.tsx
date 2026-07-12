import { Image, Text, View } from "@react-pdf/renderer";
import type { InvoiceDocumentData } from "@/lib/invoice-document";
import {
  formatInvoiceDiscount,
  formatInvoiceMoney,
  formatInvoicePercent,
} from "@/lib/invoice-formatting";
import { imageSource } from "@/components/invoice/pdf/image-source";
import { shouldShowInvoiceLineGroup } from "@/components/invoice/pdf/InvoicePdfTable";
import { invoicePdfStyles as styles } from "@/components/invoice/pdf/styles";

type InvoicePdfSectionProps = {
  invoice: InvoiceDocumentData;
};

function InvoicePdfAccountSummary({ invoice }: InvoicePdfSectionProps) {
  return (
    <View style={styles.totals}>
      <Text style={styles.sectionLabel}>Account Summary</Text>
      {shouldShowInvoiceLineGroup(invoice.services) ? (
        <View style={styles.totalRow}>
          <Text>Services Subtotal</Text>
          <Text>{formatInvoiceMoney(invoice.services.subtotal, invoice)}</Text>
        </View>
      ) : null}
      {shouldShowInvoiceLineGroup(invoice.expenses) ? (
        <View style={styles.totalRow}>
          <Text>Expenses Subtotal</Text>
          <Text>{formatInvoiceMoney(invoice.expenses.subtotal, invoice)}</Text>
        </View>
      ) : null}
      {invoice.discount ? (
        <View style={styles.totalRow}>
          <Text>Discount</Text>
          <Text>{formatInvoiceDiscount(invoice.discount, invoice)}</Text>
        </View>
      ) : null}
      <View style={styles.totalRow}>
        <Text>Tax Rate</Text>
        <Text>{formatInvoicePercent(invoice.taxRate)}</Text>
      </View>
      <View style={styles.totalRow}>
        <Text>Tax Amount</Text>
        <Text>{formatInvoiceMoney(invoice.tax, invoice)}</Text>
      </View>
      {invoice.accountSummary.interest ? (
        <View style={styles.totalRow}>
          <Text>Interest</Text>
          <Text>{formatInvoiceMoney(invoice.accountSummary.interest, invoice)}</Text>
        </View>
      ) : null}
      <View style={styles.totalRow}>
        <Text>Total</Text>
        <Text>{formatInvoiceMoney(invoice.total, invoice)}</Text>
      </View>
      <View style={styles.totalRow}>
        <Text>Paid</Text>
        <Text>{formatInvoiceMoney(invoice.paid, invoice)}</Text>
      </View>
      <View style={styles.balanceRow}>
        <Text>Balance Due</Text>
        <Text>{formatInvoiceMoney(invoice.balance, invoice)}</Text>
      </View>
    </View>
  );
}

export function InvoicePdfClosingBlocks({ invoice }: InvoicePdfSectionProps) {
  return (
    <>
      <View style={styles.matterStrip} wrap={false}>
        <Text style={styles.sectionLabel}>Attorney Table</Text>
        {invoice.attorneys.length > 0 ? (
          invoice.attorneys.map((attorney) => (
            <Text key={attorney.name}>
              {attorney.name}
              {attorney.role ? ` - ${attorney.role}` : ""}
            </Text>
          ))
        ) : (
          <Text style={styles.mutedText}>
            Attorney details pending Clio field verification.
          </Text>
        )}
      </View>

      <View style={styles.matterStrip} wrap={false}>
        <Text style={styles.sectionLabel}>Lawyer Responsible E-Signature</Text>
        {imageSource(invoice.responsibleAttorneySignatureImage) ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <Image
            src={imageSource(invoice.responsibleAttorneySignatureImage) ?? ""}
            style={styles.signatureImage}
          />
        ) : null}
        <Text>
          {invoice.responsibleAttorneySignature ?? "Signature pending."}
        </Text>
      </View>

      <View style={styles.bottomGrid} wrap={false}>
        <View style={styles.paymentBlock}>
          <Text style={styles.sectionLabel}>Firm Bank Account Details</Text>
          {invoice.firm.bankAccountLines.map((line) => (
            <Text key={line} style={styles.mutedText}>
              {line}
            </Text>
          ))}
          <Text style={styles.mutedText}>
            Please reference invoice #{invoice.invoiceNumber}.
          </Text>
        </View>

        <InvoicePdfAccountSummary invoice={invoice} />
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
