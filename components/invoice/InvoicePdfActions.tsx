"use client";

import { useState } from "react";

import type { InvoiceDocumentData } from "@/lib/invoice-document";

type InvoicePdfActionsProps = {
  invoice: InvoiceDocumentData;
};

const downloadPdfClassName =
  "invoice-download-button inline-flex h-12 w-12 items-center justify-center rounded-full text-white disabled:cursor-not-allowed disabled:opacity-60";

function filenameForInvoice(invoiceNumber: string): string {
  const safeInvoiceNumber = invoiceNumber.replace(/[^a-zA-Z0-9._-]/g, "-");

  return `invoice-${safeInvoiceNumber || "clio"}.pdf`;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

async function logInvoiceDownload(invoice: InvoiceDocumentData): Promise<void> {
  await fetch(
    `/api/invoices/${encodeURIComponent(invoice.clioBillId)}/download-log`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clioMatterId: invoice.clioMatterId,
        invoiceNumber: invoice.invoiceNumber,
      }),
    },
  );
}

function DownloadIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

export function InvoicePdfActions({ invoice }: InvoicePdfActionsProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleDownloadPdf(): Promise<void> {
    setIsDownloading(true);
    setErrorMessage(null);

    try {
      const { renderInvoicePdfBlob } = await import(
        "@/components/invoice/InvoicePdfDocument"
      );
      const blob = await renderInvoicePdfBlob(invoice);
      await logInvoiceDownload(invoice).catch(() => undefined);
      downloadBlob(blob, filenameForInvoice(invoice.invoiceNumber));
    } catch (error) {
      console.error("Client PDF generation failed", error);
      setErrorMessage("Unable to generate the PDF in this browser.");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="relative flex items-center">
      <button
        aria-label={isDownloading ? "Downloading PDF" : "Download PDF"}
        className={downloadPdfClassName}
        disabled={isDownloading}
        onClick={() => void handleDownloadPdf()}
        title={isDownloading ? "Downloading PDF" : "Download PDF"}
        type="button"
      >
        <DownloadIcon />
      </button>
      {errorMessage ? (
        <p className="absolute right-0 top-14 w-64 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900 shadow-sm">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
