import { InvoicePreview } from "@/components/invoice/InvoicePreview";
import { getBillDetail } from "@/lib/clio-bills";
import { toInvoiceDocumentData } from "@/lib/invoice-document";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Invoice Preview",
};

type InvoicePreviewPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function InvoicePreviewPage({
  params,
}: InvoicePreviewPageProps) {
  const { id } = await params;
  const bill = await getBillDetail(id);

  if (!bill) {
    notFound();
  }

  const invoice = toInvoiceDocumentData(bill);

  return (
    <main className="min-h-dvh bg-slate-200 text-slate-950">
      <div className="screen-only mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-6 sm:px-10">
        <Link
          className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          href={`/invoices/${id}`}
        >
          Back
        </Link>
        <Link
          className="inline-flex h-11 items-center justify-center rounded-md bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
          href={`/invoices/${id}/pdf`}
          target="_blank"
        >
          Open PDF
        </Link>
      </div>

      <div className="invoice-preview-shell px-4 pb-10">
        <InvoicePreview invoice={invoice} />
      </div>
    </main>
  );
}
