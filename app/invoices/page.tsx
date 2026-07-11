import { searchBills } from "@/lib/clio-bills";
import type { BillListItem } from "@/lib/clio-bills";
import Link from "next/link";

export const dynamic = "force-dynamic";

type InvoicesPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

function formatDisplayDate(value: string | null): string {
  if (!value) {
    return "No date";
  }

  return value;
}

function formatMoney(value: string | number | null): string {
  if (value === null) {
    return "Not shown";
  }

  return String(value);
}

export default async function InvoicesPage({ searchParams }: InvoicesPageProps) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  let bills: BillListItem[] = [];
  let errorMessage: string | null = null;

  try {
    bills = await searchBills(query);
  } catch {
    errorMessage = "Unable to load bills from Clio. Check the connection and try again.";
  }

  return (
    <main className="flex min-h-dvh flex-col bg-slate-100 text-slate-950">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-10 sm:px-10">
        <header className="mb-10 border-b border-slate-300 pb-6">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
            Clio billing
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal text-slate-950">
            Invoice search
          </h1>
        </header>

        <section className="rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <form className="flex w-full max-w-xl flex-col gap-2" action="/invoices">
                <label className="text-sm font-semibold text-slate-800" htmlFor="q">
                  Search invoices
                </label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    className="h-11 min-w-0 flex-1 rounded-md border border-slate-300 px-3 text-sm text-slate-950 outline-none transition focus:border-slate-500"
                    defaultValue={query}
                    id="q"
                    name="q"
                    placeholder="Invoice number, client, or status"
                    type="search"
                  />
                  <button
                    className="inline-flex h-11 items-center justify-center rounded-md bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
                    type="submit"
                  >
                    Search
                  </button>
                </div>
              </form>

              <Link
                className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 px-5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                href="/"
              >
                Back
              </Link>
            </div>

            {errorMessage ? (
              <p className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {errorMessage}
              </p>
            ) : null}

            {!errorMessage && bills.length === 0 ? (
              <p className="rounded-md border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                No bills were returned from Clio for this search.
              </p>
            ) : null}

            {bills.length > 0 ? (
              <div className="overflow-hidden rounded-md border border-slate-300">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Invoice</th>
                      <th className="px-4 py-3 font-semibold">Client</th>
                      <th className="px-4 py-3 font-semibold">Issued</th>
                      <th className="px-4 py-3 font-semibold">Total</th>
                      <th className="px-4 py-3 font-semibold">Balance</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map((bill) => (
                      <tr className="border-t border-slate-200" key={bill.id}>
                        <td className="px-4 py-3 font-semibold text-slate-950">
                          <Link
                            className="underline-offset-4 hover:underline"
                            href={`/invoices/${bill.id}`}
                          >
                            {bill.number}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {bill.clientName ?? "No client"}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {formatDisplayDate(bill.issuedAt)}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {formatMoney(bill.total)}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {formatMoney(bill.balance)}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {bill.state ?? "Not shown"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
