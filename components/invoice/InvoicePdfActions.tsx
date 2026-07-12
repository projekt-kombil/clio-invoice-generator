type InvoicePdfActionsProps = {
  billId: string | number;
};

const openPdfClassName =
  "inline-flex h-11 items-center justify-center rounded-md bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800";
const downloadPdfClassName =
  "inline-flex h-11 items-center justify-center rounded-md border border-slate-300 px-5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50";

export function InvoicePdfActions({ billId }: InvoicePdfActionsProps) {
  const pdfHref = `/invoices/${billId}/pdf`;

  return (
    <>
      <a className={openPdfClassName} href={pdfHref} rel="noreferrer" target="_blank">
        Open PDF
      </a>
      <a className={downloadPdfClassName} href={`${pdfHref}?download=1`}>
        Download PDF
      </a>
    </>
  );
}
