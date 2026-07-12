"use client";

import { useState } from "react";

import type { InvoiceDocumentData } from "@/lib/invoice-document";

type InvoicePdfActionsProps = {
  invoice: InvoiceDocumentData;
};

type PdfAction = "open" | "download";

const openPdfClassName =
  "inline-flex h-11 items-center justify-center rounded-md bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400";
const downloadPdfClassName =
  "inline-flex h-11 items-center justify-center rounded-md border border-slate-300 px-5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400";

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

function openBlob(blob: Blob, openedWindow: Window | null): void {
  const url = URL.createObjectURL(blob);

  if (openedWindow) {
    openedWindow.location.href = url;
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function InvoicePdfActions({ invoice }: InvoicePdfActionsProps) {
  const [busyAction, setBusyAction] = useState<PdfAction | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isBusy = busyAction !== null;

  async function handlePdfAction(action: PdfAction): Promise<void> {
    const openedWindow =
      action === "open" ? window.open("", "_blank", "noopener,noreferrer") : null;

    setBusyAction(action);
    setErrorMessage(null);

    try {
      const { renderInvoicePdfBlob } = await import(
        "@/components/invoice/InvoicePdfDocument"
      );
      const blob = await renderInvoicePdfBlob(invoice);

      if (action === "open") {
        openBlob(blob, openedWindow);
      } else {
        downloadBlob(blob, filenameForInvoice(invoice.invoiceNumber));
      }
    } catch (error) {
      console.error("Client PDF generation failed", error);
      openedWindow?.close();
      setErrorMessage("Unable to generate the PDF in this browser.");
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        className={openPdfClassName}
        disabled={isBusy}
        onClick={() => void handlePdfAction("open")}
        type="button"
      >
        {busyAction === "open" ? "Opening..." : "Open PDF"}
      </button>
      <button
        className={downloadPdfClassName}
        disabled={isBusy}
        onClick={() => void handlePdfAction("download")}
        type="button"
      >
        {busyAction === "download" ? "Downloading..." : "Download PDF"}
      </button>
      {errorMessage ? (
        <p className="basis-full text-sm font-medium text-amber-800">{errorMessage}</p>
      ) : null}
    </div>
  );
}
