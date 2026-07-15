import { StyleSheet } from "@react-pdf/renderer";

import { invoiceTheme } from "@/lib/invoice-theme";

const JEMA_ACCENT = "#000000";
const JEMA_INK = "#000000";
const JEMA_MUTED = "#000000";
const JEMA_HEADER_RULE = invoiceTheme.navy;
const JEMA_NAVY = "#000000";
const JEMA_RULE = invoiceTheme.rule;
const JEMA_SOFT = invoiceTheme.soft;
const JEMA_SOFT_STRONG = invoiceTheme.softStrong;
const JEMA_WATERMARK = invoiceTheme.accent;
const BODY_FONT_SIZE = 10;
const HEADING_FONT_SIZE = 12;
const TABLE_ROW_MIN_HEIGHT = 23;

export const invoicePdfStyles = StyleSheet.create({
  page: {
    position: "relative",
    paddingHorizontal: 42.5,
    paddingTop: 42.5,
    paddingBottom: 42.5,
    fontFamily: "Helvetica",
    fontSize: BODY_FONT_SIZE,
    color: JEMA_INK,
    backgroundColor: "#ffffff",
  },
  watermarkContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    transform: "rotate(-34deg)",
  },
  watermark: {
    color: JEMA_WATERMARK,
    opacity: 0.14,
    fontSize: 92,
    fontWeight: 800,
    letterSpacing: 0,
    lineHeight: 1,
    textTransform: "uppercase",
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
    marginBottom: 7.1,
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
  addressLine: {
    color: JEMA_MUTED,
    fontSize: BODY_FONT_SIZE,
    lineHeight: 1.35,
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
    color: JEMA_NAVY,
    fontSize: BODY_FONT_SIZE,
    fontWeight: 700,
    letterSpacing: 0.8,
    marginBottom: 3,
    marginTop: 0,
    textAlign: "right",
    textTransform: "uppercase",
  },
  headerLegalLabelAfterValue: {
    marginTop: 6,
  },
  headerLegalValueText: {
    color: JEMA_INK,
    fontSize: BODY_FONT_SIZE,
    lineHeight: 1.35,
    textAlign: "right",
  },
  headerLawyerList: {
    flexDirection: "column",
  },
  headerLawyerListTwoColumn: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    columnGap: 14.2,
  },
  headerLawyerListTwoColumnText: {
    width: 55.2,
  },
  kicker: {
    marginBottom: 3,
    color: JEMA_NAVY,
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: 0.8,
    textTransform: "uppercase",
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
    fontSize: BODY_FONT_SIZE,
    fontWeight: 700,
    width: 48,
  },
  titleMetaValue: {
    color: JEMA_INK,
    fontSize: BODY_FONT_SIZE,
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
    marginBottom: 3,
    color: JEMA_NAVY,
    fontSize: BODY_FONT_SIZE,
    fontWeight: 700,
    letterSpacing: 0.8,
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
    fontSize: BODY_FONT_SIZE,
    fontWeight: 700,
    textTransform: "uppercase",
  },
  reLineSubject: {
    color: JEMA_INK,
    fontSize: 12,
    fontWeight: 700,
  },
  matterStrip: {
    marginTop: 19.8,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  signatureSection: {
    marginTop: 34,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  signatureHeading: {
    marginBottom: 8,
    color: JEMA_INK,
    fontSize: BODY_FONT_SIZE,
    fontWeight: 700,
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
    fontSize: HEADING_FONT_SIZE,
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
    fontSize: BODY_FONT_SIZE,
    fontWeight: 700,
    borderBottomWidth: 1,
    borderBottomColor: JEMA_HEADER_RULE,
  },
  tableRow: {
    flexDirection: "row",
    minHeight: TABLE_ROW_MIN_HEIGHT,
    fontSize: 9,
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
  numericCell: {
    paddingHorizontal: 5,
  },
  dateCell: {
    width: "14%",
  },
  descriptionCell: {
    width: "36%",
  },
  descriptionCellNoAttorney: {
    width: "47%",
  },
  attorneyCell: {
    width: "11%",
  },
  qtyCell: {
    width: "12%",
    textAlign: "right",
  },
  rateCell: {
    width: "13%",
    textAlign: "right",
  },
  amountCell: {
    width: "14%",
    textAlign: "right",
  },
  subtotalRow: {
    flexDirection: "row",
    minHeight: TABLE_ROW_MIN_HEIGHT,
    borderBottomWidth: 0,
    backgroundColor: "#ffffff",
    fontWeight: 700,
  },
  taxRow: {
    flexDirection: "row",
    minHeight: TABLE_ROW_MIN_HEIGHT,
    backgroundColor: "#ffffff",
    fontWeight: 700,
  },
  lineItemSummaryPair: {
    flexDirection: "row",
    width: "42%",
    minHeight: TABLE_ROW_MIN_HEIGHT,
    marginLeft: "auto",
    borderBottomWidth: 0.5,
    borderBottomColor: JEMA_RULE,
  },
  lineItemSummaryLabel: {
    width: "50%",
  },
  lineItemSummaryAmount: {
    width: "50%",
    textAlign: "right",
  },
  lineDescription: {
    fontWeight: 700,
  },
  lineType: {
    marginTop: 3,
    color: JEMA_INK,
    fontSize: 9,
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
    minHeight: TABLE_ROW_MIN_HEIGHT,
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
    minHeight: TABLE_ROW_MIN_HEIGHT,
    paddingHorizontal: 8,
    paddingVertical: 7,
    backgroundColor: JEMA_HEADER_RULE,
    color: "#ffffff",
    fontSize: 12,
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
    paddingHorizontal: 17,
    paddingVertical: 14.2,
    backgroundColor: JEMA_SOFT,
    borderWidth: 0.5,
    borderColor: JEMA_RULE,
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
    fontSize: BODY_FONT_SIZE,
    fontWeight: 700,
    borderBottomWidth: 1,
    borderBottomColor: JEMA_HEADER_RULE,
  },
  statementLineRow: {
    flexDirection: "row",
    minHeight: TABLE_ROW_MIN_HEIGHT,
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
    alignItems: "center",
    justifyContent: "center",
    minHeight: TABLE_ROW_MIN_HEIGHT,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: JEMA_SOFT_STRONG,
    color: JEMA_NAVY,
    fontSize: BODY_FONT_SIZE,
    fontWeight: 700,
    textAlign: "center",
  },
  statementSubtotalRow: {
    flexDirection: "row",
    minHeight: TABLE_ROW_MIN_HEIGHT,
    backgroundColor: "#ffffff",
    borderBottomWidth: 0.5,
    borderBottomColor: JEMA_RULE,
    fontWeight: 700,
  },
  statementBalanceRow: {
    flexDirection: "row",
    minHeight: TABLE_ROW_MIN_HEIGHT,
    backgroundColor: JEMA_NAVY,
    color: "#ffffff",
    fontSize: 12,
    fontWeight: 700,
  },
  footer: {
    marginTop: "auto",
    paddingTop: 8,
    color: JEMA_MUTED,
    fontSize: BODY_FONT_SIZE,
    textAlign: "center",
  },
  pageNumber: {
    position: "absolute",
    right: 42,
    bottom: 24,
    color: JEMA_MUTED,
    fontSize: BODY_FONT_SIZE,
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
    fontSize: BODY_FONT_SIZE,
    fontWeight: 700,
    borderBottomWidth: 1,
    borderBottomColor: JEMA_HEADER_RULE,
  },
  attorneySummaryRow: {
    flexDirection: "row",
    minHeight: TABLE_ROW_MIN_HEIGHT,
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
