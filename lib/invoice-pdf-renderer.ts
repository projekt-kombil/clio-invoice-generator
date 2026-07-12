import type {
  InvoiceDocumentData,
  InvoiceLineItem,
  InvoiceLineItemGroup,
} from "@/lib/invoice-document";
import {
  formatInvoiceDate,
  formatInvoiceDiscount,
  formatInvoiceMoney,
  formatInvoicePercent,
  formatInvoiceQuantity,
} from "@/lib/invoice-formatting";
import { shouldShowDraftWatermark } from "@/lib/invoice-document";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 42;
const LINE_HEIGHT = 13;
const FONT_SIZE = 9;
const TITLE_SIZE = 22;

type PdfPage = {
  commands: string[];
};

type PdfState = {
  pages: PdfPage[];
  page: PdfPage;
  y: number;
};

function sanitizePdfText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7e]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function text(page: PdfPage, value: string, x: number, y: number, size = FONT_SIZE): void {
  if (!value) {
    return;
  }

  page.commands.push(
    `BT /F1 ${size} Tf ${x.toFixed(2)} ${y.toFixed(2)} Td (${sanitizePdfText(value)}) Tj ET`,
  );
}

function line(page: PdfPage, x1: number, y1: number, x2: number, y2: number): void {
  page.commands.push(
    `${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`,
  );
}

function wrapText(value: string, maxChars: number): string[] {
  const words = value.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;

    if (next.length <= maxChars) {
      current = next;
      continue;
    }

    if (current) {
      lines.push(current);
    }

    current = word.length > maxChars ? `${word.slice(0, maxChars - 1)}-` : word;
  }

  if (current) {
    lines.push(current);
  }

  return lines.length > 0 ? lines : [""];
}

function createState(): PdfState {
  const page: PdfPage = { commands: [] };
  return {
    pages: [page],
    page,
    y: PAGE_HEIGHT - MARGIN,
  };
}

function addPage(state: PdfState): void {
  const page: PdfPage = { commands: [] };
  state.pages.push(page);
  state.page = page;
  state.y = PAGE_HEIGHT - MARGIN;
}

function ensureSpace(state: PdfState, height: number): void {
  if (state.y - height < MARGIN) {
    addPage(state);
  }
}

function addTextLine(state: PdfState, value: string, size = FONT_SIZE, indent = 0): void {
  ensureSpace(state, LINE_HEIGHT);
  text(state.page, value, MARGIN + indent, state.y, size);
  state.y -= LINE_HEIGHT;
}

function addWrappedText(
  state: PdfState,
  value: string,
  maxChars: number,
  size = FONT_SIZE,
  indent = 0,
): void {
  for (const wrappedLine of wrapText(value, maxChars)) {
    addTextLine(state, wrappedLine, size, indent);
  }
}

function addSectionTitle(state: PdfState, value: string): void {
  ensureSpace(state, LINE_HEIGHT * 2);
  state.y -= 6;
  text(state.page, value.toUpperCase(), MARGIN, state.y, 10);
  state.y -= 8;
  line(state.page, MARGIN, state.y, PAGE_WIDTH - MARGIN, state.y);
  state.y -= 12;
}

function addKeyValue(state: PdfState, label: string, value: string): void {
  ensureSpace(state, LINE_HEIGHT);
  text(state.page, label, MARGIN, state.y, FONT_SIZE);
  text(state.page, value, MARGIN + 130, state.y, FONT_SIZE);
  state.y -= LINE_HEIGHT;
}

function addHeader(state: PdfState, invoice: InvoiceDocumentData): void {
  text(state.page, invoice.firm.name, MARGIN, state.y, 14);
  state.y -= 16;

  for (const addressLine of invoice.firm.addressLines) {
    addTextLine(state, addressLine);
  }

  addTextLine(state, `${invoice.firm.taxIdLabel}: ${invoice.firm.taxId}`);

  text(state.page, "Tax Invoice", 390, PAGE_HEIGHT - MARGIN, 10);
  text(state.page, "Invoice", 390, PAGE_HEIGHT - MARGIN - 22, TITLE_SIZE);
  text(state.page, `#${invoice.invoiceNumber}`, 390, PAGE_HEIGHT - MARGIN - 42, 12);

  if (shouldShowDraftWatermark(invoice)) {
    text(state.page, "DRAFT", 250, 420, 36);
  }

  state.y -= 16;
}

function addInvoiceDetails(state: PdfState, invoice: InvoiceDocumentData): void {
  addSectionTitle(state, "Bill To");
  addTextLine(state, invoice.client.name, 11);

  for (const addressLine of invoice.client.addressLines) {
    addTextLine(state, addressLine);
  }

  state.y -= 8;
  addSectionTitle(state, "Invoice Details");
  addKeyValue(state, "Invoice", `#${invoice.invoiceNumber}`);
  addKeyValue(state, "Date", formatInvoiceDate(invoice.issuedAt));
  addKeyValue(state, "Due", formatInvoiceDate(invoice.dueAt));
  addKeyValue(state, "Reference", invoice.reference ?? "");
  addKeyValue(state, "Matter", invoice.matter.description ?? "");
  addKeyValue(state, "Matter No.", invoice.matter.number ?? "");

  if (invoice.subject ?? invoice.matter.description) {
    state.y -= 8;
    addSectionTitle(state, "Re / Subject");
    addWrappedText(state, invoice.subject ?? invoice.matter.description ?? "", 90, 10);
  }
}

function addLineItem(state: PdfState, item: InvoiceLineItem, invoice: InvoiceDocumentData): void {
  const description = item.note
    ? `${item.description} (${item.note})`
    : item.description;
  const descriptionLines = wrapText(description, 46);
  const rowHeight = Math.max(descriptionLines.length, 1) * LINE_HEIGHT;

  ensureSpace(state, rowHeight + 2);

  text(state.page, formatInvoiceDate(item.date), MARGIN, state.y);
  text(state.page, item.type ?? "", MARGIN + 58, state.y);
  text(state.page, item.attorney ?? "", MARGIN + 360, state.y);
  text(state.page, formatInvoiceQuantity(item.quantity), MARGIN + 430, state.y);
  text(state.page, formatInvoiceMoney(item.total, invoice), MARGIN + 468, state.y);

  let descriptionY = state.y;
  for (const lineText of descriptionLines) {
    text(state.page, lineText, MARGIN + 120, descriptionY);
    descriptionY -= LINE_HEIGHT;
  }

  state.y -= rowHeight;
}

function addLineGroup(
  state: PdfState,
  group: InvoiceLineItemGroup,
  invoice: InvoiceDocumentData,
): void {
  if (group.items.length === 0) {
    return;
  }

  addSectionTitle(state, group.label);
  addTextLine(state, "Date       Type        Description                                 Attorney     Qty    Amount");

  for (const item of group.items) {
    addLineItem(state, item, invoice);
  }

  ensureSpace(state, LINE_HEIGHT * 2);
  line(state.page, MARGIN, state.y, PAGE_WIDTH - MARGIN, state.y);
  state.y -= LINE_HEIGHT;
  text(state.page, `${group.label} Subtotal`, MARGIN + 330, state.y);
  text(state.page, formatInvoiceMoney(group.subtotal, invoice), MARGIN + 468, state.y);
  state.y -= LINE_HEIGHT;
}

function addClosingBlocks(state: PdfState, invoice: InvoiceDocumentData): void {
  addSectionTitle(state, "Attorney Table");

  if (invoice.attorneys.length > 0) {
    for (const attorney of invoice.attorneys) {
      addTextLine(state, `${attorney.name}${attorney.role ? ` - ${attorney.role}` : ""}`);
    }
  } else {
    addTextLine(state, "Attorney details pending Clio field verification.");
  }

  state.y -= 8;
  addSectionTitle(state, "Lawyer Responsible E-Signature");
  addTextLine(state, invoice.responsibleAttorneySignature ?? "Signature pending.");

  state.y -= 8;
  addSectionTitle(state, "Firm Bank Account Details");

  for (const bankLine of invoice.firm.bankAccountLines) {
    addTextLine(state, bankLine);
  }

  addTextLine(state, `Please reference invoice #${invoice.invoiceNumber}.`);
}

function addTotals(state: PdfState, invoice: InvoiceDocumentData): void {
  addSectionTitle(state, "Account Summary");
  addKeyValue(state, "Services Subtotal", formatInvoiceMoney(invoice.services.subtotal, invoice));
  addKeyValue(state, "Expenses Subtotal", formatInvoiceMoney(invoice.expenses.subtotal, invoice));
  addKeyValue(state, "Discount", formatInvoiceDiscount(invoice.discount, invoice));
  addKeyValue(state, "Tax Rate", formatInvoicePercent(invoice.taxRate));
  addKeyValue(state, "Tax Amount", formatInvoiceMoney(invoice.tax, invoice));
  addKeyValue(state, "Interest", formatInvoiceMoney(invoice.accountSummary.interest, invoice));
  addKeyValue(state, "Total", formatInvoiceMoney(invoice.total, invoice));
  addKeyValue(state, "Paid", formatInvoiceMoney(invoice.paid, invoice));
  addKeyValue(state, "Balance Due", formatInvoiceMoney(invoice.balance, invoice));
}

function addFooters(state: PdfState, invoice: InvoiceDocumentData): void {
  state.pages.forEach((page, index) => {
    line(page, MARGIN, 34, PAGE_WIDTH - MARGIN, 34);
    text(page, invoice.firm.footerLines.join(" "), MARGIN, 22, 8);
    text(page, `Page ${index + 1} of ${state.pages.length}`, PAGE_WIDTH - MARGIN - 60, 22, 8);
  });
}

function buildPageContent(page: PdfPage): string {
  return [
    "q",
    "0.25 w",
    ...page.commands,
    "Q",
  ].join("\n");
}

function buildPdfDocument(pages: PdfPage[]): string {
  const objects: string[] = [];
  const pageObjectNumbers: number[] = [];

  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  objects.push("");
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

  for (const page of pages) {
    const content = buildPageContent(page);
    const contentObjectNumber = objects.length + 1;

    objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);

    const pageObjectNumber = objects.length + 1;
    pageObjectNumbers.push(pageObjectNumber);
    objects.push(
      [
        "<< /Type /Page",
        "/Parent 2 0 R",
        `/MediaBox [0 0 ${PAGE_WIDTH.toFixed(2)} ${PAGE_HEIGHT.toFixed(2)}]`,
        "/Resources << /Font << /F1 3 0 R >> >>",
        `/Contents ${contentObjectNumber} 0 R`,
        ">>",
      ].join(" "),
    );
  }

  objects[1] = [
    "<< /Type /Pages",
    `/Kids [${pageObjectNumbers.map((objectNumber) => `${objectNumber} 0 R`).join(" ")}]`,
    `/Count ${pageObjectNumbers.length}`,
    ">>",
  ].join(" ");

  let pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";

  for (const offset of offsets.slice(1)) {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }

  pdf += [
    "trailer",
    `<< /Size ${objects.length + 1} /Root 1 0 R >>`,
    "startxref",
    String(xrefOffset),
    "%%EOF",
    "",
  ].join("\n");

  return pdf;
}

export function renderInvoicePdf(invoice: InvoiceDocumentData): ArrayBuffer {
  const state = createState();

  addHeader(state, invoice);
  addInvoiceDetails(state, invoice);
  addLineGroup(state, invoice.services, invoice);
  addLineGroup(state, invoice.expenses, invoice);
  addClosingBlocks(state, invoice);
  addTotals(state, invoice);
  addFooters(state, invoice);

  const pdf = buildPdfDocument(state.pages);
  const bytes = new TextEncoder().encode(pdf);

  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}
