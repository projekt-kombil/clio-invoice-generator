"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

type InvoiceSearchFormProps = {
  disabled: boolean;
  query: string;
};

function ResetIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-7"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 20a8 8 0 1 1 4.7-14.47l-1.42 1.42A6 6 0 1 0 17.9 11h2.03A8 8 0 0 1 12 20Z" />
      <path d="M18.1 3.25h2.65v6.15H14.6V6.75h2.2l1.3-1.3z" />
    </svg>
  );
}

export function InvoiceSearchForm({
  disabled,
  query,
}: InvoiceSearchFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<"search" | "reset" | null>(
    null,
  );
  const isDisabled = disabled || isPending;
  const isResetDisabled = disabled || (isPending && pendingAction === "reset");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (disabled) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const nextQuery = String(formData.get("q") ?? "").trim();
    const href = nextQuery ? `/?q=${encodeURIComponent(nextQuery)}` : "/";

    setPendingAction("search");
    startTransition(() => {
      router.push(href);
    });
  }

  function handleReset() {
    if (isResetDisabled) {
      return;
    }

    setPendingAction("reset");
    startTransition(() => {
      router.push("/");
    });
  }

  return (
    <form
      action="/"
      className="invoice-search-form flex flex-col gap-2"
      method="get"
      onSubmit={handleSubmit}
    >
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-semibold text-[var(--jema-navy)]" htmlFor="q">
          Search invoices
        </label>
        <button
          aria-label="Refresh invoice list"
          className="disconnect-button search-reset-button inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-[var(--jema-navy)] disabled:cursor-not-allowed disabled:opacity-45"
          disabled={isResetDisabled}
          onClick={handleReset}
          title="Refresh"
          type="button"
        >
          {isPending && pendingAction === "reset" ? (
            <span aria-hidden="true" className="loading-spinner" />
          ) : (
            <ResetIcon />
          )}
        </button>
      </div>
      <div className="flex flex-col gap-2">
        <input
          className="invoice-search-control invoice-search-input min-w-0 border px-3 text-sm text-slate-950 outline-none"
          defaultValue={query}
          disabled={isDisabled}
          id="q"
          name="q"
          placeholder="Invoice number, client, or status"
          type="search"
        />
        <button
          className="invoice-search-control invoice-search-button inline-flex items-center justify-center gap-2 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={isDisabled}
          type="submit"
        >
          {isPending && pendingAction === "search" ? (
            <span aria-hidden="true" className="loading-spinner" />
          ) : null}
          {isPending && pendingAction === "search" ? "Searching" : "Search"}
        </button>
      </div>
    </form>
  );
}
