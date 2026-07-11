import { getBillDetail } from "@/lib/clio-bills";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type BillDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatValue(value: string | number | null): string {
  if (value === null) {
    return "Not shown";
  }

  return String(value);
}

function formatDate(value: string | null): string {
  return value ?? "No date";
}

export default async function BillDetailPage({ params }: BillDetailPageProps) {
  const { id } = await params;
  const bill = await getBillDetail(id);

  if (!bill) {
    notFound();
  }

  return (
    <main className="flex min-h-dvh flex-col bg-slate-100 text-slate-950">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-10 sm:px-10">
        <header className="mb-10 border-b border-slate-300 pb-6">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
            Bill detail
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal text-slate-950">
            Invoice {bill.number}
          </h1>
        </header>

        <section className="rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  {bill.clientName ?? "No client"}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Status: {bill.state ?? "Not shown"}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 px-5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                  href="/invoices"
                >
                  Back
                </Link>
                <Link
                  className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 px-5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                  href={`/invoices/${bill.id}/preview`}
                >
                  Preview invoice
                </Link>
                <Link
                  className="inline-flex h-11 items-center justify-center rounded-md bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  href={`/invoices/${bill.id}/pdf`}
                  target="_blank"
                >
                  Open PDF
                </Link>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <dl className="grid gap-3 rounded-md border border-slate-200 p-4">
                <div className="flex justify-between gap-4">
                  <dt className="text-sm text-slate-500">Issued</dt>
                  <dd className="text-sm font-medium text-slate-950">
                    {formatDate(bill.issuedAt)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-sm text-slate-500">Due</dt>
                  <dd className="text-sm font-medium text-slate-950">
                    {formatDate(bill.dueAt)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-sm text-slate-500">Kind</dt>
                  <dd className="text-sm font-medium text-slate-950">
                    {bill.kind ?? "Not shown"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-sm text-slate-500">Purchase order</dt>
                  <dd className="text-sm font-medium text-slate-950">
                    {bill.purchaseOrder ?? "Not shown"}
                  </dd>
                </div>
              </dl>

              <dl className="grid gap-3 rounded-md border border-slate-200 p-4">
                <div className="flex justify-between gap-4">
                  <dt className="text-sm text-slate-500">Total</dt>
                  <dd className="text-sm font-medium text-slate-950">
                    {formatValue(bill.total)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-sm text-slate-500">Paid</dt>
                  <dd className="text-sm font-medium text-slate-950">
                    {formatValue(bill.paid)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-sm text-slate-500">Tax</dt>
                  <dd className="text-sm font-medium text-slate-950">
                    {formatValue(bill.taxSum)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-sm text-slate-500">Balance</dt>
                  <dd className="text-sm font-semibold text-slate-950">
                    {formatValue(bill.balance)}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-950">Matters</h2>
              <div className="mt-3 rounded-md border border-slate-300">
                {bill.matters.length > 0 ? (
                  bill.matters.map((matter) => (
                    <div className="border-t border-slate-200 p-4 first:border-t-0" key={matter.id}>
                      <p className="font-semibold text-slate-950">
                        {matter.displayNumber ?? matter.number ?? matter.id}
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        {matter.description ?? "No matter description"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="p-4 text-sm text-slate-700">
                    No matters were returned for this bill.
                  </p>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-950">Line items</h2>
              <div className="mt-3 overflow-hidden rounded-md border border-slate-300">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Date</th>
                      <th className="px-4 py-3 font-semibold">Type</th>
                      <th className="px-4 py-3 font-semibold">Description</th>
                      <th className="px-4 py-3 font-semibold">Qty</th>
                      <th className="px-4 py-3 font-semibold">Price</th>
                      <th className="px-4 py-3 font-semibold">Tax</th>
                      <th className="px-4 py-3 font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bill.lineItems.length > 0 ? (
                      bill.lineItems.map((item) => (
                        <tr className="border-t border-slate-200" key={item.id}>
                          <td className="px-4 py-3 text-slate-700">
                            {formatDate(item.date)}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {item.kind ?? "Not shown"}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            <span className="font-medium text-slate-950">
                              {item.description ?? "No description"}
                            </span>
                            {item.note ? (
                              <span className="mt-1 block text-slate-600">
                                {item.note}
                              </span>
                            ) : null}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {formatValue(item.quantity)}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {formatValue(item.price)}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {formatValue(item.tax)}
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-950">
                            {formatValue(item.total)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-4 py-3 text-slate-700" colSpan={7}>
                          No line items were returned for this bill.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
