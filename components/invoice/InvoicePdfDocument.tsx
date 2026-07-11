import "server-only";

import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { InvoiceDocumentData } from "@/lib/invoice-document";

type InvoicePdfDocumentProps = {
  invoice: InvoiceDocumentData;
};

const styles = StyleSheet.create({
  page: {
    padding: 42,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#111827",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
  },
  brand: {
    flexDirection: "row",
    width: "55%",
  },
  logo: {
    width: 46,
    height: 46,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111827",
    color: "#ffffff",
    fontSize: 14,
    fontWeight: 700,
  },
  firmName: {
    marginBottom: 4,
    fontSize: 13,
    fontWeight: 700,
  },
  mutedText: {
    color: "#6b7280",
    lineHeight: 1.45,
  },
  invoiceTitleBlock: {
    alignItems: "flex-end",
  },
  kicker: {
    marginBottom: 5,
    color: "#6b7280",
    fontSize: 8,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
  },
  invoiceNumber: {
    marginTop: 5,
    fontSize: 11,
    color: "#374151",
  },
  summaryGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 28,
  },
  infoBox: {
    width: "48%",
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  sectionLabel: {
    marginBottom: 8,
    color: "#6b7280",
    fontSize: 8,
    fontWeight: 700,
    textTransform: "uppercase",
  },
  primaryText: {
    marginBottom: 4,
    fontSize: 12,
    fontWeight: 700,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  detailLabel: {
    color: "#6b7280",
  },
  detailValue: {
    maxWidth: "62%",
    textAlign: "right",
  },
  matterStrip: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#f3f4f6",
    borderLeftWidth: 4,
    borderLeftColor: "#111827",
  },
  matterTitle: {
    marginBottom: 3,
    fontWeight: 700,
  },
  table: {
    marginTop: 22,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#111827",
    color: "#ffffff",
    fontSize: 8,
    fontWeight: 700,
  },
  tableRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  cell: {
    padding: 8,
  },
  dateCell: {
    width: "14%",
  },
  descriptionCell: {
    width: "42%",
  },
  qtyCell: {
    width: "10%",
    textAlign: "right",
  },
  rateCell: {
    width: "12%",
    textAlign: "right",
  },
  taxCell: {
    width: "10%",
    textAlign: "right",
  },
  amountCell: {
    width: "12%",
    textAlign: "right",
  },
  lineType: {
    marginTop: 3,
    color: "#6b7280",
    fontSize: 8,
  },
  bottomGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
  },
  paymentBlock: {
    width: "52%",
    paddingTop: 4,
  },
  totals: {
    width: "36%",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  balanceRow: {
    marginTop: 5,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#111827",
    color: "#ffffff",
    fontSize: 11,
    fontWeight: 700,
  },
  footer: {
    position: "absolute",
    left: 42,
    right: 42,
    bottom: 28,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    color: "#6b7280",
    fontSize: 8,
  },
});

function formatDate(value: string | null): string {
  return value ?? "";
}

function formatMoney(value: string | number | null): string {
  if (value === null) {
    return "";
  }

  const amount = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(amount)) {
    return String(value);
  }

  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
  }).format(amount);
}

function formatQuantity(value: number | null): string {
  if (value === null) {
    return "";
  }

  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function InvoicePdfDocument({ invoice }: InvoicePdfDocumentProps) {
  return (
    <Document
      author="Clio Invoice Generator"
      subject={`Invoice ${invoice.invoiceNumber}`}
      title={`Invoice ${invoice.invoiceNumber}`}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Text>IG</Text>
            </View>
            <View>
              <Text style={styles.firmName}>Invoice Generator</Text>
              <Text style={styles.mutedText}>Firm details pending</Text>
              <Text style={styles.mutedText}>
                Logo and contact details will be added later.
              </Text>
            </View>
          </View>
          <View style={styles.invoiceTitleBlock}>
            <Text style={styles.kicker}>Tax Invoice</Text>
            <Text style={styles.title}>Invoice</Text>
            <Text style={styles.invoiceNumber}>#{invoice.invoiceNumber}</Text>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.infoBox}>
            <Text style={styles.sectionLabel}>Bill To</Text>
            <Text style={styles.primaryText}>{invoice.client.name}</Text>
            {invoice.client.addressLines.length > 0 ? (
              invoice.client.addressLines.map((line) => (
                <Text key={line} style={styles.mutedText}>
                  {line}
                </Text>
              ))
            ) : (
              <Text style={styles.mutedText}>Client address pending.</Text>
            )}
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
                {formatDate(invoice.issuedAt)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Due</Text>
              <Text style={styles.detailValue}>{formatDate(invoice.dueAt)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Matter</Text>
              <Text style={styles.detailValue}>
                {invoice.matter.description ?? ""}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Matter No.</Text>
              <Text style={styles.detailValue}>
                {invoice.matter.number ?? ""}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.matterStrip}>
          <Text style={styles.matterTitle}>
            {invoice.matter.description ?? "Matter details pending"}
          </Text>
          {invoice.matter.number ? (
            <Text style={styles.mutedText}>{invoice.matter.number}</Text>
          ) : null}
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.cell, styles.dateCell]}>Date</Text>
            <Text style={[styles.cell, styles.descriptionCell]}>
              Description
            </Text>
            <Text style={[styles.cell, styles.qtyCell]}>Qty</Text>
            <Text style={[styles.cell, styles.rateCell]}>Rate</Text>
            <Text style={[styles.cell, styles.taxCell]}>Tax</Text>
            <Text style={[styles.cell, styles.amountCell]}>Amount</Text>
          </View>
          {invoice.items.length > 0 ? (
            invoice.items.map((item) => (
              <View key={item.id} style={styles.tableRow} wrap={false}>
                <Text style={[styles.cell, styles.dateCell]}>
                  {formatDate(item.date)}
                </Text>
                <View style={[styles.cell, styles.descriptionCell]}>
                  <Text>{item.description}</Text>
                  {item.type ? (
                    <Text style={styles.lineType}>{item.type}</Text>
                  ) : null}
                  {item.note ? (
                    <Text style={styles.lineType}>{item.note}</Text>
                  ) : null}
                </View>
                <Text style={[styles.cell, styles.qtyCell]}>
                  {formatQuantity(item.quantity)}
                </Text>
                <Text style={[styles.cell, styles.rateCell]}>
                  {formatMoney(item.price)}
                </Text>
                <Text style={[styles.cell, styles.taxCell]}>
                  {formatMoney(item.tax)}
                </Text>
                <Text style={[styles.cell, styles.amountCell]}>
                  {formatMoney(item.total)}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <Text style={[styles.cell, styles.descriptionCell]}>
                No line items were returned for this bill.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.bottomGrid}>
          <View style={styles.paymentBlock}>
            <Text style={styles.sectionLabel}>Payment Instructions</Text>
            <Text style={styles.mutedText}>
              Payment instructions will be added later.
            </Text>
            <Text style={styles.mutedText}>
              Please reference invoice #{invoice.invoiceNumber}.
            </Text>
          </View>

          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text>Tax</Text>
              <Text>{formatMoney(invoice.tax)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text>Total</Text>
              <Text>{formatMoney(invoice.total)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text>Paid</Text>
              <Text>{formatMoney(invoice.paid)}</Text>
            </View>
            <View style={styles.balanceRow}>
              <Text>Balance Due</Text>
              <Text>{formatMoney(invoice.balance)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>
          Thank you for your business. Generated from Clio bill data.
        </Text>
      </Page>
    </Document>
  );
}

export async function renderInvoicePdf(
  invoice: InvoiceDocumentData,
): Promise<Buffer> {
  return renderToBuffer(<InvoicePdfDocument invoice={invoice} />);
}
