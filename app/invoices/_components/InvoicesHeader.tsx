import { ClioConnectionActions } from "@/app/invoices/_components/ClioConnectionActions";

type InvoicesHeaderProps = {
  connectionStatus: {
    connected: boolean;
    user?: {
      name: string;
    };
  };
};

export function InvoicesHeader({ connectionStatus }: InvoicesHeaderProps) {
  return (
    <header className="app-topbar screen-only px-6 py-3 sm:px-8">
      <div className="flex flex-col justify-between gap-3 xl:flex-row xl:items-center">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--jema-cranberry)]">
            Clio billing
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-normal text-[var(--jema-navy)]">
            Invoice generator
          </h1>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <ClioConnectionActions connectionStatus={connectionStatus} />
        </div>
      </div>
    </header>
  );
}
