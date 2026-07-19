import { InvoicePdfActions } from "@/components/invoice/InvoicePdfActions";
import { InvoicePreview } from "@/components/invoice/InvoicePreview";
import { InvoiceWorkspacePendingPreview } from "@/app/invoices/_components/InvoiceWorkspacePendingPreview";
import type { InvoiceDocumentData } from "@/lib/invoice-document";

type InvoiceWorkspaceProps = {
  connectionMessage: string | null;
  connectionReason?: string | null;
  isConnected: boolean;
  selectedBillId: string;
  selectedInvoice: InvoiceDocumentData | null;
  selectedInvoiceError: string | null;
};

export function InvoiceWorkspace({
  connectionMessage,
  connectionReason,
  isConnected,
  selectedBillId,
  selectedInvoice,
  selectedInvoiceError,
}: InvoiceWorkspaceProps) {
  const disconnectedMessage = [
    connectionMessage,
    connectionReason,
    "Connect to Clio to load bills from your account.",
  ]
    .filter((message): message is string => Boolean(message))
    .join(" ");

  return (
    <section className="invoice-workspace min-w-0">
      <InvoiceWorkspacePendingPreview selectedBillId={selectedBillId}>
        {isConnected && selectedInvoice ? (
          <div className="invoice-workspace-toolbar screen-only">
            <div className="selected-invoice-badge">
              <span>Invoice</span>
              <strong>{selectedInvoice.invoiceNumber}</strong>
            </div>
            <div className="invoice-download-float">
              <InvoicePdfActions invoice={selectedInvoice} />
            </div>
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
                  ? disconnectedMessage
                  : selectedInvoiceError ??
                    "Choose a bill from the list to preview the invoice and use the PDF actions."}
              </p>
            </div>
          </div>
        )}
      </InvoiceWorkspacePendingPreview>
    </section>
  );
}
