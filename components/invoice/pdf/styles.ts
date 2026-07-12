import { StyleSheet } from "@react-pdf/renderer";

export const invoicePdfStyles = StyleSheet.create({
  page: {
    position: "relative",
    paddingHorizontal: 42,
    paddingTop: 42,
    paddingBottom: 42,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#111827",
    backgroundColor: "#ffffff",
  },
  watermark: {
    position: "absolute",
    top: "42%",
    left: 76,
    color: "#9ca3af",
    opacity: 0.16,
    fontSize: 92,
    fontWeight: 700,
    textTransform: "uppercase",
    transform: "rotate(-34deg)",
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
  logoImage: {
    width: 46,
    height: 46,
    marginRight: 12,
    objectFit: "contain",
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
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  tableSection: {
    marginTop: 22,
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
    width: "12%",
  },
  typeCell: {
    width: "12%",
  },
  descriptionCell: {
    width: "32%",
  },
  attorneyCell: {
    width: "14%",
  },
  qtyCell: {
    width: "10%",
    textAlign: "right",
  },
  rateCell: {
    width: "12%",
    textAlign: "right",
  },
  amountCell: {
    width: "12%",
    textAlign: "right",
  },
  subtotalRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#d1d5db",
    backgroundColor: "#f9fafb",
    fontWeight: 700,
  },
  subtotalLabelCell: {
    width: "88%",
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
    marginTop: 24,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    color: "#6b7280",
    fontSize: 8,
  },
  pageNumber: {
    position: "absolute",
    right: 42,
    bottom: 24,
    color: "#6b7280",
    fontSize: 8,
    textAlign: "right",
  },
  signatureImage: {
    width: 140,
    height: 48,
    objectFit: "contain",
    marginBottom: 6,
  },
});
