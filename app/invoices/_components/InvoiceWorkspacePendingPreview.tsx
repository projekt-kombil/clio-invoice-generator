"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

export const invoicePreviewLoadingEvent = "invoice-preview-loading";

function scrollWorkspaceToTop() {
  document
    .querySelector(".invoice-workspace")
    ?.scrollTo({ behavior: "smooth", top: 0 });
}

function SkeletonLine({ className = "" }: { className?: string }) {
  return <span className={`loading-skeleton block ${className}`} />;
}

function PendingInvoicePreview() {
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

type InvoiceWorkspacePendingPreviewProps = {
  children: ReactNode;
  selectedBillId: string;
};

type PendingBill = {
  billId: string;
  startedFromBillId: string;
};

export function InvoiceWorkspacePendingPreview({
  children,
  selectedBillId,
}: InvoiceWorkspacePendingPreviewProps) {
  const [pendingBill, setPendingBill] = useState<PendingBill | null>(null);

  useEffect(() => {
    function handleLoadingEvent(event: Event) {
      const detail = (event as CustomEvent<{ billId?: string }>).detail;

      if (detail?.billId) {
        scrollWorkspaceToTop();
        setPendingBill({
          billId: detail.billId,
          startedFromBillId: selectedBillId,
        });
      }
    }

    window.addEventListener(invoicePreviewLoadingEvent, handleLoadingEvent);

    return () => {
      window.removeEventListener(invoicePreviewLoadingEvent, handleLoadingEvent);
    };
  }, [selectedBillId]);

  if (
    !pendingBill ||
    pendingBill.billId === selectedBillId ||
    pendingBill.startedFromBillId !== selectedBillId
  ) {
    return <>{children}</>;
  }

  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="invoice-workspace-pending-preview screen-only"
      role="status"
    >
      <span className="sr-only">Loading invoice preview</span>
      <div className="invoice-preview-shell invoice-split-preview px-4 py-8">
        <PendingInvoicePreview />
      </div>
    </div>
  );
}
