import type { InvoiceDocumentData } from "@/lib/invoice-document/types";

export function getInvoiceStatusWatermark(
  invoice: Pick<InvoiceDocumentData, "status">,
): string | null {
  const status = invoice.status?.toLowerCase() ?? "";

  if (status.includes("void")) {
    return "Void";
  }

  if (status.includes("draft")) {
    return "Draft";
  }

  return null;
}

export function shouldShowDraftWatermark(
  invoice: Pick<InvoiceDocumentData, "status">,
): boolean {
  return getInvoiceStatusWatermark(invoice) === "Draft";
}
