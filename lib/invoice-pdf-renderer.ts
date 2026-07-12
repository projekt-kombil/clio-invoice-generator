import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

import type {
  InvoiceDocumentData,
  InvoiceLineItem,
  InvoiceLineItemGroup,
} from "@/lib/invoice-document";
import { shouldShowDraftWatermark } from "@/lib/invoice-document";
import {
  formatInvoiceDate,
  formatInvoiceDiscount,
  formatInvoiceMoney,
  formatInvoicePercent,
  formatInvoiceQuantity,
} from "@/lib/invoice-formatting";

type PdfContent = Record<string, unknown>;

type PdfDocument = {
  getBuffer(): Promise<Uint8Array>;
};

type PdfMakeBrowser = {
  addVirtualFileSystem(vfs: Record<string, string>): void;
  createPdf(definition: PdfContent): PdfDocument;
};

const pdfMakeBrowser = pdfMake as PdfMakeBrowser;
let fontsLoaded = false;

function ensureFontsLoaded(): void {
  if (fontsLoaded) {
    return;
  }

  pdfMakeBrowser.addVirtualFileSystem(pdfFonts);
  fontsLoaded = true;
}

function sectionLabel(text: string): PdfContent {
  return {
    text,
    color: "#6b7280",
    bold: true,
    fontSize: 8,
    margin: [0, 0, 0, 8],
  };
}

function mutedText(text: string): PdfContent {
  return {
    text,
    color: "#6b7280",
    lineHeight: 1.25,
  };
}

function detailRow(label: string, value: string): PdfContent {
  return {
    columns: [
      { text: label, color: "#6b7280", width: "*" },
      { text: value, alignment: "right", width: "62%" },
    ],
    columnGap: 8,
    margin: [0, 0, 0, 6],
  };
}

function cardTable(content: PdfContent[]): PdfContent {
  return {
    table: {
      widths: ["*"],
      body: [[{ stack: content, margin: [14, 14, 14, 14] }]],
    },
    layout: {
      hLineColor: () => "#e5e7eb",
      vLineColor: () => "#e5e7eb",
      hLineWidth: () => 1,
      vLineWidth: () => 1,
      paddingLeft: () => 0,
      paddingRight: () => 0,
      paddingTop: () => 0,
      paddingBottom: () => 0,
    },
  };
}

function buildHeader(invoice: InvoiceDocumentData): PdfContent {
  const logo = invoice.firm.logoSrc?.startsWith("data:image/")
    ? {
        image: invoice.firm.logoSrc,
        width: 46,
        height: 46,
        fit: [46, 46],
      }
    : {
        text: invoice.firm.logoInitials,
        width: 46,
        height: 46,
        alignment: "center",
        color: "#ffffff",
        fillColor: "#111827",
        bold: true,
        fontSize: 14,
        margin: [0, 14, 0, 0],
      };

  return {
    columns: [
      {
        width: "58%",
        columns: [
          logo,
          {
            width: "*",
            stack: [
              { text: invoice.firm.name, bold: true, fontSize: 13, margin: [0, 0, 0, 4] },
              ...invoice.firm.addressLines.map(mutedText),
              mutedText(`${invoice.firm.taxIdLabel}: ${invoice.firm.taxId}`),
            ],
            margin: [12, 0, 0, 0],
          },
        ],
      },
      {
        width: "*",
        stack: [
          {
            text: "Tax Invoice",
            alignment: "right",
            color: "#6b7280",
            fontSize: 8,
            bold: true,
            margin: [0, 0, 0, 5],
          },
          { text: "Invoice", alignment: "right", bold: true, fontSize: 28 },
          {
            text: `#${invoice.invoiceNumber}`,
            alignment: "right",
            color: "#374151",
            fontSize: 11,
            margin: [0, 5, 0, 0],
          },
        ],
      },
    ],
    columnGap: 20,
    margin: [0, 0, 0, 24],
  };
}

function buildDivider(): PdfContent {
  return {
    canvas: [
      {
        type: "line",
        x1: 0,
        y1: 0,
        x2: 511,
        y2: 0,
        lineWidth: 1,
        lineColor: "#d1d5db",
      },
    ],
    margin: [0, 0, 0, 28],
  };
}

function buildSummary(invoice: InvoiceDocumentData): PdfContent {
  return {
    columns: [
      cardTable([
        sectionLabel("Bill To"),
        { text: invoice.client.name, bold: true, fontSize: 12, margin: [0, 0, 0, 4] },
        ...invoice.client.addressLines.map(mutedText),
      ]),
      cardTable([
        sectionLabel("Invoice Details"),
        detailRow("Invoice", `#${invoice.invoiceNumber}`),
        detailRow("Date", formatInvoiceDate(invoice.issuedAt)),
        detailRow("Due", formatInvoiceDate(invoice.dueAt)),
        detailRow("Reference", invoice.reference ?? ""),
        detailRow("Matter", invoice.matter.description ?? ""),
        detailRow("Matter No.", invoice.matter.number ?? ""),
      ]),
    ],
    columnGap: 20,
    margin: [0, 0, 0, 20],
  };
}

function buildMatterStrip(invoice: InvoiceDocumentData): PdfContent {
  return {
    table: {
      widths: [4, "*"],
      body: [
        [
          { text: "", fillColor: "#111827", border: [false, false, false, false] },
          {
            stack: [
              sectionLabel("Re / Subject"),
              {
                text: invoice.subject ?? invoice.matter.description ?? "Subject details pending",
                bold: true,
                margin: [0, 0, 0, 3],
              },
              invoice.matter.number ? mutedText(invoice.matter.number) : { text: "" },
            ],
            fillColor: "#f3f4f6",
            margin: [12, 12, 12, 12],
            border: [false, false, false, false],
          },
        ],
      ],
    },
    layout: "noBorders",
    margin: [0, 0, 0, 22],
  };
}

function lineItemDescription(item: InvoiceLineItem): PdfContent {
  const stack: PdfContent[] = [{ text: item.description }];

  if (item.note) {
    stack.push({
      text: item.note,
      color: "#6b7280",
      fontSize: 8,
      margin: [0, 3, 0, 0],
    });
  }

  return { stack };
}

function buildLineGroup(
  group: InvoiceLineItemGroup,
  invoice: InvoiceDocumentData,
): PdfContent | null {
  if (group.items.length === 0) {
    return null;
  }

  const header = ["Type", "Date", "Description", "Attorney", "Qty", "Rate", "Amount"].map(
    (text) => ({
      text,
      color: "#ffffff",
      bold: true,
      fontSize: 8,
      fillColor: "#111827",
      margin: [8, 8, 8, 8],
    }),
  );

  const rows = group.items.map((item) => [
    { text: item.type ?? "", margin: [8, 8, 8, 8] },
    { text: formatInvoiceDate(item.date), margin: [8, 8, 8, 8] },
    { ...lineItemDescription(item), margin: [8, 8, 8, 8] },
    { text: item.attorney ?? "", margin: [8, 8, 8, 8] },
    {
      text: formatInvoiceQuantity(item.quantity),
      alignment: "right",
      margin: [8, 8, 8, 8],
    },
    {
      text: formatInvoiceMoney(item.price, invoice),
      alignment: "right",
      margin: [8, 8, 8, 8],
    },
    {
      text: formatInvoiceMoney(item.total, invoice),
      alignment: "right",
      margin: [8, 8, 8, 8],
    },
  ]);

  return {
    stack: [
      sectionLabel(group.label),
      {
        table: {
          headerRows: 1,
          widths: ["10%", "12%", "32%", "14%", "8%", "12%", "12%"],
          body: [
            header,
            ...rows,
            [
              {
                text: `${group.label} Subtotal`,
                colSpan: 6,
                alignment: "right",
                bold: true,
                fillColor: "#f9fafb",
                margin: [8, 8, 8, 8],
              },
              {},
              {},
              {},
              {},
              {},
              {
                text: formatInvoiceMoney(group.subtotal, invoice),
                alignment: "right",
                bold: true,
                fillColor: "#f9fafb",
                margin: [8, 8, 8, 8],
              },
            ],
          ],
        },
        layout: {
          hLineColor: () => "#d1d5db",
          vLineColor: () => "#e5e7eb",
          hLineWidth: () => 1,
          vLineWidth: () => 0.5,
          paddingLeft: () => 0,
          paddingRight: () => 0,
          paddingTop: () => 0,
          paddingBottom: () => 0,
        },
      },
    ],
    margin: [0, 0, 0, 22],
  };
}

function buildAttorneyBlock(invoice: InvoiceDocumentData): PdfContent {
  const attorneyRows =
    invoice.attorneys.length > 0
      ? invoice.attorneys.map((attorney) => [
          { text: attorney.name, margin: [8, 7, 8, 7] },
          { text: attorney.role ?? "", margin: [8, 7, 8, 7] },
        ])
      : [[{ text: "Attorney details pending Clio field verification.", colSpan: 2 }, {}]];

  return {
    stack: [
      sectionLabel("Attorney Table"),
      {
        table: {
          widths: ["*", "*"],
          body: attorneyRows,
        },
        layout: {
          hLineColor: () => "#e5e7eb",
          vLineColor: () => "#e5e7eb",
          hLineWidth: () => 1,
          vLineWidth: () => 1,
        },
      },
    ],
    margin: [0, 0, 0, 20],
  };
}

function buildSignatureBlock(invoice: InvoiceDocumentData): PdfContent {
  const stack: PdfContent[] = [sectionLabel("Lawyer Responsible E-Signature")];

  if (invoice.responsibleAttorneySignatureImage?.startsWith("data:image/")) {
    stack.push({
      image: invoice.responsibleAttorneySignatureImage,
      width: 140,
      height: 48,
      fit: [140, 48],
      margin: [0, 0, 0, 6],
    });
  }

  stack.push({ text: invoice.responsibleAttorneySignature ?? "Signature pending." });

  return {
    stack,
    fillColor: "#f3f4f6",
    margin: [0, 0, 0, 20],
  };
}

function totalRow(label: string, value: string, isBalance = false): PdfContent {
  if (isBalance) {
    return {
      columns: [
        { text: label, width: "*" },
        { text: value, width: "auto", alignment: "right" },
      ],
      columnGap: 8,
      fillColor: "#111827",
      color: "#ffffff",
      bold: true,
      fontSize: 11,
      margin: [0, 5, 0, 0],
    };
  }

  return {
    columns: [
      { text: label, width: "*" },
      { text: value, width: "auto", alignment: "right" },
    ],
    columnGap: 8,
    margin: [0, 0, 0, 5],
  };
}

function buildAccountSummary(invoice: InvoiceDocumentData): PdfContent {
  const rows: PdfContent[] = [sectionLabel("Account Summary")];

  if (invoice.services.items.length > 0) {
    rows.push(totalRow("Services Subtotal", formatInvoiceMoney(invoice.services.subtotal, invoice)));
  }

  if (invoice.expenses.items.length > 0) {
    rows.push(totalRow("Expenses Subtotal", formatInvoiceMoney(invoice.expenses.subtotal, invoice)));
  }

  if (invoice.discount) {
    rows.push(totalRow("Discount", formatInvoiceDiscount(invoice.discount, invoice)));
  }

  rows.push(totalRow("Tax Rate", formatInvoicePercent(invoice.taxRate)));
  rows.push(totalRow("Tax Amount", formatInvoiceMoney(invoice.tax, invoice)));

  if (invoice.accountSummary.interest) {
    rows.push(totalRow("Interest", formatInvoiceMoney(invoice.accountSummary.interest, invoice)));
  }

  rows.push(totalRow("Total", formatInvoiceMoney(invoice.total, invoice)));
  rows.push(totalRow("Paid", formatInvoiceMoney(invoice.paid, invoice)));
  rows.push(totalRow("Balance Due", formatInvoiceMoney(invoice.balance, invoice), true));

  return { stack: rows };
}

function buildBottomGrid(invoice: InvoiceDocumentData): PdfContent {
  return {
    columns: [
      {
        width: "52%",
        stack: [
          sectionLabel("Firm Bank Account Details"),
          ...invoice.firm.bankAccountLines.map(mutedText),
          mutedText(`Please reference invoice #${invoice.invoiceNumber}.`),
        ],
      },
      {
        width: "36%",
        stack: [buildAccountSummary(invoice)],
      },
    ],
    columnGap: 60,
    margin: [0, 2, 0, 24],
  };
}

function buildDraftWatermark(invoice: InvoiceDocumentData): PdfContent | undefined {
  if (!shouldShowDraftWatermark(invoice)) {
    return undefined;
  }

  return {
    text: "DRAFT",
    color: "#9ca3af",
    opacity: 0.16,
    bold: true,
    fontSize: 92,
    absolutePosition: { x: 98, y: 350 },
    angle: -34,
  };
}

function compactContent(content: Array<PdfContent | null | undefined>): PdfContent[] {
  return content.filter((item): item is PdfContent => Boolean(item));
}

function buildDocumentDefinition(invoice: InvoiceDocumentData): PdfContent {
  return {
    pageSize: "A4",
    pageMargins: [42, 42, 42, 46],
    info: {
      title: `Invoice ${invoice.invoiceNumber}`,
      author: "Clio Invoice Generator",
      subject: `Invoice ${invoice.invoiceNumber}`,
    },
    defaultStyle: {
      font: "Roboto",
      fontSize: 9,
      color: "#111827",
    },
    background: () => buildDraftWatermark(invoice),
    footer: (currentPage: number, pageCount: number) => ({
      columns: [
        {
          text: invoice.firm.footerLines.join(" "),
          color: "#6b7280",
          fontSize: 8,
          margin: [42, 10, 0, 0],
        },
        {
          text: `Page ${currentPage} of ${pageCount}`,
          alignment: "right",
          color: "#6b7280",
          fontSize: 8,
          margin: [0, 10, 42, 0],
        },
      ],
    }),
    content: compactContent([
      buildHeader(invoice),
      buildDivider(),
      buildSummary(invoice),
      buildMatterStrip(invoice),
      buildLineGroup(invoice.services, invoice),
      buildLineGroup(invoice.expenses, invoice),
      buildAttorneyBlock(invoice),
      buildSignatureBlock(invoice),
      buildBottomGrid(invoice),
    ]),
  };
}

export async function renderInvoicePdf(
  invoice: InvoiceDocumentData,
): Promise<ArrayBuffer> {
  ensureFontsLoaded();

  const buffer = await pdfMakeBrowser.createPdf(buildDocumentDefinition(invoice)).getBuffer();
  const bytes = new Uint8Array(buffer.byteLength);

  bytes.set(buffer);

  return bytes.buffer;
}
