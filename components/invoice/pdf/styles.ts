import { StyleSheet } from "@react-pdf/renderer";

import { invoiceTheme } from "@/lib/invoice-theme";

const JEMA_ACCENT = invoiceTheme.accent;
const JEMA_INK = invoiceTheme.ink;
const JEMA_MUTED = invoiceTheme.muted;
const JEMA_NAVY = invoiceTheme.navy;
const JEMA_RULE = invoiceTheme.rule;
const JEMA_SOFT = invoiceTheme.soft;
const JEMA_SOFT_STRONG = invoiceTheme.softStrong;

export const invoicePdfStyles = StyleSheet.create({
  page: {
    position: "relative",
    paddingHorizontal: 42.5,
    paddingTop: 42.5,
    paddingBottom: 42.5,
    fontFamily: "Helvetica",
    fontSize: 8,
    color: JEMA_INK,
    backgroundColor: "#ffffff",
  },
  watermark: {
    position: "absolute",
    top: "42%",
    left: 76,
    color: JEMA_ACCENT,
    opacity: 0.14,
    fontSize: 92,
    fontWeight: 700,
    textTransform: "uppercase",
    transform: "rotate(-34deg)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 22.7,
  },
  brand: {
    flexDirection: "column",
    width: 351.5,
  },
  logo: {
    width: 46,
    height: 46,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: JEMA_NAVY,
    color: JEMA_NAVY,
    fontSize: 14,
    fontWeight: 700,
  },
  logoImage: {
    width: 351.5,
    maxHeight: 68,
    marginBottom: 14.2,
    objectFit: "contain",
  },
  firmName: {
    marginBottom: 4,
    fontSize: 13,
    fontWeight: 700,
  },
  mutedText: {
    color: JEMA_MUTED,
    lineHeight: 1.45,
  },
  firmAddress: {
    marginTop: 0,
  },
  clientAddress: {
    marginTop: 19.8,
  },
  invoiceTitleBlock: {
    alignItems: "flex-end",
    width: 153,
  },
  headerLegalTeam: {
    marginTop: 34,
    marginBottom: 22.7,
    width: 124.7,
  },
  headerLegalLabel: {
    color: JEMA_INK,
    fontSize: 8,
    fontWeight: 700,
    marginTop: 3,
    textAlign: "right",
  },
  headerLegalValueText: {
    color: JEMA_INK,
    fontSize: 8,
    lineHeight: 1.35,
    textAlign: "right",
  },
  kicker: {
    marginBottom: 2,
    color: JEMA_ACCENT,
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
  },
  invoiceTaxId: {
    marginTop: 1,
    color: JEMA_NAVY,
    fontSize: 8,
    fontWeight: 700,
  },
  titleMeta: {
    marginTop: 7.5,
    width: 153,
  },
  titleMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2.3,
  },
  titleMetaLabel: {
    color: JEMA_INK,
    fontSize: 8,
    fontWeight: 700,
    width: 48,
  },
  titleMetaValue: {
    color: JEMA_INK,
    fontSize: 8,
    width: 100,
    textAlign: "right",
  },
  summaryGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 28.3,
  },
  infoBox: {
    width: "48%",
    minHeight: 107.7,
    padding: 17,
    borderWidth: 1,
    borderColor: JEMA_RULE,
    backgroundColor: JEMA_SOFT,
  },
  sectionLabel: {
    marginBottom: 8,
    color: JEMA_NAVY,
    fontSize: 8,
    fontWeight: 700,
    textTransform: "uppercase",
  },
  primaryText: {
    marginBottom: 4,
    fontSize: 10,
    fontWeight: 700,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  detailLabel: {
    color: JEMA_MUTED,
  },
  detailValue: {
    maxWidth: "62%",
    textAlign: "right",
  },
  reLine: {
    marginTop: 17,
    marginBottom: 5.7,
    color: JEMA_INK,
    fontWeight: 400,
  },
  reLineLabel: {
    color: JEMA_NAVY,
    fontSize: 8,
    fontWeight: 700,
    textTransform: "uppercase",
  },
  reLineSubject: {
    color: JEMA_INK,
    fontSize: 10,
    fontWeight: 700,
  },
  matterStrip: {
    marginTop: 19.8,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  matterTitle: {
    color: JEMA_INK,
    fontWeight: 400,
  },
  matterLabel: {
    fontWeight: 700,
  },
  tableTitle: {
    marginBottom: 5,
    color: JEMA_ACCENT,
    fontSize: 10,
    fontWeight: 700,
  },
  table: {
    marginTop: 0,
  },
  tableSection: {
    marginTop: 17,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: JEMA_SOFT_STRONG,
    color: JEMA_NAVY,
    fontSize: 8,
    fontWeight: 700,
    borderBottomWidth: 1,
    borderBottomColor: JEMA_ACCENT,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: JEMA_RULE,
  },
  tableRowAlt: {
    backgroundColor: JEMA_SOFT,
  },
  cell: {
    paddingHorizontal: 3.8,
    paddingVertical: 5.2,
  },
  dateCell: {
    width: "12%",
  },
  descriptionCell: {
    width: "40%",
  },
  attorneyCell: {
    width: "14%",
  },
  qtyCell: {
    width: "8%",
    textAlign: "right",
  },
  rateCell: {
    width: "12%",
    textAlign: "right",
  },
  amountCell: {
    width: "14%",
    textAlign: "right",
  },
  subtotalRow: {
    flexDirection: "row",
    borderTopWidth: 0.5,
    borderTopColor: JEMA_RULE,
    borderBottomWidth: 0,
    backgroundColor: "#ffffff",
    fontWeight: 700,
  },
  taxRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: JEMA_RULE,
    backgroundColor: "#ffffff",
    fontWeight: 700,
  },
  subtotalLabelCell: {
    width: "86%",
    textAlign: "right",
  },
  lineDescription: {
    fontWeight: 700,
  },
  lineType: {
    marginTop: 3,
    color: JEMA_INK,
    fontSize: 8,
  },
  bottomGrid: {
    marginTop: 22,
  },
  overallTotalSection: {
    width: 215,
    marginLeft: "auto",
    marginTop: 17,
  },
  overallTotalLineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: JEMA_RULE,
    backgroundColor: "#ffffff",
    color: JEMA_INK,
    fontWeight: 700,
  },
  overallTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 7,
    backgroundColor: JEMA_NAVY,
    color: "#ffffff",
    fontSize: 10,
    fontWeight: 700,
  },
  paymentDetails: {
    marginTop: 22.7,
  },
  paymentInstruction: {
    marginBottom: 14.2,
    color: JEMA_INK,
    fontWeight: 700,
  },
  paymentBankGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  paymentBankColumn: {
    width: "47%",
  },
  paymentBankRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5.7,
  },
  paymentBankLabel: {
    color: JEMA_INK,
    fontWeight: 700,
  },
  paymentBankValue: {
    color: JEMA_INK,
    maxWidth: "58%",
    textAlign: "right",
  },
  totals: {
    width: "100%",
  },
  accountStatementTable: {
    borderWidth: 0,
  },
  statementHeaderRow: {
    flexDirection: "row",
    backgroundColor: JEMA_SOFT_STRONG,
    color: JEMA_NAVY,
    fontSize: 8,
    fontWeight: 700,
    borderBottomWidth: 1,
    borderBottomColor: JEMA_ACCENT,
  },
  statementLineRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: JEMA_RULE,
  },
  statementInvoiceNumberCell: {
    width: "18%",
  },
  statementDueOnCell: {
    width: "16%",
  },
  statementMoneyCell: {
    width: "22%",
    textAlign: "right",
  },
  statementSummaryLabelCell: {
    width: "78%",
    textAlign: "right",
  },
  statementSectionRow: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: JEMA_SOFT_STRONG,
    color: JEMA_NAVY,
    fontSize: 8,
    fontWeight: 700,
  },
  statementSubtotalRow: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderBottomWidth: 0.5,
    borderBottomColor: JEMA_RULE,
    fontWeight: 700,
  },
  statementBalanceRow: {
    flexDirection: "row",
    backgroundColor: JEMA_NAVY,
    color: "#ffffff",
    fontSize: 11,
    fontWeight: 700,
  },
  footer: {
    marginTop: "auto",
    paddingTop: 8,
    color: JEMA_MUTED,
    fontSize: 8,
    textAlign: "center",
  },
  pageNumber: {
    position: "absolute",
    right: 42,
    bottom: 24,
    color: JEMA_MUTED,
    fontSize: 8,
    textAlign: "right",
  },
  signatureImage: {
    width: 140,
    height: 48,
    objectFit: "contain",
    marginBottom: 6,
  },
  signatureBox: {
    width: 220,
    minHeight: 48,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: JEMA_RULE,
  },
  signatureText: {
    color: JEMA_INK,
    fontWeight: 700,
  },
  attorneySummaryTable: {
    borderWidth: 0,
  },
  attorneySummaryHeader: {
    flexDirection: "row",
    backgroundColor: JEMA_SOFT_STRONG,
    color: JEMA_NAVY,
    fontSize: 8,
    fontWeight: 700,
    borderBottomWidth: 1,
    borderBottomColor: JEMA_ACCENT,
  },
  attorneySummaryRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: JEMA_RULE,
  },
  attorneySummaryNameCell: {
    width: "52%",
  },
  attorneySummaryEntriesCell: {
    width: "14%",
    textAlign: "right",
  },
  attorneySummaryQuantityCell: {
    width: "14%",
    textAlign: "right",
  },
  attorneySummaryTotalCell: {
    width: "20%",
    textAlign: "right",
  },
});
