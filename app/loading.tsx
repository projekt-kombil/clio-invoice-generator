function SkeletonLine({ className = "" }: { className?: string }) {
  return <span className={`loading-skeleton block ${className}`} />;
}

function LoadingBillCard() {
  return (
    <div className="rounded-md border border-slate-300 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <SkeletonLine className="h-4 w-24" />
        <SkeletonLine className="h-3 w-14" />
      </div>
      <SkeletonLine className="mt-3 h-4 w-40" />
      <div className="mt-4 grid grid-cols-2 gap-2">
        <SkeletonLine className="h-9" />
        <SkeletonLine className="h-9" />
      </div>
    </div>
  );
}

function LoadingInvoicePreview() {
  return (
    <div className="invoice-loading-page">
      <div className="flex items-start justify-between gap-12">
        <div className="w-2/3">
          <SkeletonLine className="h-12 w-full" />
          <SkeletonLine className="mt-5 h-3 w-48" />
          <SkeletonLine className="mt-2 h-3 w-64" />
        </div>
        <div className="w-32">
          <SkeletonLine className="h-5 w-full" />
          <SkeletonLine className="mt-4 h-20 w-full" />
        </div>
      </div>

      <div className="mt-14 grid grid-cols-2 gap-10">
        <SkeletonLine className="h-32" />
        <SkeletonLine className="h-32" />
      </div>

      <SkeletonLine className="mt-12 h-4 w-56" />
      <div className="mt-4 grid gap-2">
        {Array.from({ length: 7 }, (_, index) => (
          <SkeletonLine className="h-8" key={index} />
        ))}
      </div>

      <div className="mt-10 ml-auto w-72">
        <SkeletonLine className="h-8" />
        <SkeletonLine className="mt-2 h-8" />
        <SkeletonLine className="mt-2 h-10" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <main className="invoice-app-shell flex min-h-dvh flex-col text-slate-950">
      <div className="flex min-h-dvh flex-col overflow-hidden">
        <header className="app-topbar screen-only px-6 py-3 sm:px-8">
          <div className="flex flex-col justify-between gap-3 xl:flex-row xl:items-center">
            <div>
              <SkeletonLine className="h-3 w-28" />
              <SkeletonLine className="mt-3 h-7 w-56" />
            </div>
            <SkeletonLine className="h-10 w-36 rounded-md" />
          </div>
        </header>

        <div className="invoice-app-grid grid flex-1 grid-cols-1 xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="invoice-sidebar screen-only border-b border-slate-300 bg-white xl:border-b-0 xl:border-r">
            <div className="invoice-sidebar-content flex h-full flex-col gap-5 p-5">
              <div className="invoice-search-form flex flex-col gap-2">
                <SkeletonLine className="h-4 w-28" />
                <SkeletonLine className="h-[42px] rounded-md" />
                <SkeletonLine className="h-[42px] rounded-md" />
              </div>
              <div className="invoice-bills-section flex min-h-0 flex-1 flex-col gap-2">
                <SkeletonLine className="h-3 w-16" />
                <div className="invoice-bill-list flex min-h-0 w-full flex-1 flex-col gap-2">
                  {Array.from({ length: 5 }, (_, index) => (
                    <LoadingBillCard key={index} />
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <section className="invoice-workspace min-w-0">
            <div className="invoice-preview-shell invoice-split-preview px-4 py-8">
              <LoadingInvoicePreview />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
