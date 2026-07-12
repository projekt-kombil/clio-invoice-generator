import { Image, Text, View } from "@react-pdf/renderer";
import type { InvoiceDocumentData } from "@/lib/invoice-document";
import {
  formatInvoiceDate,
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
