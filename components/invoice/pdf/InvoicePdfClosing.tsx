import { Image, Text, View } from "@react-pdf/renderer";
import type { InvoiceDocumentData } from "@/lib/invoice-document";
import {
  formatInvoiceDate,
  formatInvoiceMoney,
  formatInvoicePercent,
  formatInvoiceQuantity,
} from "@/lib/invoice-formatting";
import { getInvoiceAccountStatementRows } from "@/components/invoice/account-statement";
import { getInvoiceAttorneySummary } from "@/components/invoice/attorney-summary";
import { imageSource } from "@/components/invoice/pdf/image-source";
import { invoicePdfStyles as styles } from "@/components/invoice/pdf/styles";
import { getInvoiceOverallTotalSummary } from "@/components/invoice/overall-total";

type InvoicePdfSectionProps = {
  invoice: InvoiceDocumentData;
};

function InvoicePdfAccountSummary({ invoice }: InvoicePdfSectionProps) {
  const statementRows = getInvoiceAccountStatementRows(invoice);

  return (
    <View style={styles.totals}>
      <Text style={styles.tableTitle}>Detailed Statement of Accounts</Text>
      <View style={styles.accountStatementTable}>
        <View style={styles.statementHeaderRow} wrap={false}>
          <Text style={[styles.cell, styles.statementInvoiceNumberCell]}>
            Invoice Number
          </Text>
          <Text style={[styles.cell, styles.statementDueOnCell]}>Due On</Text>
          <Text style={[styles.cell, styles.statementMoneyCell]}>
            Amount Due ({invoice.firm.currencyCode})
          </Text>
          <Text style={[styles.cell, styles.statementMoneyCell]}>
            Payments Received ({invoice.firm.currencyCode})
          </Text>
          <Text style={[styles.cell, styles.statementMoneyCell]}>
            Balance Due ({invoice.firm.currencyCode})
          </Text>
        </View>
        {statementRows.map((row) =>
          row.kind === "section" ? (
            <View key={row.id} style={styles.statementSectionRow} wrap={false}>
              <Text>{row.label}</Text>
            </View>
          ) : row.kind === "outstanding" || row.kind === "total" ? (
            <View
              key={row.id}
              style={
                row.kind === "total"
                  ? styles.statementBalanceRow
                  : styles.statementSubtotalRow
              }
              wrap={false}
            >
              <Text style={[styles.cell, styles.statementSummaryLabelCell]}>
                {row.label}
              </Text>
              <Text style={[styles.cell, styles.statementMoneyCell]}>
                {row.value}
              </Text>
            </View>
          ) : (
            <View
              key={row.id}
              style={styles.statementLineRow}
              wrap={false}
            >
              <Text style={[styles.cell, styles.statementInvoiceNumberCell]}>
                {row.invoiceNumber}
              </Text>
              <Text style={[styles.cell, styles.statementDueOnCell]}>
                {formatInvoiceDate(row.dueAt ?? null)}
              </Text>
              <Text style={[styles.cell, styles.statementMoneyCell]}>
                {row.amountDue}
              </Text>
              <Text style={[styles.cell, styles.statementMoneyCell]}>
                {row.paymentsReceived}
              </Text>
              <Text style={[styles.cell, styles.statementMoneyCell]}>
                {row.balanceDue}
              </Text>
            </View>
          ),
        )}
      </View>
    </View>
  );
}

export function InvoicePdfClosingBlocks({ invoice }: InvoicePdfSectionProps) {
  const attorneySummary = getInvoiceAttorneySummary(invoice);

  return (
    <>
      <View style={styles.matterStrip} wrap={false}>
        <Text style={styles.tableTitle}>Attorney Summary</Text>
        {attorneySummary.length > 0 ? (
          <View style={styles.attorneySummaryTable}>
            <View style={styles.attorneySummaryHeader} wrap={false}>
              <Text style={[styles.cell, styles.attorneySummaryNameCell]}>
                Attorney
              </Text>
              <Text style={[styles.cell, styles.attorneySummaryEntriesCell]}>
                Entries
              </Text>
              <Text style={[styles.cell, styles.attorneySummaryQuantityCell]}>
                Quantity
              </Text>
              <Text style={[styles.cell, styles.attorneySummaryTotalCell]}>
                Total ({invoice.firm.currencyCode})
              </Text>
            </View>
            {attorneySummary.map((attorney, index) => (
              <View
                key={attorney.name}
                style={[
                  styles.attorneySummaryRow,
                  index % 2 === 1 ? styles.tableRowAlt : {},
                ]}
                wrap={false}
              >
                <Text style={[styles.cell, styles.attorneySummaryNameCell]}>
                  {attorney.name}
                </Text>
                <Text style={[styles.cell, styles.attorneySummaryEntriesCell]}>
                  {attorney.entries}
                </Text>
                <Text style={[styles.cell, styles.attorneySummaryQuantityCell]}>
                  {formatInvoiceQuantity(attorney.quantity)}
                </Text>
                <Text style={[styles.cell, styles.attorneySummaryTotalCell]}>
                  {formatInvoiceMoney(attorney.total, invoice)}
                </Text>
              </View>
            ))}
          </View>
        ) : invoice.attorneys.length > 0 ? (
          invoice.attorneys.map((attorney) => (
            <Text key={attorney.name}>
              {attorney.name}
              {attorney.role ? ` - ${attorney.role}` : ""}
            </Text>
          ))
        ) : null}
      </View>
    </>
  );
}

export function InvoicePdfOverallTotal({ invoice }: InvoicePdfSectionProps) {
  const totalSummary = getInvoiceOverallTotalSummary(invoice);

  return (
    <View style={styles.overallTotalSection} wrap={false}>
      <Text style={styles.tableTitle}>Invoice Total</Text>
      <View style={styles.overallTotalLineRow}>
        <Text>Subtotal ({invoice.firm.currencyCode})</Text>
        <Text>{formatInvoiceMoney(totalSummary.subtotal, invoice)}</Text>
      </View>
      <View style={styles.overallTotalLineRow}>
        <Text>
          Tax
          {invoice.taxRate !== null
            ? ` (${formatInvoicePercent(invoice.taxRate)})`
            : ""}{" "}
          ({invoice.firm.currencyCode})
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
          Lawyer Responsible E-Signature
        </Text>
        <View style={styles.signatureBox}>
          {imageSource(invoice.responsibleAttorneySignatureImage) ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image
              src={imageSource(invoice.responsibleAttorneySignatureImage) ?? ""}
              style={styles.signatureImage}
            />
          ) : null}
          {invoice.responsibleAttorneySignature ? (
            <Text style={styles.signatureText}>
              {invoice.responsibleAttorneySignature}
            </Text>
          ) : null}
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
                <Text style={styles.paymentBankLabel}>Account Number</Text>
                <Text style={styles.paymentBankValue}>{account.accountNumber}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.bottomGrid} wrap={false}>
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
