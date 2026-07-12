import type { InvoiceDocumentData } from "@/lib/invoice-document/types";

export function shouldShowDraftWatermark(
  invoice: Pick<InvoiceDocumentData, "status">,
): boolean {
  return invoice.status?.toLowerCase().includes("draft") ?? false;
}
