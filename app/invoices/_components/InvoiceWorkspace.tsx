import { InvoicePdfActions } from "@/components/invoice/InvoicePdfActions";
import { InvoicePreview } from "@/components/invoice/InvoicePreview";
import type { InvoiceDocumentData } from "@/lib/invoice-document";

type InvoiceWorkspaceProps = {
  isConnected: boolean;
  selectedBillId: string;
  selectedInvoice: InvoiceDocumentData | null;
  selectedInvoiceError: string | null;
};

export function InvoiceWorkspace({
  isConnected,
  selectedBillId,
  selectedInvoice,
  selectedInvoiceError,
}: InvoiceWorkspaceProps) {
  return (
    <section className="min-w-0 bg-slate-200">
      {isConnected && selectedBillId ? (
        <div className="screen-only flex flex-wrap items-center justify-between gap-3 border-b border-slate-300 bg-slate-100 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Selected invoice
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-950">
              {selectedInvoice?.invoiceNumber ?? selectedBillId}
            </p>
          </div>
          {selectedInvoice ? <InvoicePdfActions invoice={selectedInvoice} /> : null}
        </div>
      ) : null}

      {selectedInvoice ? (
        <div className="invoice-preview-shell invoice-split-preview px-4 py-8">
          <InvoicePreview invoice={selectedInvoice} />
        </div>
      ) : (
        <div className="screen-only flex min-h-[55dvh] items-center justify-center px-6 py-12">
          <div className="max-w-md rounded-md border border-slate-300 bg-white p-6 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">
              {!isConnected
                ? "Connect to Clio"
                : selectedInvoiceError
                  ? "Invoice unavailable"
                  : "Select a bill"}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {!isConnected
                ? "Once connected, your bill list will appear on the left and the selected invoice will appear here."
                : selectedInvoiceError ??
                  "Choose a bill from the list to preview the invoice and use the PDF actions."}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
